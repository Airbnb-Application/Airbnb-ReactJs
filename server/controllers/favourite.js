const User = require("../models/user");
const Place = require("../models/place");
const aes256 = require("../utils/aes-crypto");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

/**
 * Lấy danh sách địa điểm yêu thích của người dùng
 */
exports.getFavourites = async (req, res, next) => {
  try {
    // Chỉ lấy địa điểm active
    const user = await User.findById(req.userId).populate({
      path: "favouritePlaces",
      match: { status: "active" }, // Chỉ lấy địa điểm có trạng thái active
    });

    if (!user) {
      const error = new Error("Could not find user.");
      error.statusCode = 404;
      throw error;
    }

    // Kiểm tra trạng thái người dùng
    if (user.status !== "active") {
      const error = new Error("User account is not active.");
      error.statusCode = 403;
      throw error;
    }

    // Mã hóa tất cả ID
    const formattedFavourites = user.favouritePlaces.map((place) => ({
      ...place._doc,
      _id: aes256.encryptData(place._id.toString()),
    }));

    res.status(200).json({
      message: "Favourites fetched.",
      favouritePlaces: formattedFavourites,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Thêm địa điểm vào danh sách yêu thích
 */
exports.addToFavourite = async (req, res, next) => {
  try {
    const placeId = aes256.decryptData(req.params.placeId);
    if (!placeId) {
      const error = new Error("Place ID is required.");
      error.statusCode = 400;
      throw error;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Kiểm tra địa điểm có tồn tại và active không
      const place = await Place.findOne({ _id: placeId, status: "active" });
      if (!place) {
        const error = new Error("Place not found or inactive.");
        error.statusCode = 404;
        throw error;
      }

      // Kiểm tra người dùng có active không
      const user = await User.findById(req.userId);
      if (!user) {
        const error = new Error("Could not find user.");
        error.statusCode = 404;
        throw error;
      }

      if (user.status !== "active") {
        const error = new Error("User account is not active.");
        error.statusCode = 403;
        throw error;
      }

      // Kiểm tra xem đã thêm vào danh sách yêu thích chưa
      const alreadyFavourited = user.favouritePlaces.includes(placeId);
      if (alreadyFavourited) {
        return res.status(200).json({
          message: "Place already in favourites.",
          alreadyInFavourites: true,
        });
      }

      // Thêm vào danh sách yêu thích
      user.favouritePlaces.push(placeId);
      await user.save({ session });

      // Tăng số lượt yêu thích của địa điểm
      place.stats.favoriteCount = (place.stats.favoriteCount || 0) + 1;
      await place.save({ session });

      await session.commitTransaction();

      res.status(200).json({
        message: "Favourite added.",
        favouriteCount: place.stats.favoriteCount,
      });
    } catch (error) {
      await session.abortTransaction();
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
 * Xóa địa điểm khỏi danh sách yêu thích
 */
exports.removeFromFavourite = async (req, res, next) => {
  const placeId = aes256.decryptData(req.params.placeId);

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Kiểm tra địa điểm có tồn tại không
      const place = await Place.findById(placeId);
      if (!place) {
        const error = new Error("Place not found.");
        error.statusCode = 404;
        throw error;
      }

      const user = await User.findById(req.userId);
      if (!user) {
        const error = new Error("Could not find user.");
        error.statusCode = 404;
        throw error;
      }

      // Kiểm tra xem có trong danh sách yêu thích không
      const isInFavourites = user.favouritePlaces.includes(placeId);
      if (!isInFavourites) {
        return res.status(200).json({
          message: "Place not in favourites.",
          notInFavourites: true,
        });
      }

      // Xóa khỏi danh sách yêu thích
      user.favouritePlaces.pull(placeId);
      await user.save({ session });

      // Giảm số lượt yêu thích
      if (
        place.stats &&
        place.stats.favoriteCount &&
        place.stats.favoriteCount > 0
      ) {
        place.stats.favoriteCount -= 1;
        await place.save({ session });
      }

      await session.commitTransaction();

      res.status(200).json({
        message: "Favourite removed.",
        favouriteCount: place.stats.favoriteCount || 0,
      });
    } catch (error) {
      await session.abortTransaction();
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
 * Kiểm tra một địa điểm có trong danh sách yêu thích của người dùng không
 */
exports.checkFavouriteStatus = async (req, res, next) => {
  try {
    const placeId = aes256.decryptData(req.params.placeId);
    if (!placeId) {
      const error = new Error("Place ID is required.");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("Could not find user.");
      error.statusCode = 404;
      throw error;
    }

    const isFavourite = user.favouritePlaces.includes(placeId);

    // Lấy số lượng yêu thích hiện tại
    const place = await Place.findById(placeId);
    const favouriteCount = place?.stats?.favoriteCount || 0;

    res.status(200).json({
      isFavourite,
      favouriteCount,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Lấy danh sách địa điểm được yêu thích nhiều nhất
 */
exports.getTopFavourites = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topFavourites = await Place.find({ status: "active" })
      .sort({ "stats.favoriteCount": -1 }) // Sắp xếp theo số lượt yêu thích giảm dần
      .limit(limit);

    const formattedResults = topFavourites.map((place) => ({
      ...place._doc,
      _id: aes256.encryptData(place._id.toString()),
      favouriteCount: place.stats.favoriteCount || 0,
    }));

    res.status(200).json({
      message: "Top favourites fetched.",
      topFavourites: formattedResults,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
