const User = require("../models/user");
const { ObjectId } = require("mongoose").Types;
const aes256 = require("../utils/aes-crypto");
const bcrypt = require("bcryptjs");
const Reservation = require("../models/reservation");
const Place = require("../models/place");

/**
 * Lấy thông tin hồ sơ người dùng
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    // Kiểm tra user có active không
    if (user.status !== "active" && user.role !== "admin") {
      const error = new Error(`User account is ${user.status}.`);
      error.statusCode = 403;
      throw error;
    }

    let userId = req.userId;
    // Nếu là admin, có thể xem profile của người khác
    if (user.role === "admin") {
      if (req.query.userId) {
        userId = aes256.decryptData(req.query.userId);
        if (!ObjectId.isValid(userId)) {
          const error = new Error("Invalid user ID.");
          error.statusCode = 400;
          throw error;
        }
      }
    }

    const profile = await User.findById(userId)
      .populate({
        path: "places",
        match: { status: "active" }, // Chỉ lấy các place active
        select: "title imageSrc category status stats",
      })
      .select(
        "-_id email places name provider status statusUpdatedAt favouritePlaces"
      );

    if (!profile) {
      const error = new Error("Profile not found.");
      error.statusCode = 404;
      throw error;
    }

    // Lấy số lượng phòng đã đặt
    const reservationCount = await Reservation.countDocuments({
      userId: userId,
      status: { $in: ["confirmed", "completed"] },
    });

    const formattedProfile = {
      email: profile.email,
      name: profile.name,
      provider: profile.provider,
      status: profile.status,
      statusUpdatedAt: profile.statusUpdatedAt,
      reservationCount: reservationCount,
      favouritePlacesCount: profile.favouritePlaces.length,
      places: profile.places.map((place) => {
        return {
          _id: aes256.encryptData(place._id.toString()),
          title: place.title,
          imageSrc: place.imageSrc,
          category: place.category,
          status: place.status,
          stats: place.stats || {
            viewCount: 0,
            reservationCount: 0,
            favoriteCount: 0,
          },
        };
      }),
    };

    res.status(200).json({
      message: "Profile fetched.",
      profile: formattedProfile,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

/**
 * Cập nhật hồ sơ người dùng
 */
exports.updateProfile = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    let profile = await User.findById(req.userId);
    if (!profile) {
      const error = new Error("Profile not found.");
      error.statusCode = 404;
      throw error;
    }

    // Kiểm tra user có active không
    if (profile.status !== "active" && profile.role !== "admin") {
      const error = new Error(`User account is ${profile.status}.`);
      error.statusCode = 403;
      throw error;
    }

    if (profile.provider === "google") {
      const error = new Error("Google profile cannot be updated.");
      error.statusCode = 400;
      throw error;
    }

    // Admin có thể cập nhật thông tin người dùng khác
    if (profile.role === "admin" && req.query.userId) {
      const userId = req.query.userId;
      const decryptedUserId = aes256.decryptData(userId);
      if (!ObjectId.isValid(decryptedUserId)) {
        const error = new Error("Invalid user ID.");
        error.statusCode = 400;
        throw error;
      }
      profile = await User.findById(decryptedUserId);
      if (!profile) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }
    }

    if (name) profile.name = name;

    if (email && email !== profile.email) {
      // Kiểm tra email có tồn tại chưa
      const existingUser = await User.findOne({ email: email }, null, {
        includeInactive: true,
      });
      if (
        existingUser &&
        existingUser._id.toString() !== profile._id.toString()
      ) {
        const error = new Error("Email already exists.");
        error.statusCode = 400;
        throw error;
      }
      profile.email = email;
    }

    await profile.save();

    const formattedProfile = {
      name: profile.name,
      email: profile.email,
      provider: profile.provider,
      status: profile.status,
      statusUpdatedAt: profile.statusUpdatedAt,
    };

    res.status(200).json({
      message: "Profile updated.",
      profile: formattedProfile,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

/**
 * Đổi mật khẩu
 */
exports.changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  try {
    let profile = await User.findById(req.userId);
    if (!profile) {
      const error = new Error("Profile not found.");
      error.statusCode = 404;
      throw error;
    }

    // Kiểm tra user có active không
    if (profile.status !== "active" && profile.role !== "admin") {
      const error = new Error(`User account is ${profile.status}.`);
      error.statusCode = 403;
      throw error;
    }

    if (profile.provider === "google") {
      const error = new Error("Google profile cannot change password.");
      error.statusCode = 400;
      throw error;
    }

    // Admin có thể thay đổi mật khẩu người khác (không cần oldPassword)
    if (profile.role === "admin" && req.query.userId) {
      const userId = req.query.userId;
      const decryptedUserId = aes256.decryptData(userId);
      if (!ObjectId.isValid(decryptedUserId)) {
        const error = new Error("Invalid user ID.");
        error.statusCode = 400;
        throw error;
      }
      profile = await User.findById(decryptedUserId);
      if (!profile) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }

      if (!newPassword) {
        const error = new Error("New password is required.");
        error.statusCode = 400;
        throw error;
      }
    } else {
      // Người dùng thông thường phải cung cấp mật khẩu cũ
      if (!oldPassword || !newPassword) {
        const error = new Error("Old password and new password are required.");
        error.statusCode = 400;
        throw error;
      }

      const isMatch = await bcrypt.compare(oldPassword, profile.hashedPassword);
      if (!isMatch) {
        const error = new Error("Wrong password.");
        error.statusCode = 401;
        throw error;
      }
    }

    profile.hashedPassword = await bcrypt.hash(newPassword, 12);
    await profile.save();

    res.status(200).json({
      message: "Password changed.",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

/**
 * Lấy dữ liệu tổng quan của người dùng
 */
exports.getTotalData = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    // Kiểm tra user có active không
    if (user.status !== "active") {
      const error = new Error(`User account is ${user.status}.`);
      error.statusCode = 403;
      throw error;
    }

    // Lấy tất cả place ID của người dùng (bao gồm cả inactive để thống kê đầy đủ)
    const places = await Place.find({ userId: userId });
    const placeIds = places.map((place) => place._id);

    // Đếm số lượng đặt phòng
    const totalReservation = await Reservation.countDocuments({
      placeId: { $in: placeIds },
      status: { $in: ["paid"] },
    });

    // Tính tổng doanh thu
    const totalPaymentData = await Reservation.find({
      placeId: { $in: placeIds },
      status: { $in: ["paid"] },
    }).exec();

    let totalPayment = 0;
    totalPaymentData.forEach((payment) => {
      totalPayment += payment.totalPrice;
    });

    // Thêm thống kê mới
    const activePlaces = places.filter(
      (place) => place.status === "active"
    ).length;
    const pendingReservations = await Reservation.countDocuments({
      placeId: { $in: placeIds },
      status: "pending",
    });

    // Thống kê yêu thích và xem
    let totalViews = 0;
    let totalFavorites = 0;

    places.forEach((place) => {
      if (place.stats) {
        totalViews += place.stats.viewCount || 0;
        totalFavorites += place.stats.favoriteCount || 0;
      }
    });

    const formatData = {
      message: "Fetched total data successfully.",
      totalReservation: totalReservation,
      totalPayment: totalPayment,
      activePlaces: activePlaces,
      pendingReservations: pendingReservations,
      totalViews: totalViews,
      totalFavorites: totalFavorites,
    };

    res.status(200).json(formatData);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

/**
 * Lấy dữ liệu biểu đồ
 */
exports.getLineChartData = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    // Kiểm tra user có active không
    if (user.status !== "active") {
      const error = new Error(`User account is ${user.status}.`);
      error.statusCode = 403;
      throw error;
    }

    // Thống kê địa điểm theo location
    const placeData = await Place.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
          status: "active",
        },
      },
      {
        $group: {
          _id: "$locationValue",
          count: { $sum: 1 },
        },
      },
    ]).exec();

    // Thống kê đặt phòng theo tháng
    // Lấy tất cả place ID của người dùng
    const places = await Place.find({ userId: userId });
    const placeIds = places.map((place) => place._id);

    const reservationData = await Reservation.aggregate([
      {
        $match: {
          placeId: { $in: placeIds },
          status: { $in: ["paid"] },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]).exec();

    // Format dữ liệu biểu đồ
    const formattedPlaceData = placeData.map((place) => ({
      x: place._id,
      y: place.count,
    }));

    const formattedReservationData = reservationData.map((item) => ({
      x: `${item._id.year}-${item._id.month}`,
      y: item.count,
    }));

    const formattedRevenueData = reservationData.map((item) => ({
      x: `${item._id.year}-${item._id.month}`,
      y: item.revenue,
    }));

    res.status(200).json([
      {
        id: "places",
        color: "hsla(233, 100%, 68%, 1)",
        data: formattedPlaceData,
      },
      {
        id: "reservations",
        color: "hsla(43, 100%, 50%, 1)",
        data: formattedReservationData,
      },
      {
        id: "revenue",
        color: "hsla(153, 100%, 40%, 1)",
        data: formattedRevenueData,
      },
    ]);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

/**
 * Vô hiệu hóa tài khoản (self-deactivation)
 */
exports.deactivateAccount = async (req, res, next) => {
  try {
    const { password, reason } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    // Admin không thể tự vô hiệu hóa tài khoản
    if (user.role === "admin") {
      const error = new Error("Admin account cannot be deactivated.");
      error.statusCode = 403;
      throw error;
    }

    // Xác thực mật khẩu trước khi vô hiệu hóa (ngoại trừ tài khoản Google)
    if (user.provider === "email" && user.hashedPassword) {
      if (!password) {
        const error = new Error("Password is required to deactivate account.");
        error.statusCode = 400;
        throw error;
      }

      const isMatch = await bcrypt.compare(password, user.hashedPassword);
      if (!isMatch) {
        const error = new Error("Wrong password.");
        error.statusCode = 401;
        throw error;
      }
    }

    // Cập nhật trạng thái
    user.status = "inactive";
    user.statusReason = reason || "User requested account deactivation";
    user.statusUpdatedAt = Date.now();

    // Session để đảm bảo tính nhất quán
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await user.save({ session });

      // Vô hiệu hóa tất cả place của người dùng
      await Place.updateMany(
        { userId: userId },
        {
          status: "inactive",
          statusReason: "Owner account deactivated",
          statusUpdatedAt: Date.now(),
        },
        { session }
      );

      // Hủy tất cả đặt phòng pending
      await Reservation.updateMany(
        { userId: userId, status: "pending" },
        {
          status: "cancelled",
          cancellationReason: "User account deactivated",
          cancelledBy: "user",
          statusUpdatedAt: Date.now(),
        },
        { session }
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    res.status(200).json({
      message: "Account deactivated successfully.",
      status: "inactive",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

/**
 * Yêu cầu kích hoạt lại tài khoản
 */
exports.requestReactivation = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      const error = new Error("Email is required.");
      error.statusCode = 400;
      throw error;
    }

    // Tìm user không active (sử dụng option để lấy cả tài khoản inactive)
    const user = await User.findOne({ email }, null, { includeInactive: true });

    if (!user) {
      // Không thông báo cụ thể để tránh leak thông tin
      return res.status(200).json({
        message:
          "If your account exists and is inactive, a reactivation request has been submitted.",
        submitted: false,
      });
    }

    if (user.status === "active") {
      return res.status(200).json({
        message: "Your account is already active.",
        active: true,
      });
    }

    if (user.status === "banned") {
      return res.status(403).json({
        message:
          "Your account has been banned. Please contact customer support.",
        banned: true,
        reason: user.statusReason,
      });
    }

    // Xác thực mật khẩu cho tài khoản email
    if (user.provider === "email" && user.hashedPassword) {
      if (!password) {
        const error = new Error("Password is required for email accounts.");
        error.statusCode = 400;
        throw error;
      }

      const isMatch = await bcrypt.compare(password, user.hashedPassword);
      if (!isMatch) {
        const error = new Error("Wrong password.");
        error.statusCode = 401;
        throw error;
      }
    }

    // Kích hoạt lại tài khoản
    user.status = "active";
    user.statusReason = "User requested reactivation";
    user.statusUpdatedAt = Date.now();
    await user.save();

    res.status(200).json({
      message: "Account reactivated successfully.",
      reactivated: true,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
