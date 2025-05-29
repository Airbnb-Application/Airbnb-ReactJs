const express = require('express');
const {body} = require('express-validator');
const {isAuth} = require('../utils/isAuth');

const profileController = require('../controllers/profile');

const router = express.Router();

router.get('/profile',
    isAuth,
    profileController.getProfile);

router.put('/profile',
    isAuth,
    profileController.updateProfile);

router.put('/profile/change-password',
    isAuth,
    profileController.changePassword);

router.get('/statistics/total-data',
    isAuth,
    profileController.getTotalData);

router.get('/statistics/line-chart',
    isAuth,
    profileController.getLineChartData);

module.exports = router;
