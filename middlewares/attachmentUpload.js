/*
    Загрузчик файлов.
    Подключается как миддлеваре к Express. Информацию хранит в табличке attachments.
    Возвращает дальше по стеку string с именем файла.

    прим: router.post('/api/user', attachmentUpload.single("avatar"),  function(req, res) => {
    -- req.file is the `avatar` file
*/
const multer = require('multer');
const path = require('path');

const { attachment } = require('../models/index');
const mimeTypes = require('../config/mimeTypes');
const PathToUpload = process.env.NODE_ENV === 'production' ? 'public/assets/media/' : '../client/public/assets/media/';

const rootpwd = `${__dirname}/..`;
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, `${rootpwd}/${PathToUpload}`);
    },
    filename(req, file, cb) {
        try {
            attachment.create({
                originalFileName: file.originalname,
                userId: req.user.id,
                path: PathToUpload
            })
            .then(createdFile => {
                let ext = path.extname(file.originalname);
                if (!ext) {
                    ext = file.mimetype.replace('image/', '.');
                }

                let type = 'other';
                if (file.mimetype.includes('image')) type='image';
                if (file.mimetype.includes('video')) type='video';

                const filename = file.fieldname + '_' + createdFile.id + ext;

                attachment.update(
                    {
                        fileName: filename,
                        type: type
                    },
                    {
                        where: {
                            id: createdFile.id
                        }
                    }
                )
                .then(el => {})
                .catch(error => {
                    console.log(error);
                });

                cb(null, filename);
            })
            .catch(err => {
                console.error('Unable to connect to the database:', err);
            });
        } catch (err) {
            console.log(err);
            cb(err, null);
        }
    }
});

const fileFilter = (req, file, cb) => {
    let types = '';
    types = types + mimeTypes.images.join();
    types = types + ',' + mimeTypes.video.join();

    if (!types.split(",").includes(file.mimetype)) {
        let err = new Error(`File type "${file.mimetype}" is forbidden.`);
        console.log(err);
        // TODO: обработка этой ошибки везде, где используется мультер
        return cb(null, false, err);
    }

    cb(null, true);
};

module.exports = multer({ storage, fileFilter });
