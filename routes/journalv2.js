"use strict";
const passport = require("passport");
const express = require("express");
const router = express.Router();

const middleware = passport.authenticate("jwt", { session: false });
const upload = require("../middlewares/attachmentUpload");
const db = require("../models/index");
const JournalService = require("../services/JournalService");
const TagService = require("../services/TagService");

require("../config/passport.js")(passport);

router.post("/", middleware, upload.single("file"), createJournal);
router.get("/", middleware, getAll);
router.get("/tag", middleware, getViaTag);
router.get("/tags", middleware, getJournalTags);
router.get("/tags/top", middleware, getJournalTagsTop);
router.get("/details/:id", middleware, getDetails);
router.put("/:id", middleware, upload.single("file"), updateJournal);

async function getJournalTags(req, res) {
  try {
    const { limit, offset } = req.query;

    const tags = await JournalService.GetTags(Number(limit), Number(offset));

    return res.status(200).json({
      success: true,
      tags,
    });
  } catch (err) {
    return res.json({
      success: false,
    });
  }
}

async function getJournalTagsTop(req, res) {
  try {
    const tags = await JournalService.getTagsTop();

    return res.status(200).json({
      success: true,
      tags,
    });
  } catch (err) {
    return res.json({
      success: false,
    });
  }
}

/**
 * * Получить журнал по идентификатору
 * @param {*} req
 * @param {*} res
 */
async function getDetails(req, res) {
  try {
    const { id } = req.params;
    const journal = await JournalService.GetOne(id);
    return res.status(200).json({
      success: true,
      details: journal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error,
    });
  }
}

/**
 * * Получить список журналов по конкретному тегу
 * @param {*} req
 * @param {*} res
 */
async function getViaTag(req, res) {
  try {
    let { tag, options } = req.query;
    if (options) {
      options = JSON.parse(options);
    }

    const journals = await JournalService.GetViaTag(tag, options);

    return res.status(200).json({
      success: true,
      journals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error,
    });
  }
}

/**
 * * Получить весь список журналов
 * @param {*} req
 * @param {*} res
 */
async function getAll(req, res) {
  try {
    const { limit, offset, direction, findstr, sort } = req.query;

    const journals = await JournalService.GetAll(
      Number(limit),
      Number(offset),
      direction,
      findstr,
      sort
    );

    return res.status(200).json({
      success: true,
      ...journals
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error,
    });
  }
}

/**
 * * Обновить журнал
 * @param {*} req
 * @param {*} res
 */
async function updateJournal(req, res) {
  try {
    const { id } = req.params;
    let { title, tags, content, userId } = req.body;
    if (tags) {
      tags = JSON.parse(tags);
    }
    const transaction = await db.sequelize.transaction();

    try {
      const instancesOfTags = await TagService.CreateMany(tags, transaction);
      let model = {
        content,
        title,
        userId,
      };
      if (req.file) {
        model.image = req.filereq.file.filename;
      }
      const instanceJournal = await JournalService.Update(
        id,
        model,
        transaction
      );

      const journal = await JournalService.GetOne(id);

      await JournalService.CreateAssociationWithTags(journal, instancesOfTags);

      await transaction.commit();

      return res.status(200).json({
        success: true,
        journalId: journal.id,
      });
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
}

/**
 * * Создание журнала
 * @param {*} req
 * @param {*} res
 */
async function createJournal(req, res) {
  try {
    let { title, tags, content, userId } = req.body;
    if (tags) {
      tags = JSON.parse(tags);
    }
    const transaction = await db.sequelize.transaction();

    try {
      const instancesOfTags = await TagService.CreateMany(tags, transaction);
      const instanceJournal = await JournalService.Create(
        {
          content,
          title,
          userId,
          image: req.file.filename,
        },
        transaction
      );

      await JournalService.CreateAssociationWithTags(
        instanceJournal,
        instancesOfTags
      );

      await transaction.commit();

      return res.status(200).json({
        success: true,
        journalId: instanceJournal.id,
      });
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
}

module.exports = router;
