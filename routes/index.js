var express = require('express');
var router = express.Router();

/* GET one curse. */
router.get('/:id', function(req, res, next) {
  return res.json({title: req.params.id});
});

module.exports = router;
