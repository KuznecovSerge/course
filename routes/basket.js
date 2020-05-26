"use strict";

const passport = require("passport");
const express = require("express");
const router = express.Router();
require("../config/passport.js")(passport);
const middleware = passport.authenticate("jwt", { session: false });
const { BasketService } = require("../services/index");

router.post("/", middleware, OnAddBasketItem);
router.get("/:userId", GetBasket);
router.post("/delete", middleware, RemoveItem);
router.post("/clear", middleware, ClearAll);

/**
 * * Очистить корзину пользователя
 * @param {*} req 
 * @param {*} res 
 */
async function ClearAll(req, res) {
  try {
    const userId = req.user.id;
    const result = await BasketService.ClearAll(userId);

    return res.status(200).json({
      success: !!result
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err
    });
  }
}

/**
 * * Удалить элемент из корзины
 * @param {*} req 
 * @param {*} res 
 */
async function RemoveItem(req, res) {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    const result = await BasketService.RemoveBasketItem(userId, productId);

    return res.status(200).json({
      success: !!result
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err
    });
  }
}

/**
 * * Получить корзину пользователя
 * @param {*} req 
 * @param {*} res 
 */
async function GetBasket(req, res) {
  try {
    const { userId } = req.params;

    const basket = await BasketService.GetBasket(userId);

    return res.status(200).json({
      success: true,
      products: basket.map(basket => basket.product)
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err
    });
  }
}

/**
 * * Добавление товара в корзину
 * @param {*} req
 * @param {*} res
 */
async function OnAddBasketItem(req, res) {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: {
          productId
        }
      });
    }

    const result = await BasketService.AddBasketItem(userId, productId);

    return res.status(200).json({
      success: true,
      exists: !result[1]
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err
    });
  }
}

module.exports = router;
