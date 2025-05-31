/**
 * Tiện ích chung cho các thao tác với model
 */
const modelOperations = {
  /**
   * Cập nhật trạng thái của một document
   * @param {Model} model - Model Mongoose (User, Place, Reservation)
   * @param {string|ObjectId} id - ID của document
   * @param {string} status - Trạng thái mới
   * @param {Object} options - Tùy chọn bổ sung (reason, cancelledBy, ...)
   */
  async updateStatus(model, id, status, options = {}) {
    return await model.updateStatus(id, status, options);
  },

  /**
   * Tìm kiếm documents theo các điều kiện lọc
   * @param {Model} model - Model Mongoose
   * @param {Object} filters - Các điều kiện lọc
   */
  async findByFilters(model, filters = {}) {
    return await model.findByFilters(filters);
  },

  /**
   * Tạo mới một document
   * @param {Model} model - Model Mongoose
   * @param {Object} data - Dữ liệu tạo mới
   */
  async create(model, data) {
    const document = new model(data);
    return await document.save();
  },

  /**
   * Cập nhật một document
   * @param {Model} model - Model Mongoose
   * @param {string|ObjectId} id - ID của document
   * @param {Object} data - Dữ liệu cập nhật
   */
  async update(model, id, data) {
    return await model.findByIdAndUpdate(id, data, { new: true });
  },

  /**
   * Vô hiệu hóa document thay vì xóa
   * @param {Model} model - Model Mongoose
   * @param {string|ObjectId} id - ID của document
   * @param {string} reason - Lý do vô hiệu hóa
   */
  async disable(model, id, reason = null) {
    if (model.modelName === "Reservation") {
      return await model.updateStatus(id, "cancelled", {
        reason: reason || "Disabled by system",
        cancelledBy: "admin",
      });
    } else {
      return await model.updateStatus(id, "inactive", {
        reason: reason || "Disabled by system",
      });
    }
  },

  /**
   * Kích hoạt lại document đã bị vô hiệu hóa
   * @param {Model} model - Model Mongoose
   * @param {string|ObjectId} id - ID của document
   */
  async enable(model, id) {
    if (model.modelName === "Reservation") {
      return await model.updateStatus(id, "pending");
    } else {
      return await model.updateStatus(id, "active");
    }
  },

  /**
   * Thống kê dữ liệu
   * @param {Model} model - Model Mongoose
   * @param {Object} filters - Các điều kiện lọc
   * @param {string} groupBy - Trường để nhóm theo
   */
  async getStats(model, filters = {}, groupBy) {
    let aggregation = [];

    // Thêm điều kiện lọc nếu có
    if (Object.keys(filters).length > 0) {
      aggregation.push({ $match: filters });
    }

    if (groupBy) {
      aggregation.push({
        $group: {
          _id: `$${groupBy}`,
          count: { $sum: 1 },
        },
      });

      aggregation.push({
        $project: {
          label: "$_id",
          value: "$count",
          _id: 0,
        },
      });
    }

    return await model.aggregate(aggregation);
  },
};

module.exports = modelOperations;
