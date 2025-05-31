const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const placeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageSrc: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    roomCount: {
      type: Number,
      required: true,
    },
    bathroomCount: {
      type: Number,
      required: true,
    },
    guestCapacity: {
      type: Number,
      required: true,
    },
    locationValue: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    // Thay isActive bằng trường status chi tiết hơn
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "maintenance", "blocked"],
      default: "active",
      required: true,
    },
    // Thêm lý do trạng thái
    statusReason: {
      type: String,
    },
    // Thêm trường theo dõi thay đổi trạng thái
    statusUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    amenities: {
      wifi: {
        type: Boolean,
        default: false,
      },
      tv: {
        type: Boolean,
        default: false,
      },
      kitchen: {
        type: Boolean,
        default: false,
      },
      washer: {
        type: Boolean,
        default: false,
      },
      parking: {
        type: Boolean,
        default: false,
      },
      ac: {
        type: Boolean,
        default: false,
      },
      pool: {
        type: Boolean,
        default: false,
      },
      hotTub: {
        type: Boolean,
        default: false,
      },
      workspace: {
        type: Boolean,
        default: false,
      },
      balcony: {
        type: Boolean,
        default: false,
      },
      grill: {
        type: Boolean,
        default: false,
      },
      campFire: {
        type: Boolean,
        default: false,
      },
      billiards: {
        type: Boolean,
        default: false,
      },
      gym: {
        type: Boolean,
        default: false,
      },
      piano: {
        type: Boolean,
        default: false,
      },
      shower: {
        type: Boolean,
        default: false,
      },
      firstAid: {
        type: Boolean,
        default: false,
      },
      fireExtinguisher: {
        type: Boolean,
        default: false,
      },
    },
    reservations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reservation",
      },
    ],
    // Thêm trường rating và reviews
    rating: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    // Lưu trữ thống kê
    stats: {
      viewCount: {
        type: Number,
        default: 0,
      },
      reservationCount: {
        type: Number,
        default: 0,
      },
      favoriteCount: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

// Middleware khi status được cập nhật
placeSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusUpdatedAt = Date.now();
  }
  next();
});

// Middleware tự động lọc các địa điểm không hoạt động
placeSchema.pre(["find", "findOne", "countDocuments"], function () {
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

placeSchema.statics.findWithInactive = function (conditions = {}) {
  return this.find({
    ...conditions,
    includeInactive: true,
  });
};

// Phương thức cho trường hợp findOne
placeSchema.statics.findOneWithInactive = function (conditions = {}) {
  return this.findOne({
    ...conditions,
    includeInactive: true,
  });
};

// Middleware để vô hiệu hóa thay vì xóa
placeSchema.pre(
  ["deleteOne", "deleteMany"],
  { document: false, query: true },
  async function (next) {
    try {
      const conditions = this.getQuery();

      // Thay vì xóa, cập nhật status thành inactive
      await mongoose.model("Place").updateMany(conditions, {
        status: "inactive",
        statusUpdatedAt: Date.now(),
        statusReason: "Place removed by user or admin",
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
placeSchema.statics.updateStatus = async function (
  id,
  newStatus,
  options = {}
) {
  const validStatuses = [
    "active",
    "inactive",
    "pending",
    "maintenance",
    "blocked",
  ];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  const place = await this.findById(id);
  if (!place) {
    throw new Error("Place not found");
  }

  place.status = newStatus;
  place.statusUpdatedAt = Date.now();

  if (options.reason) {
    place.statusReason = options.reason;
  }

  return await place.save();
};

// Phương thức linh hoạt để tìm kiếm địa điểm
placeSchema.statics.findByFilters = function (filters = {}) {
  const query = {};

  // Lọc theo trạng thái
  if (filters.status) {
    query.status = filters.status;
  }

  // Lọc theo danh mục
  if (filters.category) {
    query.category = filters.category;
  }

  // Lọc theo vị trí
  if (filters.locationValue) {
    query.locationValue = filters.locationValue;
  }

  // Lọc theo số phòng
  if (filters.roomCount) {
    query.roomCount = { $gte: parseInt(filters.roomCount) };
  }

  // Lọc theo số người
  if (filters.guestCapacity) {
    query.guestCapacity = { $gte: parseInt(filters.guestCapacity) };
  }

  // Lọc theo tiện nghi
  const amenitiesFilter = {};
  if (filters.amenities) {
    const amenities = Array.isArray(filters.amenities)
      ? filters.amenities
      : [filters.amenities];
    amenities.forEach((amenity) => {
      if (amenity && typeof amenity === "string") {
        amenitiesFilter[`amenities.${amenity}`] = true;
      }
    });
    Object.assign(query, amenitiesFilter);
  }

  // Lọc theo khoảng giá
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) {
      query.price.$gte = parseInt(filters.minPrice);
    }
    if (filters.maxPrice) {
      query.price.$lte = parseInt(filters.maxPrice);
    }
  }

  // Tìm kiếm theo tên hoặc mô tả
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  // Lọc theo chủ sở hữu
  if (filters.userId) {
    query.userId = filters.userId;
  }

  return this.find(query);
};

// Phương thức cập nhật thống kê
placeSchema.statics.incrementStats = async function (
  id,
  statsField,
  increment = 1
) {
  const validFields = ["viewCount", "reservationCount", "favoriteCount"];
  if (!validFields.includes(statsField)) {
    throw new Error(`Invalid stats field: ${statsField}`);
  }

  return await this.findByIdAndUpdate(
    id,
    { $inc: { [`stats.${statsField}`]: increment } },
    { new: true }
  );
};

module.exports = mongoose.model("Place", placeSchema);
