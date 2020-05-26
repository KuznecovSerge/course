const express = require("express");
const router = express.Router();
const Op = require("sequelize").Op;
const {
  skills
} = require("../models/index");


router.get("/", getSkills);


async function getSkills(req, res) {
  try {

    const search = req.query.search || ''; 

    const skillsResult = await skills.findAll({
      where: {
        description: {
          [Op.like]: `%${search}%`
        },
      },
      limit: 10,
      attributes: ['id', 'description']
    });

    return res.status(200).json({
      success: true,
      skills: skillsResult
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = router;
