const passport = require('passport');
const express = require('express');
const router = express.Router();
const { InboxInterceptor } = require("../handlers/inbox");
const Inbox = BindAll(InboxInterceptor);

require('../config/passport.js')(passport);

const middleware = passport.authenticate('jwt', { session: false });

router.post("/", middleware, Inbox.Create);
router.post('/markasread', middleware, Inbox.MarkAsRead);
router.get('/all/:userId', middleware, Inbox.GetAllMessages);
router.get("/:userId", middleware, Inbox.GetMessage);

module.exports = router;
