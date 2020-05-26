"use strict";

const {
  seen_entities,
  favorites,
  notification_new_goods,
  attachment,
  product,
  product_category,
  coupon,
  discount,
  category,
  skills,
  users,
  comments,
  fts,
  users_data,
  rate
} = require("../models/index");
const Sequelize = require("sequelize");
const db = require("../models/index");
const path = require("path");
const fs = require("fs");
const Op = Sequelize.Op;
const cloneDeep = require("lodash/cloneDeep");
const { QueryTypes } = require("sequelize");
const CommentsService = require("../services/CommentsService");
const SaleService = require("../services/SaleService");

/**
 * * Сервис работы с каталогом продуктов
 */
module.exports = {

  /**
   * * Получить просмотренные продукты
   * @param {Модель выборки} model
   */
  async GetSeen(userId, productId) {
    if (userId) {
      return seen_entities.findAll({
        where: {
          userId: userId,
          typeId: Entities.Product
        },
        order: [["createdAt", "DESC"]],
        limit: 5
      });
    }
    return seen_entities.findAll({
      where: {
        entityId: productId,
        typeId: Entities.Product
      }
    });
  },

  /**
   * * Привести категории к древовидному формату
   * @param {*} categories
   * @param {*} subCategories
   */
  async BuildTreeCategory(categories, subCategories) {
    let _categories = cloneDeep(categories);
    let _sub = cloneDeep(subCategories);
    const total = _categories.concat(_sub);
    const treeBuilder = (root, child) => {
      if (!root.childrens) {
        root.childrens = [];
      }

      root.childrens.push(child);
    };

    for (let i = 0; i < _sub.length; i++) {
      try {
        let item = _sub[i];
        let parentItem = total.find(c => c.id == item.parent);
        if (!parentItem) {
          ILogger.error(
            "BuildTreeCategory не найден родитель категории %d",
            JSON.stringify(item)
          );
        }

        treeBuilder(parentItem, item);
      } catch (err) {
        ILogger.error(err);
      }
    }

    return _categories;
  },

  /**
   * * Получить список категорий в виде дерева
   * @param {http-request} query
   */
  async GetCategories(model) {
    const { topOnly } = model;
    if (topOnly && topOnly.toLowerCase() == "true") {
      const query = fs.readFileSync(
        path.join(__dirname, "/sql/category/top.sql"),
        "utf8"
      );
      const categories = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
        model: category,
        mapToModel: true
      });

      return categories;
    }
    const categories = await category.findAll({
      where: {
        parent: {
          [Op.eq]: null
        },
        active: {
          [Op.eq]: true
        }
      },
      attributes: ["id", "name"],
      raw: true
    });
    const sub = await product_category
      .findAll({
        include: [
          {
            model: category,
            as: "categoryItem",
            required: true,
            where: {
              active: true
            },
            attributes: ["id", "name", "parent"]
          }
        ],
        attributes: [],
        group: ["categoryItem.id"],
        raw: true
      })
      .map(c => {
        return {
          id: c["categoryItem.id"],
          name: c["categoryItem.name"],
          parent: c["categoryItem.parent"]
        };
      });

    return {
      categories,
      sub
    };
  },

  /**
   * * Получить список уведомлений
   * @param {Модель запроса} model
   */
  async GetNotificationNewGoods(model) {
    return notification_new_goods.findAll({
      where: model
    });
  },

  /**
   * * Получить имя вложения
   * @param {Модель запроса} model
   */
  async GetAttachmentFileName(model) {
    return attachment
      .findOne({
        where: model,
        order: [["id", "DESC"]]
      })
      .then(res => {
        return res.fileName;
      });
  },

  /**
   * * Создать продукт
   */
  async Create(model) {
    const item = await product.create(model);
    return item;
  },

  /**
   * * Получить список подкатегорий
   * @param {*} categoryId
   */
  async GetSubCategories(categoryId) {
    let result = [];
    const categories = await category.findAll({
      where: {
        active: true
      }
    });

    const categorySearcher = id => {
      const i = categories.find(c => c.id == id);
      if (!i) {
        return;
      }

      if (!i.parent) {
        const childrens = categories.filter(c => c.parent == id);
        if (childrens) {
          result = result.concat(childrens.map(c => c.id));
        }
      } else {
        result.push(i.id);
      }
    };

    if (Array.isArray(categoryId)) {
      categoryId.forEach(c => {
        categorySearcher(c);
      });
    } else {
      categorySearcher(categoryId);
    }

    return result;
  },

  /**
   * * Получение списка продуктов
   * @param {Object} pageing правила пагинации включают в себя параметры limit && ofset
   * @param {Object} sorting сортировка включает в себя параметры sort && desc
   * @param {Object} query допустимая модель запроса -  title, categoryId, authorId, findstr
   */
  async GetAll(pageing, sorting, query) {
    CoreUtils.EraseArgsIfNull(query);
    const { limit, offset } = pageing;
    const { title, categoryId, authorId, findstr, type, active } = query;
    const { sort, direction } = sorting;

    let where = {};
    if (active) {
      where['active'] = active;
    }
    // заголовок
    if (title) {
      where['title'] = {
        [Op.substring]: title
      };
    }
    // id-автора
    if (authorId) {
      where['authorId'] = authorId;
    }
    if (type) {
      where['entityId'] = type;
    }
    // категория
    let findCategoriesModel = [];
    if (categoryId) {
      const subCategories = await category.findAll({
        attributes: ['id'],
        where: {
          parent: categoryId
        }
      })
      .map(el => el.get('id'));

      findCategoriesModel = [{
        model: category,
        as: "findcategories",
        attributes: [],
        required: true,
        where: {
          id: [categoryId, ...subCategories]
        }
      }]
    }

    // полнотекстовый поиск: заголовок, имя автора, фамилия автора
    let fullTextSearchModel = [];
    if (findstr) {
      fullTextSearchModel = [{
        model: fts,
          as: "fts",
          attributes: [],
          where: {
            'findstr': {
              [Op.substring]: findstr
            }
          }
      }];
    }

    // сортировка
    let order = [];
    let sortQuery;
    switch (sort) {
      case 'date':      // по дате
        sortQuery = 'createdAt';        
        break;
      case 'price':     // по цене
        sortQuery = 'price'; 
        break;
      case 'sales':     // по количесту продаж
        sortQuery = Sequelize.literal(`(select count(*) from sale_item where productId=product.id)`); 
        break;
      case 'lastsale':  // по дате последней продажи
        sortQuery = Sequelize.literal(`(select max(createdAt) from sale_item where productId=product.id)`); 
        break;
      case 'ball':      // по рейтингу
      default:          // &(по-умолчанию)
        sortQuery = 'ball';
        break;
    };

    // основная сортировка
    order.push([
      sortQuery,
      (direction && direction == 'asc') ? direction : 'desc'
    ]);

    // вторым признаком сортировки добавим кол-во дату создания продукта
    if (sort && sort != 'date') {
      order.push( [
        'createdAt',
        'asc'
      ] );
    };

    
    // каталог
    const products = await product.findAll({
      limit,
      offset,
      order,
      attributes: {exclude: ['content', 'description']},
      where,
      include: [
        ...fullTextSearchModel,
        ...findCategoriesModel,
        {
          model: category,
          as: "categories",
          attributes: {exclude: ['createdAt', 'updatedAt']},
          through: { attributes: [] },
        },
        {
          model: users,
          as: "author",
          attributes: ["id", "firstName", "lastName", "email", "avatar", "authorAbout"],
          include: [
            {
              model: users_data,
              as: "userdata",
              attributes: {exclude: ['createdAt', 'updatedAt']}
            }
          ]
        },
        {
          model: coupon,
          as: 'coupon'
        },
        {
          model: discount,
          as: 'discount'
        },
        {
          model: skills,
          as: 'skills',
          attributes: ["id", "description"],
          through: { attributes: [] }
        },
        {
          model: favorites,
          as: "favorite",
          required: false
        },
        {
          model: comments,
          as: "comments",
          where: {
            read: false
          },
          required: false
        }
      ],
    });

    // добавляем данные по продажам - количество продаж продукта
    const productIds = products.map(prod => prod.id);
    const sales = await SaleService.GetCountSales(productIds);
    for (let i=0; i<products.length; i++) {
      const ps = sales.find(el => el.productId == products[i].id);
      products[i].setDataValue('sales', ps ? ps : null );
    }

    return products;
  },

  /**
   * * Получить опубликованные продукты пользователя
   * @param {*} userId
   */
  async GetPublished(userId) {
    return product
      .findAll({
        where: {
          authorId: userId
        },

        include: [
          {
            model: category,
            as: "categories",
            group: ["name"]
          },
          {
            model: users,
            as: "author",
            attributes: ["id", "firstName", "lastName", "email", "avatar","authorAbout"],
            include: [
              {
                model: users_data,
                as: "userdata"
              },
              {
                model: comments,
                as: "comments",
                where: {
                  read: false
                },
                required: false
              }
            ]
          },
          {
            model: favorites,
            as: "favorite"
          },
          {
            model: comments,
            as: "comments",
            where: {
              read: false
            },
            required: false
          }
        ]
      })
      .then(res => {
        return res;
      });
  },

  /**
   * * Получить продукт по уникальному идентификатору
   */
  async GetOne(userId, id) {
    return product
      .findOne({
        where: {
          id: id
        },
        include: [
          {
            model: category,
            as: "categories"
          },
          {
            model: users,
            as: "author",
            attributes: ["id", "firstName", "lastName", "email", "avatar", "authorAbout"]
          },
          {
            model: coupon,
            as: 'coupon'
          },
          {
            model: discount,
            as: 'discount'
          },
          {
            model: skills,
            as: 'skills',
            attributes: ["id", "description"],
            through: { attributes: [] }
          },          
          {
            model: favorites,
            as: "favorite",
            where: {
              userId: userId,
              typeId: Entities.Product
            },
            required: false
          }
        ]
      })
      .then(async p => {
        //* Вносим информацию как о просмотренном продукте
        if (!p) {
          throw new Error('Продукт не найден.');
        }

        const records = await seen_entities.findAll({
          limit: 5,
          where: {
            userId: userId,
            typeId: Entities.Product
          }
        });
        const exists = records.filter(r => r.entityId === p.id);

        // * Если запись не существует, вносим в бд
        if (!exists.length) {
          const model = {
            userId: userId,
            typeId: Entities.Product,
            entityId: p.id,
            title: p.title
          };
          await seen_entities.create(model);
        }

        // добавляем данные по продажам - количество продаж продукта
        const productsSales = await SaleService.GetCountSales(p.id);
        p.setDataValue('sales', (productsSales && productsSales[0]) ? productsSales[0] : null );

        // кол-во комментариев
        p.setDataValue('commentsCount', await CommentsService.getCountComments({
          entityId: global.Entities.Product,
          referenceId: p.id
        }));

        // рейтинг поставленный пользователем
        const rating = await rate.findOne({
          where: {
            entityId: p.entityId,
            referenceId: p.id,
            userId
          }
        });
        p.setDataValue('userRating', rating ? rating.ball : 0);

        return p;
      });
  },

  /**
   * * Получить количество записей
   */
  async Count(modelWhere) {
    const { title, categoryId, authorId, type, findstr, active } = modelWhere;
    let where = {};
    // опубликован/неопубликован
    if (active) {
      where['active'] = active;
    };
    // заголовок
    if (title) {
      where['title'] = {
        [Op.substring]: title
      };
    }
    // id-автора
    if (authorId) {
      where['authorId'] = authorId;
    }
    // категория
    let findCategoriesModel = [];
    if (categoryId) {
      const subCategories = await category.findAll({
        attributes: ['id'],
        where: {
          parent: categoryId
        }
      })
      .map(el => el.get('id'));

      findCategoriesModel = [{
        model: category,
        as: "findcategories",
        attributes: [],
        required: true,
        where: {
          id: [categoryId, ...subCategories]
        }
      }]
    }

    // тип продукта
    if (type) {
      where['entityId'] = type;
    }

    // полнотекстовый поиск: заголовок, имя автора, фамилия автора
    let fullTextSearchModel = [];
    if (findstr) {
      fullTextSearchModel = [{
        model: fts,
          as: "fts",
          attributes: [],
          where: {
            'findstr': {
              [Op.substring]: findstr
            }
          }
      }];
    }

    // каталог
    const productsCount = await product.count({
      where,
      include: [
        ...fullTextSearchModel,
        ...findCategoriesModel,
      ],
      distinct: true,
      col: 'id'
    });
    return {count: productsCount};
    
  },

  /**
   * * Получить новинки по категориям пользователя (15 свежайших по дате)
   * @param {*} products Массив идентификаторов продуктов
   */
  async GetNewsOfProductAsync(products) {
    const categories = await product_category
      .findAll({
        where: {
          productId: {
            [Op.in]: products
          }
        }
      })
      .map(c => c.categoryId);

    return product.findAll({
      where: {
        id: {
          [Op.notIn]: products
        }
      },
      limit: 15,
      order: [["date", "DESC"]],
      include: [
        {
          model: category,
          as: "categories",
          where: {
            id: {
              [Op.in]: [...new Set(categories)]
            }
          },
          required: true
        }
      ]
    });
  },

  async GetFavorites(userId) {
    return product.findAll({
      include: [
        {
          model: category,
          as: "categories"
        },
        {
          model: users,
          as: "author",
          attributes: ["id", "firstName", "lastName", "email", "avatar", "authorAbout"]
        },
        {
          model: favorites,
          as: "favorite",
          required: true,
          where: {
            userId: userId,
            typeId: Entities.Product
          }
        }
      ]
    });
  },


  /**
   * * Является ли пользователь автором продукта?
   * @param {*} productId id продукта
   * @param {*} userId id пользователя
   */
  async isProductOwner(productId, userId) {
    const prod = await product.findByPk(productId);
    return prod.authorId == userId;
  },

/**
   * * Обновить поля продукта
   * @param {*} productId id продукта
   * @param {*} userId id пользователя
   */
  async updateProduct(id, patch) {
    return product.update(patch, {
      where: { id }
    });
  }

}
