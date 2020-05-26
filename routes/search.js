"use strict";

const express = require("express");
const router = express.Router();
const {CatalogService, UserService} = require("../services");
const passport = require("passport");
const middleware = passport.authenticate("jwt", {session: false});
require("../config/passport.js")(passport);


async function search(req, res) {
    try {

        const products = await getProducts(req);
        const authors = await getAuthors(req);

        return res.json({
            success: true,
            authors,
            products
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

async function getProducts(req) {
    const {findstr, categoryId, title, authorId, sort, direction, offset, limit, type} = req.query;

    const pageing = {
        limit: Number(limit ? limit : 3),
        offset: Number(offset ? offset : 0)
    };
    const sorting = {
        sort: (sort && ['date', 'ball', 'price'].includes(sort)) ? sort : 'ball',
        direction: (direction && ['desc', 'asc'].includes(direction)) ? direction : 'DESC'
    };

    return await CatalogService.GetAll(pageing, sorting, {
        userId: req.user.id,
        findstr,
        authorId,
        title,
        categoryId: Number(categoryId),
        type
    });
}

async function getAuthors(req) {
    const { findstr, categoryId, sort, direction, offset, limit } = req.query;

    const pageing = {
        limit: Number(limit ? limit : 3),
        offset: Number(offset ? offset : 0)
    };

    const sorting = {
        sort: (sort && ['date', 'product', 'sale', 'seen'].includes(sort)) ? sort : 'product',
        direction: (direction && ['desc', 'asc'].includes(direction)) ? direction : 'DESC'
    };

    return await UserService.GetAllAuthors(pageing, sorting, {
        userId: req.user.id,
        findstr,
        categoryId: (categoryId) ? categoryId.split(",") : null
    });
}

router.get("/", middleware, search);

module.exports = router;