const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
    },
    provider: {
      type: String,
      enum: ["email", "google", "facebook"],
      default: "email",
    },
    providerId: {
      type: String,
    },
    hashedPassword: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // Trường status thay vì isActive
    status: {
      type: String,
      enum: ["active", "inactive", "banned", "pending"],
      default: "active",
    },
    favouritePlaces: [
      {
        type: Schema.Types.ObjectId,
        ref: "Place",
      },
    ],
    places: [
      {
        type: Schema.Types.ObjectId,
        ref: "Place",
      },
    ],
    reservations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reservation",
      },
    ],
    // Thêm trường để theo dõi thay đổi trạng thái
    statusUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    // Thêm trường để lưu lý do nếu tài khoản bị khóa/vô hiệu hóa
    statusReason: {
      type: String,
    },
  },
  { timestamps: true }
);

// Middleware khi status được cập nhật
userSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusUpdatedAt = Date.now();
  }
  next();
});

// Middleware tự động lọc người dùng không hoạt động
userSchema.pre(["find", "findOne", "countDocuments"], function () {
  const query = this.getQuery();

  // Kiểm tra cờ includeInactive trong query
  if (!query.hasOwnProperty("status") && query.includeInactive !== true) {
    this.where({ status: "active" });
  }

  // Xóa cờ includeInactive khỏi query để tránh lỗi
  if (query.includeInactive !== undefined) {
    delete query.includeInactive;
  }
});

userSchema.statics.findWithInactive = function (conditions = {}) {
  return this.find({
    ...conditions,
    includeInactive: true,
  });
};

// Phương thức cho trường hợp findOne
userSchema.statics.findOneWithInactive = function (conditions = {}) {
  return this.findOne({
    ...conditions,
    includeInactive: true,
  });
};

// Middleware vô hiệu hóa thay vì xóa
userSchema.pre(
  ["deleteOne", "deleteMany"],
  { document: false, query: true },
  async function (next) {
    try {
      const conditions = this.getQuery();

      // Thay vì xóa, cập nhật status thành inactive
      await mongoose.model("User").updateMany(conditions, {
        status: "inactive",
        statusUpdatedAt: Date.now(),
        statusReason: "User account deleted",
      });

      // Skip thao tác xóa thực tế
      this.skip();
      next();
    } catch (error) {
      next(error);
    }
  }
);

// Phương thức thống nhất để cập nhật trạng thái
userSchema.statics.updateStatus = async function (id, newStatus, options = {}) {
  const validStatuses = ["active", "inactive", "banned", "pending"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  const user = await this.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  user.status = newStatus;
  user.statusUpdatedAt = Date.now();

  if (options.reason) {
    user.statusReason = options.reason;
  }

  return await user.save();
};

// Phương thức tìm kiếm linh hoạt
userSchema.statics.findByFilters = function (filters = {}) {
  const query = {};

  // Lọc theo trạng thái
  if (filters.status) {
    query.status = filters.status;
  }

  // Lọc theo vai trò
  if (filters.role) {
    query.role = filters.role;
  }

  // Lọc theo provider
  if (filters.provider) {
    query.provider = filters.provider;
  }

  // Tìm kiếm theo tên hoặc email
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }

  return this.find(query);
};

module.exports = mongoose.model("User", userSchema);
