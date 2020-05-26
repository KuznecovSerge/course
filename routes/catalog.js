"use strict";

const express = require("express");
const router = express.Router();
const { CatalogService, CacheService, SaleService, UserService } = require("../services");
const passport = require("passport");
const middleware = passport.authenticate("jwt", { session: false });
require("../config/passport.js")(passport);
const cacheService = new CacheService(0.2);


router.get("/popular", middleware, getPopularBySale);
router.get("/favorites/:userId", getPopularByFavorite);
router.get("/seen/:id", middleware, getSeen);
router.get("/category", middleware, getCategories);
router.get("/user/:id", middleware, getPublishedByUser);
router.get("/:id", middleware, getProductOne);
router.get("/", middleware, getProducts);
router.get("/count", middleware, getProductsCount);

router.put("/:id", middleware, updateProductOne);

/**
 * *
 * Получить список просмотров по
 * * пользователю - /api/catalog/seen/:userId (приоритет) 
 * * продукту - проверил не работает, хз зачем нужно
 * * ! просмотры нужны пока только для графика статистики - снести функцию?
*/
async function getSeen(req, res) {
  try {
    const user = req.user.id;
    const product = req.query.productId;

    const records = await CatalogService.GetSeen(user, product);

    return res.status(200).json({
      success: true,
      products: records
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
};


/**
 * *
 * Получить список категорий
*/
async function getCategories (req, res) {
  try {
    const { topOnly, categoryId, asTree } = req.query;
    const model = await cacheService.GetOrAdd(
      `catalog_category_${JSON.stringify(req.query)}`,
      async () => {
        let _tree = [];
        let _categories = [];
        let _category = null;

        // Получаем список категорий
        _categories = await CatalogService.GetCategories({
          topOnly
        });

        // В режиме дерева форматируем в древовидный формат
        if (CoreUtils.StringToBoolean(asTree)) {
          _tree = await CatalogService.BuildTreeCategory(
            _categories.categories,
            _categories.sub
          );
        }

        // Если требуется вернуть выбранную категорию
        if (!!categoryId) {
          const category = _categories.categories
            .concat(_categories.sub)
            .find(i => Number(i.id) === Number(categoryId));
          if (!!category) {
            _category = category;
          }
        }

        let result = {
          success: true,
          items: _tree.length ? _tree : _categories
        };

        if (_category) {
          Object.assign(result, {
            category: _category
          });
        }
        return result;
      }
    );

    return res.status(200).json(model);
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
};

/**
 * *
 * Получить список товаров популярных по добавленнию в избранное
*/
async function getPopularByFavorite (req, res) {
  try {
    const { userId } = req.params;

    const favorites = await CatalogService.GetFavorites(userId);
    return res.status(200).json({
      success: true,
      products: favorites
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error
    });
  }
};

/**
 * *
 * Получить список товаров популярных по продажам
*/
async function getPopularBySale (req, res) {
  try {
    const items = await SaleService.GetSoldFavorite();
    return res.status(200).json({
      success: true,
      items: items
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err
    });
  }
}

/**
 * * Получить количество продуктов
 * @param {*} req 
 * @param {*} res 
 */
async function getProductsCount (req, res) {
  try {
    const { categoryId, title, findStr, authorId, type } = req.query;

    // для менеджеров показать неопубликованные продукты
    const isManager = await UserService.isManager(userId);
    const active = isManager ? null : true;

    const data = await CatalogService.Count({ title, categoryId, authorId, findStr, type, active });
    return res.status(200).json({
      success: true,
      items: data
    });
  } catch (err) {
    return res.status(500).json({
      success: false
    });
  }
}

/**
 * *
 * Получить список продуктов из каталога
 * * Фильтры:      categoryId, title, authorId
 * * Пагинация:    limit, offset
*/
async function getProducts (req, res) {
  ILogger.method("Получаем список продуктов %o", req.query);

  const { findstr, categoryId, title, authorId, type, sort, direction, offset, limit } = req.query;
  const userId = req.user.id;
  try {
    const pageing = {
      limit: Number(limit ? limit : 20),
      offset: Number(offset ? offset : 0)
    };
    const sorting = {
      sort: (sort && ['date', 'ball', 'price', 'sales', 'lastsale'].includes(sort)) ? sort : 'ball',
      direction: (direction && ['desc', 'asc'].includes(direction)) ? direction : 'DESC' 
    };
    // для менеджеров показать неопубликованные продукты
    const isManager = await UserService.isManager(userId);
    const active = isManager ? null : true;
    // запрос каталога
    const where = {
      userId,
      findstr,
      authorId,
      title,
      categoryId: Number(categoryId),
      type,
      active
    }; 
    let data = await CatalogService.GetAll(pageing, sorting, where);
    const externalData = {
      count: (await CatalogService.Count(where)).count
    };
    return res.status(200).json({
      success: true,
      items: data,
      ...externalData
    });
  } catch (error) {
    ILogger.error("Ошибка получения данных %o", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * *
 * Получить список опубликованных товаров пользователя
*/
async function getPublishedByUser (req, res) {
  try {
    const user = req.params.id;
    const products = await cacheService.GetOrAdd(
      `GetPublished_${user}`,
      async () => {
        return CatalogService.GetPublished(user);
      }
    );

    return res.json({
      success: true,
      items: products
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err
    });
  }
};

/**
 * *
 * Получить один продукт
*/
async function getProductOne (req, res) {
  try {
    const pId = req.params.id;
    const userId = req.user.id;
    if (!pId) {
      return res.status(500).json({
        success: false,
        error: `Product id is ${pId}`
      });
    }
    const product = await CatalogService.GetOne(userId, pId);
    // продукт не опубликован
    if (!product.active) {
      // и доступ получает не автор и не менеджер
      const isProductOwner = await CatalogService.isProductOwner(product.id, userId);
      const isManager = await UserService.isManager(userId);
      if (!isProductOwner && !isManager) {
        throw new Error('Продукт не опубликован');
      }  
    }

    return res.status(200).json({
      success: true,
      product: product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * *
 * Обновить один продукт
*/
async function updateProductOne (req, res) {
  try {
    const { id } = req.params;
    const productPatch = req.body;
    const userId = req.user.id;

    // проверяем, является ли пользователь автором продукта или менеджером 
    const isProductOwner = await CatalogService.isProductOwner(id, userId);
    const isManager = await UserService.isManager(userId);
    if (!isProductOwner && !isManager ) {
      return new Error('У вас нет доступа к этому продукту');
    }

    await CatalogService.updateProduct(id, productPatch);
    const product = await CatalogService.GetOne(userId, id);

    return res.status(200).json({
      success: true,
      product: product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


module.exports = router;
