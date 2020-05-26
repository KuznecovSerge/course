const passport = require("passport");
const express = require("express");
const router = express.Router();
const { NotifyService } = require("../services/index");

require("../config/passport.js")(passport);

const middleware = passport.authenticate("jwt", { session: false });

router.get("/", middleware, getNotifications);

async function getNotifications(req, res) {
	try {

		const notifications = await NotifyService.getNotifications();

		return res.status(200).json({
			success: true,
			items: notifications
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error
    });
  }

}

module.exports = router;