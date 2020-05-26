"use strict";

const { CacheService } = require("./CacheService");
const CatalogService = require("./CatalogService");
const CommentsService = require("./CommentsService");
const { FavoriteService } = require("./FavoriteService");
const { InboxService } = require("./InboxService");
const { ProductService } = require("./ProductService");
const { ReportsService } = require("./ReportsService");
const SaleService = require("./SaleService");
const UserService = require("./UserService");
const BasketService = require("./BasketService");
const { JournalService } = require("./JournalService");
const { TagService } = require("./TagService");
const NotifyService = require("./NotifyService");
const LikeService = require("./LikeService");

module.exports = {
  CacheService,
  CatalogService,
  CommentsService,
  FavoriteService,
  InboxService,
  ProductService,
  ReportsService,
  SaleService,
  UserService,
  BasketService,
  JournalService,
  TagService,
  NotifyService,
  LikeService
};
