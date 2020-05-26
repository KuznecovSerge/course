const express = require("express");
const router = express.Router();
const passport = require("passport");
const upload = require("../middlewares/attachmentUpload");
const sharp = require('sharp');
const fs = require('fs');
const {
    attachment
} = require("../models/index");
  
require("../config/passport.js")(passport);
const middleware = passport.authenticate("jwt", { session: false });

const PathToUpload = process.env.NODE_ENV === 'production' ? 'public/assets/media/' : '../client/public/assets/media/';


router.get("/:id", middleware, getFileOne);
router.get("/", middleware, getFiles);
router.post("/", middleware, upload.single("file"), saveFile);
router.delete("/:id", middleware, deleteFile);

async function getFiles(req, res) {
    try {

        let { limit, offset } = req.query;
        if (limit) limit = Number(limit) 
        else limit = 10;

        if (offset) offset = Number(offset);
        else offset = 0;

        const files = await attachment.findAll({
            limit:  limit,
            offset: offset,
            order: [
                ['id', 'DESC']
            ],
            where: {
                userId: req.user.id
            }
        });

        return res.status(200).json({
            success: true,
            files: files
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

async function getFileOne(req, res) {
    try {
        const id = Number(req.params.id)

        const file = await attachment.findOne({
            where: {
                userId: req.user.id,
                id: id
            }
        });

        return res.status(200).json({
            success: true,
            file: file
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}


async function saveFile(req, res) {
    try{
        if (req.file !== undefined) {
            let file = req.file;
            
            let result;
            if (file.mimetype.includes('image')) {
                result = await sharp( PathToUpload + file.filename )
                .resize( 240, 150, { fit: 'cover' } )
                .toFile(`${PathToUpload}preview/${file.filename}`);
            }

            return res.status(200).json({
                success: true,
            });
        } else throw new Error('Файл не отправлен');
    } catch(error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

async function deleteFile(req, res) {
    let fileId;
    try{
        fileId = Number(req.params.id);
        if (fileId > 0) {
            let file = await attachment.findOne({
                where: {
                  id: fileId,
                  userId: req.user.id
                }
            });

            if (file) {
                // удаляем файл
                fs.unlinkSync(PathToUpload + file.fileName);
                // удаляем превью
                if ( fs.existsSync(`${PathToUpload}preview/${file.fileName}`) )
                    fs.unlinkSync(`${PathToUpload}preview/${file.fileName}`);
                // удаляем запись из таблицы
                let result = await attachment.destroy({
                    where: {
                        id: fileId,
                        userId: req.user.id
                      }
                });

                return res.status(200).json({
                    success: true,
                    msg: result
                })

            } else throw new Error('Файл не найден (или доступ запрещён)');

            
        } else throw new Error('Неправильный id файла');
    } catch(error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }

}


module.exports = router;