const express = require("express");
const { body } = require("express-validator");
const adminController = require("../controllers/admin");
const { isAuth, isAdmin } = require("../utils/isAuth");
const router = express.Router();

/**
 * Routes cho trang Dashboard
 */
// Lấy dữ liệu tổng quan
router.get(
  "/dashboard/total-data",
  [isAuth, isAdmin],
  adminController.getTotalData
);

// Lấy dữ liệu cho biểu đồ
router.get(
  "/dashboard/line-chart",
  [isAuth, isAdmin],
  adminController.getLineChartData
);

// Lấy thống kê chi tiết cho dashboard
router.get(
  "/dashboard/system-stats",
  [isAuth, isAdmin],
  adminController.getSystemStats
);

/**
 * Routes cho quản lý người dùng
 */
// Kiểm tra vai trò
router.get("/check-role", isAuth, adminController.checkRole);

// Lấy danh sách người dùng
router.get("/users", [isAuth, isAdmin], adminController.getAllUsers);

// Cập nhật trạng thái người dùng (thay vì xóa)
router.patch(
  "/user/:userId/status",
  [
    isAuth,
    isAdmin,
    body("status").isIn(["active", "inactive", "banned", "pending"]),
    body("reason").optional().trim().isLength({ min: 3 }),
  ],
  adminController.updateUserStatus
);

// Giữ lại endpoint xóa người dùng cũ (sẽ thực hiện soft delete)
router.delete("/user/:userId", [isAuth, isAdmin], adminController.deleteUser);

/**
 * Routes cho quản lý đặt phòng
 */
// Lấy danh sách đặt phòng
router.get(
  "/reservations",
  [isAuth, isAdmin],
  adminController.getAllReservations
);

// Cập nhật trạng thái đặt phòng
router.patch(
  "/reservation/:reservationId/status",
  [
    isAuth,
    isAdmin,
    body("status").isIn([
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "refunded",
    ]),
    body("reason").optional().trim(),
  ],
  adminController.updateReservationStatus
);

/**
 * Routes cho quản lý địa điểm
 */
// Lấy danh sách địa điểm
router.get("/places", [isAuth, isAdmin], adminController.getAllPlaces);

// Cập nhật trạng thái địa điểm
router.patch(
  "/place/:placeId/status",
  [
    isAuth,
    isAdmin,
    body("status").isIn([
      "active",
      "inactive",
      "pending",
      "maintenance",
      "blocked",
    ]),
    body("reason").optional().trim(),
  ],
  adminController.updatePlaceStatus
);

// Xóa địa điểm (thực hiện soft delete)
router.delete(
  "/place/:placeId",
  [isAuth, isAdmin],
  adminController.deletePlace
);

module.exports = router;
