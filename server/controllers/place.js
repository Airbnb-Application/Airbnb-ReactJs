const Place = require("../models/place");
const aes256 = require("../utils/aes-crypto");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const { imageUpload, imageDelete } = require("../utils/upload-image");
const Reservation = require("../models/reservation");
const mongoose = require("mongoose");

/**
 * Lấy danh sách các địa điểm theo bộ lọc
 */
exports.getPlaces = async (req, res, next) => {
  const {
    roomCount,
    bathroomCount,
    guestCount,
    locationValue,
    startDate,
    endDate,
    category,
    amenities,
    minPrice,
    maxPrice,
    placeOwner,
  } = req.query;

  try {
    // Xây dựng query
    let query = { status: "active" }; // Chỉ lấy các địa điểm active
    if (placeOwner) {
      if (!req.userId) {
        const error = new Error(
          "User ID is required to filter by place owner."
        );
        error.statusCode = 400;
        throw error;
      }
      // check if admin will get all places
      const user = await User.findById(req.userId);
      if (user.role !== "admin") {
        query.userId = req.userId;
      }
      delete query.status;
    }

    // Các bộ lọc cơ bản
    if (roomCount) query.roomCount = parseInt(roomCount, 10);
    if (bathroomCount) query.bathroomCount = parseInt(bathroomCount, 10);
    if (guestCount) query.guestCapacity = { $gte: parseInt(guestCount, 10) };
    if (locationValue) query.locationValue = locationValue;
    if (category) query.category = category;

    // Lọc theo khoảng giá
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice, 10);
      if (maxPrice) query.price.$lte = parseInt(maxPrice, 10);
    }

    // Lọc theo tiện nghi
    if (amenities) {
      const amenityList = Array.isArray(amenities) ? amenities : [amenities];
      amenityList.forEach((amenity) => {
        if (amenity && typeof amenity === "string") {
          query[`amenities.${amenity}`] = true;
        }
      });
    }

    // Kiểm tra phòng có sẵn trong khoảng thời gian đã chọn
    if (startDate && endDate) {
      // Tìm tất cả các đặt phòng trong khoảng thời gian này
      const reservations = await Reservation.find({
        status: { $in: ["pending", "paid"] },
        $or: [
          // Đặt phòng bắt đầu trong thời gian đã chọn
          { startDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
          // Đặt phòng kết thúc trong thời gian đã chọn
          { endDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
          // Đặt phòng bao gồm toàn bộ thời gian đã chọn
          {
            startDate: { $lte: new Date(startDate) },
            endDate: { $gte: new Date(endDate) },
          },
        ],
      });

      // Loại bỏ các địa điểm đã có đặt phòng
      const reservedPlaceIds = reservations.map(
        (reservation) => reservation.placeId
      );
      if (reservedPlaceIds.length > 0) {
        query._id = { $nin: reservedPlaceIds };
      }
    }

    // Thực hiện truy vấn với sắp xếp
    let places;
    if (placeOwner) {
      // use placeSchema.statics.findByFilters declared in place model
      places = await Place.findWithInactive(query, null, {
        sort: { createdAt: -1 },
      });
    } else {
      places = await Place.find(query, null, { sort: { createdAt: -1 } });
    }

    // Tăng số lượt xem cho các địa điểm nếu không phải là truy vấn lọc nâng cao
    if (!roomCount && !bathroomCount && !guestCount && !startDate && !endDate) {
      const placeIds = places.map((place) => place._id);
      // Cập nhật số lượt xem mà không cần đợi
      Place.updateMany(
        { _id: { $in: placeIds } },
        { $inc: { "stats.viewCount": 1 } }
      ).exec();
    }

    // Mã hóa ID và format dữ liệu
    const placesFormatted = places.map((place) => {
      return {
        _id: aes256.encryptData(place._id.toString()),
        title: place.title,
        imageSrc: place.imageSrc,
        price: place.price,
        locationValue: place.locationValue,
        category: place.category,
        roomCount: place.roomCount,
        bathroomCount: place.bathroomCount,
        guestCapacity: place.guestCapacity,
        // Thêm thông tin thống kê
        stats: place.stats || {
          viewCount: 0,
          reservationCount: 0,
          favoriteCount: 0,
        },
      };
    });

    res.status(200).json({
      message: "Fetched places successfully.",
      places: placesFormatted,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Lấy chi tiết một địa điểm
 */
exports.getPlace = async (req, res, next) => {
  try {
    const placeId = aes256.decryptData(req.params.placeId.toString());
    if (!placeId) {
      const error = new Error("Place ID is missing or invalid.");
      error.statusCode = 404;
      throw error;
    }

    // Chỉ lấy địa điểm đang hoạt động, trừ khi có query để xem tất cả
    const query = { _id: placeId };
    if (!req.query.includeInactive) {
      query.status = "active";
    }

    let place;
    if (req.query.includeInactive) {
      place = await Place.findOneWithInactive(query)
        .populate("userId", "name image email")
        .populate({
          path: "reservations",
          match: { status: { $in: ["pending", "paid"] } }, // Chỉ lấy đặt phòng chưa hoàn thành
        });
    } else {
      place = await Place.findOne(query)
        .populate("userId", "name image email")
        .populate({
          path: "reservations",
          match: { status: { $in: ["pending", "paid"] } }, // Chỉ lấy đặt phòng chưa hoàn thành
        });
    }

    if (!place) {
      const error = new Error("Could not find place or it is not active.");
      error.statusCode = 404;
      throw error;
    }

    // Tăng số lượt xem
    place.stats.viewCount = (place.stats.viewCount || 0) + 1;
    await place.save();

    // Format dữ liệu đặt phòng đã được book
    const bookedDate = place.reservations.map((reservation) => {
      return {
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        status: reservation.status,
      };
    });

    // Format dữ liệu trả về
    const placeFormatted = {
      _id: aes256.encryptData(place._id.toString()),
      title: place.title,
      description: place.description,
      imageSrc: place.imageSrc,
      category: place.category,
      roomCount: place.roomCount,
      bathroomCount: place.bathroomCount,
      guestCapacity: place.guestCapacity,
      locationValue: place.locationValue,
      price: place.price,
      status: place.status,
      statusUpdatedAt: place.statusUpdatedAt,
      amenities: place.amenities,
      reservedDate: bookedDate,
      creator: {
        name: place.userId.name,
        image: place.userId.image,
        email: place.userId.email,
      },
      stats: place.stats || {
        viewCount: 0,
        reservationCount: 0,
        favoriteCount: 0,
      },
    };

    res.status(200).json({
      message: "Place fetched.",
      place: placeFormatted,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Tạo địa điểm mới
 */
exports.createPlace = async (req, res, next) => {
  const err = validationResult(req);

  try {
    if (!err.isEmpty()) {
      const errs = new Error("Validation failed, entered data is incorrect!");
      errs.statusCode = 422;
      errs.data = err.array();
      throw errs;
    }

    // Kiểm tra người dùng có active không
    const user = await User.findById(req.userId);
    if (!user || user.status !== "active") {
      const error = new Error("User account is not active.");
      error.statusCode = 403;
      throw error;
    }

    // Lấy dữ liệu từ request
    const {
      title,
      description,
      imageSrc,
      category,
      roomCount,
      bathroomCount,
      guestCapacity,
      location,
      price,
      amenities,
    } = req.body;

    if (!imageSrc) {
      const error = new Error("Image source is missing.");
      error.statusCode = 422;
      throw error;
    }

    // Upload ảnh
    const uploadResponse = await imageUpload(imageSrc, "airbnb_place");
    if (!uploadResponse) {
      const error = new Error("Image upload failed.");
      error.statusCode = 422;
      throw error;
    }

    // Tạo session transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Tạo place mới
      const place = new Place({
        title,
        description,
        imageSrc: uploadResponse.secureUrl,
        imagePublicId: uploadResponse.publicId,
        category,
        roomCount: parseInt(roomCount, 10),
        bathroomCount: parseInt(bathroomCount, 10),
        guestCapacity: parseInt(guestCapacity, 10),
        locationValue: location,
        price: parseInt(price, 10),
        amenities,
        userId: req.userId,
        status: "active",
        statusUpdatedAt: Date.now(),
        stats: {
          viewCount: 0,
          reservationCount: 0,
          favoriteCount: 0,
        },
      });

      // Lưu place
      await place.save({ session });

      // Cập nhật danh sách place của user
      user.places.push(place);
      await user.save({ session });

      await session.commitTransaction();

      // Format dữ liệu trả về
      const placeFormatted = {
        _id: aes256.encryptData(place._id.toString()),
        title: place.title,
        description: place.description,
        imageSrc: place.imageSrc,
        category: place.category,
        roomCount: place.roomCount,
        bathroomCount: place.bathroomCount,
        guestCapacity: place.guestCapacity,
        locationValue: place.locationValue,
        price: place.price,
        amenities: place.amenities,
        status: place.status,
      };

      res.status(201).json({
        message: "Place created successfully!",
        place: placeFormatted,
      });
    } catch (error) {
      await session.abortTransaction();

      // Nếu có lỗi, xóa ảnh đã upload
      if (uploadResponse && uploadResponse.publicId) {
        await imageDelete(uploadResponse.publicId);
      }

      throw error;
    } finally {
      session.endSession();
    }
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Cập nhật thông tin địa điểm
 */
exports.updatePlace = async (req, res, next) => {
  const placeId = aes256.decryptData(req.params.placeId);
  const err = validationResult(req);

  try {
    if (!err.isEmpty()) {
      const errs = new Error("Validation failed, entered data is incorrect!");
      errs.statusCode = 422;
      errs.data = err.array();
      throw errs;
    }

    // Lấy dữ liệu từ request
    const {
      title,
      description,
      imageSrc,
      category,
      roomCount,
      bathroomCount,
      guestCapacity,
      location,
      price,
      amenities,
    } = req.body;

    // Tìm địa điểm và kiểm tra quyền truy cập
    const place = await Place.findById(placeId);

    if (!place) {
      const error = new Error("Could not find place.");
      error.statusCode = 404;
      throw error;
    }

    // Kiểm tra quyền truy cập
    const user = await User.findById(req.userId);
    if (
      place.userId.toString() !== req.userId.toString() &&
      user.role !== "admin"
    ) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }

    // Xử lý hình ảnh nếu có
    let newImagePublicId = place.imagePublicId;
    let newImageSrc = place.imageSrc;

    if (imageSrc && imageSrc !== place.imageSrc) {
      const uploadResponse = await imageUpload(imageSrc, "airbnb_place");
      if (!uploadResponse) {
        const error = new Error("Image upload failed.");
        error.statusCode = 422;
        throw error;
      }

      // Xóa ảnh cũ
      await imageDelete(place.imagePublicId);

      newImageSrc = uploadResponse.secureUrl;
      newImagePublicId = uploadResponse.publicId;
    }

    // Cập nhật thông tin
    place.title = title || place.title;
    place.description = description || place.description;
    place.imageSrc = newImageSrc;
    place.imagePublicId = newImagePublicId;
    place.category = category || place.category;
    place.roomCount = roomCount ? parseInt(roomCount, 10) : place.roomCount;
    place.bathroomCount = bathroomCount
      ? parseInt(bathroomCount, 10)
      : place.bathroomCount;
    place.guestCapacity = guestCapacity
      ? parseInt(guestCapacity, 10)
      : place.guestCapacity;
    place.locationValue = location || place.locationValue;
    place.price = price ? parseInt(price, 10) : place.price;

    // Cập nhật tiện nghi
    if (amenities) {
      place.amenities = {
        ...place.amenities,
        ...amenities,
      };
    }

    const result = await place.save();

    // Format dữ liệu trả về
    const placeFormatted = {
      _id: aes256.encryptData(result._id.toString()),
      title: result.title,
      description: result.description,
      imageSrc: result.imageSrc,
      category: result.category,
      roomCount: result.roomCount,
      bathroomCount: result.bathroomCount,
      guestCapacity: result.guestCapacity,
      locationValue: result.locationValue,
      price: result.price,
      amenities: result.amenities,
      status: result.status,
    };

    res.status(200).json({
      message: "Place updated!",
      place: placeFormatted,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Xóa địa điểm (soft delete)
 */
exports.deletePlace = async (req, res, next) => {
  const placeId = aes256.decryptData(req.params.placeId);

  try {
    const place = await Place.findById(placeId);

    if (!place) {
      const error = new Error("Could not find place.");
      error.statusCode = 404;
      throw error;
    }

    // Kiểm tra quyền truy cập
    const user = await User.findById(req.userId);
    if (
      place.userId.toString() !== req.userId.toString() &&
      user.role !== "admin"
    ) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }

    // Thay vì xóa, cập nhật trạng thái thành inactive
    place.status = "inactive";
    place.statusReason = "Deleted by user";
    place.statusUpdatedAt = Date.now();

    await place.save();

    res.status(200).json({
      message: "Place deactivated.",
      placeId: aes256.encryptData(place._id.toString()),
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Lấy danh sách địa điểm của người dùng
 */
exports.getUserPlaces = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    if (user.status !== "active") {
      const error = new Error("User account is not active.");
      error.statusCode = 403;
      throw error;
    }

    // Populate danh sách địa điểm của người dùng hiện tại
    await user.populate({
      path: "places",
      options: { sort: { createdAt: -1 } },
    });

    // Format dữ liệu trả về
    const placesFormatted = user.places.map((place) => ({
      _id: aes256.encryptData(place._id.toString()),
      title: place.title,
      description: place.description,
      imageSrc: place.imageSrc,
      category: place.category,
      price: place.price,
      locationValue: place.locationValue,
      status: place.status,
      stats: place.stats || {
        viewCount: 0,
        reservationCount: 0,
        favoriteCount: 0,
      },
    }));

    res.status(200).json({
      message: "User places fetched.",
      places: placesFormatted,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Cập nhật trạng thái địa điểm
 */
exports.updatePlaceStatus = async (req, res, next) => {
  try {
    const placeId = aes256.decryptData(req.params.placeId);
    const { status, reason } = req.body;

    // Kiểm tra trạng thái hợp lệ
    const validStatuses = [
      "active",
      "inactive",
      "maintenance",
      "pending",
      "blocked",
    ];
    if (!validStatuses.includes(status)) {
      const error = new Error("Invalid status.");
      error.statusCode = 400;
      throw error;
    }

    const place = await Place.findOneWithInactive({ _id: placeId });

    if (!place) {
      const error = new Error("Place not found.");
      error.statusCode = 404;
      throw error;
    }

    // Kiểm tra quyền truy cập
    const user = await User.findById(req.userId);
    if (
      place.userId.toString() !== req.userId.toString() &&
      user.role !== "admin"
    ) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }

    // Cập nhật trạng thái
    place.status = status;
    place.statusReason = reason || `Status updated to ${status}`;
    place.statusUpdatedAt = Date.now();

    await place.save();

    res.status(200).json({
      message: `Place status updated to ${status}.`,
      place: {
        _id: aes256.encryptData(place._id.toString()),
        title: place.title,
        status: place.status,
        statusReason: place.statusReason,
        statusUpdatedAt: place.statusUpdatedAt,
      },
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Lấy top địa điểm theo lượt xem
 */
exports.getTopPlaces = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "viewCount"; // viewCount, reservationCount, favoriteCount

    // Chỉ lấy địa điểm active
    const places = await Place.find({ status: "active" })
      .sort({ [`stats.${sortBy}`]: -1 })
      .limit(limit);

    // Format kết quả
    const placesFormatted = places.map((place) => ({
      _id: aes256.encryptData(place._id.toString()),
      title: place.title,
      imageSrc: place.imageSrc,
      price: place.price,
      locationValue: place.locationValue,
      category: place.category,
      stats: place.stats || {
        viewCount: 0,
        reservationCount: 0,
        favoriteCount: 0,
      },
    }));

    res.status(200).json({
      message: "Top places fetched.",
      topPlaces: placesFormatted,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
