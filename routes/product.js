"use strict";

const { Entities } = require("../core/Constants");
const passport = require("passport");
const express = require("express");
const router = express.Router();
const omit = require("lodash/omit");
const { productService } = require("../services/ProductService");
const LikeService = require("../services/LikeService");

require("../config/passport.js")(passport);

const middleware = passport.authenticate("jwt", { session: false });

router.post("/", middleware, createProduct);
router.get("/details/:id", middleware, getProductDetails);
router.get("/details/course/:id", middleware, getProductDetailsCourse);
router.post("/rate", middleware, rateProduct);

/**
 * * Оценка продукта
 * * * referenceId - Идентификатор продукта (id)
 * * * entityId - Тип продукта (курс\урок\вебинар)
 * * * rate - Рейтинг поставленный пользователем
 */
async function rateProduct(req, res) {
  try {
    const { referenceId, entityId, rate } = req.body;
    const { id } = req.user;
    
    const ball = await LikeService.addRate(entityId, referenceId, id, rate);

    return res.status(200).json({
      success: true,
      ball
    });
  } catch (err) {
    return res.status(500).json({
      success: false
    });
  }
}

/**
 * * Создаёт продукт
 * * -Комментарии: частично подготавливаем данные
 * *  1) разбиваем на продукт и материал
 * *  2) меняем тип на id-типа
 * *  3) объединем категорию и субкатегории
 * *  Далее отправляем в продуктСервис
 */
async function createProduct(req, res) {
  try {
    const data = req.body.product;
    let product = omit(data, ['step', 'type', 'subCategory', 'materials']);
    // меняем тип на id и выбираем указанный материал

    product.producttypeId = 0;
    product.authorId = req.user.id;
    product.video = await productService.PrepareVideo(data.video) || null;

    let material;
    if (data.type === 'course')       { product.producttypeId = Entities.Course; material = data.materials.course }
    if (data.type === 'lesson')       { product.producttypeId = Entities.Lesson; material = data.materials.lesson }
    if (data.type === 'webinar')      { product.producttypeId = Entities.Webinar; material = data.materials.webinar }
    if (data.type === 'consultation') { product.producttypeId = Entities.Consult; material = data.materials.consultation }
    if (data.type === 'book')         { product.producttypeId = Entities.Book; material = data.materials.book }
    product.price = Number(product.price);
    product.entityId = product.producttypeId;
    // значение по умолчанию
    product.active = 1;
    product.ball = 0;
    // категории и подкатегории хранятся в одной таблице в виде дерева - потому объединяем их
    product.category = [data.category, ...data.subCategory];

    const result = await productService.Create(product, material);

    return res.status(200).json({
      success: true,
      product: result
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


async function getProductDetails(req, res) {
  try {
    const model = {
      userId: req.user.id,
      productId: req.params.id
    };

    if (!model.userId || !model.productId) {
      return res.status(500).json({
        success: false,
        error: `Model is incorrect! ${model}`
      });
    }

    const data = await this.service.Details(model);
    return res.status(200).json({
      success: true,
      details: data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error
    });
  }
};


async function getProductDetailsCourse(req, res) {
  try {
    const model = {
      id: req.params.id
    };

    const data = await this.service.DetailsCourse(model, req.user.id);

    return res.status(200).json({
      success: true,
      course: data
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err
    });
  }
}

module.exports = router;
