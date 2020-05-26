"use strict";

const express = require("express");
const router = express.Router();
const commentsService = require("../services/CommentsService");

const passport = require("passport");
require("../config/passport.js")(passport);

const middleware = passport.authenticate("jwt", { session: false });

router.post("/", middleware, createComment);
router.get("/", middleware, getComments);
router.post("/:id/like", middleware, likeComment);

async function likeComment(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { like } = req.body;

    const comment = await commentsService.likeComment(userId, id, like);
    return res.status(200).json({
      success: true,
      comment
    });
  } catch (err) {
    return res.status(500).json({
      success: false
    });
  }
}

async function getComments(req, res) {
  try {
    const { id } = req.user;
    const { entityId, referenceId } = req.query;
    if (!entityId || !referenceId) {
      throw new Error("entityId or referenceId is null");
    }

    const items = await commentsService.getComments(id, entityId, referenceId);
    return res.status(200).json({
      success: true,
      items
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function createComment(req, res) {
  try {
    const { id } = req.user;
    const { entityId, referenceId, parent, comment } = req.body;
    const result = await commentsService.create(
      id,
      entityId,
      referenceId,
      parent,
      comment
    );
    if (result) {
      return res.status(200).json({
        success: true,
        comment: result
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false });
  }
}

module.exports = router;
