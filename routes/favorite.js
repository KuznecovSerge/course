"use strict";

const express = require("express");
const router = express.Router();
const passport = require("passport");
const favoriteService = require("../services/FavoriteService");
require("../config/passport.js")(passport);

const middleware = passport.authenticate("jwt", { session: false });

router.post("/", middleware, addOrDestroy);
router.get("/:userId", getFavorite);

async function addOrDestroy(req, res) {
  const { typeId, entityId } = req.body;
  const { id } = req.user;
  if (!typeId || !entityId) {
    return res.status(500).json({
      success: false,
      message: "Incorrect data"
    });
  }

  try {
    const data = await favoriteService.addOrDestroy(id, typeId, entityId);
    return res.status(200).json({
      created: data
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err
    });
  }
}

async function getFavorite(req, res) {
  const { userId } = req.params;

  if (!userId) {
    return res.status(500).json({
      success: false,
      message: `userId cannot be null!`
    });
  }

  try {
    const data = await favoriteService.getAll(userId);

    return res.status(200).json({
      success: true,
      favorites: data
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err
    });
  }
}

module.exports = router;
