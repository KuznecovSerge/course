"use strict";

const express = require("express");
const router = express.Router();
const passport = require("passport");

require("../config/passport.js")(passport);

const { SaleService, BasketService } = require("../services");

const middleware = passport.authenticate("jwt", { session: false });
const pick = require("lodash/pick");

router.post("/", middleware, async (req, res) => {
  try {
    const sale = req.body.sale;
    if (sale) {
      const data = await SaleService.CreateSale(sale);
      return res.status(200).json({
        success: true,
        item: data
      });
    } else {
      throw new Error("Что-то пошло не так! Запись пуста");
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err
    });
  }
});

router.post("/process?", async (req, res) => {
  try {
    const { v } = req.query;
    if (v === "ik") {
      const saleDTO = pick(req.body, [
        "ik_am",
        "ik_co_id",
        "ik_co_prs_id",
        "ik_co_rfn",
        "ik_cur",
        "ik_desc",
        "ik_inv_crt",
        "ik_inv_id",
        "ik_inv_prc",
        "ik_inv_st",
        "ik_pm_no",
        "ik_ps_price",
        "ik_pw_via",
        "ik_sign",
        "ik_trn_id"
      ]);
      const result = await SaleService.RegisterInterkassaSale(saleDTO);
      let item = await SaleService.GetById(saleDTO.ik_pm_no);
      if (item) {
        const { id, userId, amount, discount } = item;
        await SaleService.Create({
          userId,
          amount,
          discount,
          status: saleDTO.ik_inv_st,
          parent: id
        });
        await BasketService.ClearAll(userId);
      }

      return res.status(200).json({
        success: true,
        result: result
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false
    });
  }
});

router.get("/:userId", middleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(500).json({
        success: false,
        error: "userId is null!"
      });
    }

    const sales = await SaleService.Get(userId);
    return res.status(200).json({
      success: true,
      values: sales
    });
  } catch (err) {
    return res.status(500).json({
      success: false,

      message: err
    });
  }
});

module.exports = router;
