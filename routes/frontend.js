const express = require('express');
const router = express.Router();

const { attachment } = require('../models/index');

const upload = require('../middlewares/attachmentUpload');

const passport = require('passport');
require('../config/passport.js')(passport);

router.post('/upload-file/', upload.single('file'), function (req, res, next) {
    try {
        attachment.findOne({
            where: {
               fileName: req.file.filename
            },
            order: [
                ['id', 'DESC']
            ]
        })
        .then(photo => {
            return res.json({ success: true , location:  photo.pathToUpload + photo.fileName });
        })
        .catch(error => {
            return res.status(500).json({ success: false, error: error });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: error });
    }
});

module.exports = router;