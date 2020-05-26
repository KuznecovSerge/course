const express = require("express");
const router = express.Router();
const {
  category
} = require("../models/index");


router.get("/", getCategories);


async function getCategories(req, res) {
  try {

    const categories = await category.findAll({
      include: [{
        model: category,
        as: "subCategories",
        attributes: ['id', 'name']
      }],
      where: {
        parent: null,
        active: true
      },
      attributes: ['id', 'name']

    });

    return res.status(200).json({
      success: true,
      categories: categories
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error
    });
  }
};

module.exports = router;
