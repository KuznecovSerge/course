"use strict";
const passport = require("passport");
const express = require("express");
const router = express.Router();
const middleware = passport.authenticate("jwt", { session: false });
const TagService = require("../services/TagService");
require("../config/passport.js")(passport);

router.get("/", middleware, getAll);

/**
 * * Получить список всех тегов
 * @param {*} req 
 * @param {*} res 
 */
async function getAll(req, res) {
  try {
    const tags = await TagService.GetAll();
    return res.status(200).json({
      success: true,
      tags
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err
    });
  }
}

module.exports = router;
