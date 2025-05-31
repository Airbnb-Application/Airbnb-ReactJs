const User = require("../models/user");
const Place = require("../models/place");
const Reservation = require("../models/reservation");
const aes256 = require("../utils/aes-crypto");

/**
 * Lấy dữ liệu tổng quan
 */
exports.getTotalData = async (req, res, next) => {
  try {
    // Chỉ đếm người dùng active
    const totalCustomer = await User.countDocuments({ status: "active" });

    // Chỉ đếm reservation là confirmed hoặc completed
    const totalReservation = await Reservation.countDocuments({
      status: { $in: ["paid"] },
    });

    // Chỉ tính total payment từ các đặt chỗ confirmed hoặc completed
    const totalPaymentData = await Reservation.find({
      status: { $in: ["paid"] },
    }).exec();

    let totalPayment = 0;
    totalPaymentData.forEach((payment) => {
      totalPayment += payment.totalPrice;
    });

    // Thêm thống kê số listing đang hoạt động
    const activePlaces = await Place.countDocuments({ status: "active" });

    // Thêm thống kê số đặt phòng đang chờ xử lý
    const pendingReservations = await Reservation.countDocuments({
      status: "pending",
    });

    res.status(200).json({
      message: "Fetched total data successfully.",
      totalCustomer: totalCustomer,
      totalReservation: totalReservation,
      totalPayment: totalPayment,
      activePlaces: activePlaces,
      pendingReservations: pendingReservations,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Lấy dữ liệu biểu đồ đường
 */
exports.getLineChartData = async (req, res, next) => {
  try {
    // Chỉ sử dụng các địa điểm active
    const places = await Place.aggregate([
      {
        $match: { status: "active" },
      },
      {
        $group: {
          _id: "$locationValue",
          count: { $sum: 1 },
        },
      },
    ]).exec();

    const placeData = places.map((place) => ({
      x: place._id,
      y: place.count,
    }));

    // Thêm dữ liệu đặt phòng theo tháng
    const reservations = await Reservation.aggregate([
      {
        $match: { status: { $in: ["paid"] } },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]).exec();

    const reservationData = reservations.map((item) => ({
      x: `${item._id.year}-${item._id.month}`,
      y: item.count,
    }));

    res.status(200).json([
      {
        id: "places",
        color: "hsla(233, 100%, 68%, 1)",
        data: placeData,
      },
      {
        id: "reservations",
        color: "hsla(43, 100%, 50%, 1)",
        data: reservationData,
      },
    ]);
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Kiểm tra vai trò người dùng
 */
exports.checkRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Role fetched.",
      role: user.role,
      status: user.status,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Lấy tất cả đặt phòng
 */
exports.getAllReservations = async (req, res, next) => {
  try {
    // Xử lý các bộ lọc từ query
    const status = req.query.status;
    const query = {};

    if (status) {
      query.status = status;
    }

    const reservations = await Reservation.find(query)
      .populate({
        path: "userId",
        select: "email name status",
      })
      .populate({
        path: "placeId",
        select: "category locationValue title price imageSrc status",
      })
      .exec();

    if (reservations.length === 0) {
      return res.status(200).json({
        message: "No reservations found.",
        reservations: [],
      });
    }

    const encodedData = reservations.map((reservation) => {
      if (!reservation.placeId) return null;
      return {
        ...reservation,
        _id: aes256.encryptData(reservation._id.toString()),
        placeReservationParams: aes256.encryptData(reservation._id.toString()),
        // Bổ sung thông tin trạng thái
        status: reservation.status,
        statusUpdatedAt: reservation.statusUpdatedAt,
        cancellationReason: reservation.cancellationReason,
        cancelledBy: reservation.cancelledBy,
      };
    });

    const filteredData = encodedData.filter((data) => data !== null);

    res.status(200).json({
      message: "Fetched all reservations successfully.",
      reservations: filteredData,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Lấy tất cả người dùng
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    // Xây dựng query từ query params
    const query = {};

    // Tìm theo tên hoặc email
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    } else if (req.query.name) {
      query.name = { $regex: req.query.name, $options: "i" };
    }

    // Lọc theo trạng thái
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Lọc theo vai trò
    if (req.query.role) {
      query.role = req.query.role;
    }

    const users = await User.findWithInactive(query)
      .select("name email role provider status statusUpdatedAt")
      .exec();

    if (users.length === 0) {
      return res.status(200).json({
        message: "No users found.",
        users: [],
      });
    }

    const formattedUsers = users.map((user) => {
      return {
        ...user._doc,
        _id: aes256.encryptData(user._id.toString()),
      };
    });

    res.status(200).json({
      message: "Fetched all users successfully.",
      users: formattedUsers,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Xóa người dùng (soft delete)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = aes256.decryptData(req.params.userId);
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    if (user.role === "admin") {
      const error = new Error("Cannot delete admin.");
      error.statusCode = 400;
      throw error;
    }

    // Thay vì xóa thực sự, sử dụng soft delete bằng cách cập nhật trạng thái
    user.status = "inactive";
    user.statusReason = "User deleted by admin";
    user.statusUpdatedAt = Date.now();
    await user.save();

    // update status for places and reservations owned by this user
    await Place.updateMany({ userId: user._id }, { status: "inactive" });
    // find reservations owned by this user has status "pending"
    await Reservation.updateMany(
      { userId: user._id, status: { $in: ["pending"] } },
      { status: "cancelled" }
    );

    res.status(200).json({
      message: "User deactivated successfully.",
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Cập nhật trạng thái người dùng
 */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const userId = aes256.decryptData(req.params.userId);
    const { status, reason } = req.body;

    if (!["active", "inactive", "banned", "pending"].includes(status)) {
      const error = new Error("Invalid status");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOneWithInactive({ _id: userId });

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    // Ngăn chặn việc thay đổi trạng thái của admin
    if (user.role === "admin" && req.userRole !== "admin") {
      const error = new Error("Cannot modify admin status");
      error.statusCode = 403;
      throw error;
    }

    user.status = status;
    user.statusReason = reason || `Status updated to ${status} by admin`;
    user.statusUpdatedAt = Date.now();

    await user.save();

    // if status is inactive, update all places and reservations owned by this user
    if (status === "inactive") {
      await Place.updateMany({ userId: user._id }, { status: "inactive" });
      await Reservation.updateMany(
        { userId: user._id, status: { $in: ["pending"] } },
        { status: "cancelled" }
      );
    }

    res.status(200).json({
      message: `User status updated to ${status} successfully`,
      user: {
        ...user._doc,
        _id: aes256.encryptData(user._id.toString()),
      },
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Lấy tất cả địa điểm
 */
exports.getAllPlaces = async (req, res, next) => {
  try {
    // Xây dựng query từ query params
    const query = {};

    // Tìm kiếm theo tên hoặc mô tả
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Lọc theo trạng thái
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Lọc theo danh mục
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Lọc theo vị trí
    if (req.query.location) {
      query.locationValue = req.query.location;
    }

    // Cho phép hiển thị cả địa điểm inactive nếu có query param
    const options = {};
    if (req.query.includeInactive === "true") {
      options.includeInactive = true;
    }

    const places = await Place.find(query, null, options)
      .populate({
        path: "userId",
        select: "name email",
      })
      .select(
        "title description category locationValue price status statusUpdatedAt statusReason imageSrc stats"
      );

    if (places.length === 0) {
      return res.status(200).json({
        message: "No places found.",
        places: [],
      });
    }

    const formattedPlaces = places.map((place) => ({
      ...place._doc,
      _id: aes256.encryptData(place._id.toString()),
    }));

    res.status(200).json({
      message: "Fetched all places successfully.",
      places: formattedPlaces,
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

    if (
      !["active", "inactive", "pending", "maintenance", "blocked"].includes(
        status
      )
    ) {
      const error = new Error("Invalid status");
      error.statusCode = 400;
      throw error;
    }

    const place = await Place.findById(placeId);

    if (!place) {
      const error = new Error("Place not found.");
      error.statusCode = 404;
      throw error;
    }

    place.status = status;
    place.statusReason = reason || `Status updated to ${status} by admin`;
    place.statusUpdatedAt = Date.now();

    await place.save();

    res.status(200).json({
      message: `Place status updated to ${status} successfully`,
      place: {
        ...place._doc,
        _id: aes256.encryptData(place._id.toString()),
      },
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Cập nhật trạng thái đặt phòng
 */
exports.updateReservationStatus = async (req, res, next) => {
  try {
    const reservationId = aes256.decryptData(req.params.reservationId);
    const { status, reason } = req.body;

    if (!["pending", "cancelled", "paid"].includes(status)) {
      const error = new Error("Invalid status");
      error.statusCode = 400;
      throw error;
    }

    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      const error = new Error("Reservation not found.");
      error.statusCode = 404;
      throw error;
    }

    reservation.status = status;
    reservation.statusUpdatedAt = Date.now();

    // Thêm thông tin hủy nếu trạng thái là cancelled hoặc refunded
    if (["cancelled"].includes(status)) {
      reservation.cancellationReason =
        reason || `Reservation ${status} by admin`;
      reservation.cancelledBy = "admin";
    }

    await reservation.save();

    res.status(200).json({
      message: `Reservation status updated to ${status} successfully`,
      reservation: {
        ...reservation._doc,
        _id: aes256.encryptData(reservation._id.toString()),
      },
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Thống kê hệ thống
 */
exports.getSystemStats = async (req, res, next) => {
  try {
    // Thống kê người dùng theo trạng thái
    const userStatsByStatus = await User.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Thống kê địa điểm theo trạng thái
    const placeStatsByStatus = await Place.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Thống kê địa điểm theo danh mục
    const placeStatsByCategory = await Place.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Thống kê đặt phòng theo trạng thái
    const reservationStatsByStatus = await Reservation.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Địa điểm được đặt nhiều nhất
    const topBookedPlaces = await Place.aggregate([
      { $match: { status: "active" } },
      { $sort: { "stats.reservationCount": -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 1,
          title: 1,
          locationValue: 1,
          reservationCount: "$stats.reservationCount",
        },
      },
    ]);

    res.status(200).json({
      message: "Fetched stats successfully",
      userStats: userStatsByStatus,
      placeStats: {
        byStatus: placeStatsByStatus,
        byCategory: placeStatsByCategory,
      },
      reservationStats: reservationStatsByStatus,
      topBookedPlaces: topBookedPlaces,
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
  try {
    const placeId = aes256.decryptData(req.params.placeId);
    const place = await Place.findById(placeId);

    if (!place) {
      const error = new Error("Place not found.");
      error.statusCode = 404;
      throw error;
    }

    // Soft delete bằng cách cập nhật trạng thái
    place.status = "inactive";
    place.statusReason = "Place deleted by admin";
    place.statusUpdatedAt = Date.now();
    await place.save();

    res.status(200).json({
      message: "Place deactivated successfully",
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
