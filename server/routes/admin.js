const express = require('express');
const {body} = require('express-validator');
const adminController = require('../controllers/admin');
const {isAuth, isAdmin} = require("../utils/isAuth");
const router = express.Router();

router.get('/dashboard/total-data', [isAuth, isAdmin], adminController.getTotalData);

router.get('/dashboard/line-chart', [isAuth, isAdmin], adminController.getLineChartData);

router.get('/check-role', isAuth, adminController.checkRole);

router.get('/reservations', [isAuth, isAdmin], adminController.getAllReservations);

router.get('/users', [isAuth, isAdmin], adminController.getAllUsers);

router.delete('/user/:userId', [isAuth, isAdmin], adminController.deleteUser);
module.exports = router;