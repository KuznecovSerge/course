"use strict";
const passport = require("passport");
const express = require("express");
const router = express.Router();

const middleware = passport.authenticate("jwt", { session: false });
const LikeService = require("../services/LikeService");

require("../config/passport.js")(passport);

router.post("/", middleware, toggleLike);

/**
 * * Добавить или удалить лайк
 * @param {*} req 
 * @param {*} res 
 */
async function toggleLike(req, res) {
  try {
    const { user } = req;
    const { entityId, referenceId, isLiked, userId } = req.body;

    if (!entityId || !referenceId) {
      return res.status(500).json({
        success: false,
        message: `${entityId ? "referenceId" : "entityId"} is null`
      });
    }

    const value = await LikeService.createOrUpdate(entityId, referenceId, userId, isLiked);

    return res.status(200).json({
      success: true,
      status: value.isLiked
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error
    });
  }
}

module.exports = router;
