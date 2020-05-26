const express = require('express');
const router = express.Router();
const passport = require('passport');

require('../config/passport.js')(passport);

const { ReportsInterceptor } = require("../handlers/reports");

const middleware = passport.authenticate('jwt', { session: false });

const Reports = BindAll(ReportsInterceptor);

router.post('/', middleware, Reports.CreateReport);
router.get('/reference', middleware, Reports.GetReference);
router.post('/deleteRecord', middleware, Reports.DeleteRecord);
router.get('/:reference', middleware, Reports.GetReports);
router.post('/delete', middleware, Reports.DeleteWithId);


module.exports = router;
