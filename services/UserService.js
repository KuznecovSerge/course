"use strict";

const {
  Subscribing_user_to_author,
  Subscribing_user_to_authors_blog,
  Subscribed_users_to_tags,
  Favorites,
  Users,
  Product,
  product_category,
  Category,
  Comments,
  seen_entities,
  rate
} = require("../models/index");
const db = require("../models/index");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const LikeService = require("../services/LikeService");

module.exports = {

  /**
   * * Получение списка авторов
   * @param {Object} pageing правила пагинации включают в себя параметры limit && ofset
   * @param {Object} sorting сортировка включает в себя параметры sort && desc
   * @param {Object} query допустимая модель запроса - categoryId, findstr
   */
  async GetAllAuthors(pageing, sorting, query) {
    CoreUtils.EraseArgsIfNull(query);
    const { limit, offset } = pageing;
    const { categoryId, findstr, userId } = query;
    const { sort, direction } = sorting;

    // WHERE: фильтрация по категориям через include модели
    let whereCategories = [];
    if (categoryId) {
      // вытаскиваем все подкатегории у родительских категорий
      const subCategories = await Category.findAll({
        attributes: ['id'],
        where: {
          parent: categoryId
        }
      })
      .map(el => el.get('id'));

      // используем таблицу Product - в качестве связи м-м:  user - product(м-м) - product_category 
      const categoriesConcat = [...categoryId, ...subCategories].join(",");
      whereCategories = [ Sequelize.literal(`users.id in 
        (select distinct authorId 
          from product p inner join product_category c on p.id=c.productId
          where c.categoryId in (${categoriesConcat}))`)
      ]
    }

    // WHERE: полнотекстовый поиск: имя автора, фамилия автора
    let whereFindstr = [];
    if (findstr) {
      whereFindstr = [
        Sequelize.where(Sequelize.fn('concat', Sequelize.col('firstName'), ' ', Sequelize.col('lastName')), {
          [Op.like]: `%${findstr}%`
        })
      ];
    }

    // сортировка
    let order = [];
    let sortQuery;
    switch (sort) {
      case 'product':   // по количеству продуктов
        sortQuery = Sequelize.literal('(select count(*) from product where authorId=users.id)');        
        break;
      case 'sale':      // по количесту продаж продуктов
        sortQuery = Sequelize.literal('(select count(*) from sale_item where productId in (select id from product where authorId=users.id))'); 
        break;
      case 'seen':      // по количесту просмотров
        sortQuery = Sequelize.literal(`(select count(*) from seen_entities where entityId=users.id and typeId=${global.Entities.Author})`); 
        break;
      case 'date':      // по дате
      default:          // &(по-умолчанию)
        sortQuery = 'CreatedAt';
        break;
    }
    // основная сортировка
    order.push([
      sortQuery,
      (direction && direction == 'asc') ? direction : 'desc'
    ]);
    // вторым признаком сортировки добавим кол-во продуктов
    if (sort && sort != 'product') {
      order.push( [
        Sequelize.literal('(select count(*) from product where authorId=users.id)'),
        (direction && direction == 'asc') ? direction : 'desc'
      ] );
    };


    // аттрибуты - поля, которые вытаскиваем по автору
    const fields = Object.keys(Users.tableAttributes).filter(key => key != 'password' && key != 'token' );
    const attributes = [
        // перечисление полей (с raw вставками по-умолчанию sequelize не передаёт '*' )
        ...fields,
        [ // категории через запятую, в которые входят все продукта автора 
          Sequelize.literal(`
            (
              select GROUP_CONCAT(distinct categoryId) as categories
              from product_category c
              where c.productId in (select id from product p where p.authorId=users.id)
            )
          `),
          'categoriesConcat'],
        [ // количество продуктов
          Sequelize.literal('(select count(*) from product where authorId=users.id)'),
          'productsCount'
        ],
        [ // количество просмотров
          Sequelize.literal(`(select count(*) from seen_entities where entityId=users.id and typeId=${global.Entities.Author})`),
         'seen'
        ],
        [ // количество комментариев
          Sequelize.literal(`(select count(*) from comments where referenceId=users.id and entityId=${global.Entities.Author})`),
         'commentsCount'
        ],
        [ // подписка пользователя на автора
          Sequelize.literal(`(select true from subscribing_user_to_author where authorId=users.id and userId=${userId})`),
         'subscribe'
        ],
        [ // оценка автора
          Sequelize.literal(`(select COALESCE(avg(ball), 0) from rates where referenceId=users.id and entityId=${global.Entities.Author})`),
          'ball'
        ]
    ];

    
    // запрос по авторам
    const authors = await Users.findAll({
      limit,
      offset,
      order,
      attributes,
      where: {
        $and: [
          { active: true },
          ...whereFindstr,
          ...whereCategories,
          Sequelize.literal('0<(select count(*) from product where authorId=users.id)') // у автора - хотя бы один продукт
        ]
      }
    });

    // переводим из модели в json, чтобы в модель добавить объекты (через setDataValue - только простые типы)
    const authorsJSON = authors.map(author => author.toJSON());
    // получаем список категорий
    const categories = await Category.findAll({attributes: ['id', 'name'], raw: true});
    // заменяем перечисление id-категорий через запятую на массив категорий по имени 
    authorsJSON.map(author => {
      if (author.categoriesConcat) {
        let catsName = [];
        author.categoriesConcat.split(",").forEach(catId => {
          const cat = categories.find(c => c.id == catId);
          if (cat && cat.name) catsName.push(cat);  
        });
        author.categories = catsName;
      } else {
        author.categories = null;
      }
      delete(author.categoriesConcat);
    });

    return authorsJSON;
  },

 /**
   * * Получение автора
   * @param {Object} id идентификатор автора
   * @param {Object} userId текущего пользователя, нужен для записи "страница просмотрена"
   */
  async GetOneAuthor(id, userId) {
    const author = await Users.findOne({
      where: {
        id: id
      },
      include: [
        {
          model: Comments,
          as: "comments",
          where: {
            entityId: global.Entities.Author
          },
          required: false,
        }
      ],
      attributes: {
        exclude: ["password", "token"]
      }
    });

    if (!author) {
      return null;
    }

    // количество продуктов
    author.setDataValue('coursesCount', await Product.count({
      where: {
        authorId : author.id,
        entityId: global.Entities.Course
      }
    }));
    author.setDataValue('lessonsCount', await Product.count({
      where: {
        authorId : author.id,
        entityId: global.Entities.Comment
      }
    }));
    author.setDataValue('webinarsCount', await Product.count({
      where: {
        authorId : author.id,
        entityId: global.Entities.Author
      }
    }));
    author.setDataValue('consultationsCount', await Product.count({
      where: {
        authorId : author.id,
        entityId: global.Entities.Consult
      }
    }));
    author.setDataValue('booksCount', await Product.count({
      where: {
        authorId : author.id,
        entityId: global.Entities.Book
      }
    }));

    author.setDataValue('productsCount', await Product.count({
      where: {
        authorId : author.id
      }
    }));

    // рейтинг
    const myRate = await rate.findOne({
      where: {
        entityId: global.Entities.Author,
        referenceId: author.id,
        userId: userId
      }
    });
    author.setDataValue('myRating', myRate ? myRate.ball : 0);
    const ball = await LikeService.getRate(global.Entities.Author, author.id);
    author.setDataValue('ball', ball);

    // просмотры
    author.setDataValue('seen', await seen_entities.count({
      where: {
        typeId: global.Entities.Author,
        entityId: author.id
      }
    }));

    // количество комментариев
    author.setDataValue('commentsCount', await Comments.count({
      where: {
        entityId: global.Entities.Author,
        referenceId : author.id
      }
    }));

    // подписка на автора
    author.setDataValue('subscribe', await Subscribing_user_to_author.count({
      where: {
        authorId: author.id,
        userId : userId
      }
    }));


    // переводим из модели в json, чтобы в модель добавить объекты (через setDataValue - только простые типы)
    const authorJSON = author.toJSON();
    // категории
    try {
      const categories = await db.sequelize.query(`
        SELECT c.id, c.name 
              FROM product p INNER JOIN product_category m ON m.productId=p.id
              INNER JOIN category c ON m.categoryId=c.id 
              WHERE p.authorId=:userId
              GROUP BY categoryId
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
        raw: true,
        replacements: { userId: id }, 
      });
      authorJSON.categories = categories;
    } catch (error) {
      ILogger.error("Ошибка при получении категорий %o", error);
    };

    ////* Вносим информацию как о просмотренном авторе
    seen_entities.findOrCreate({
      where: {
        userId: userId,
        typeId: global.Entities.Author,
        entityId: author.id,
      },
      defaults: {
        title: `${author.firstName} ${author.lastName}`
      }
    });
    
    return authorJSON;
  },

  /**
   * * Подписаться на автора
   * @param {*} from Пользователь (кто подписывается) 
   * @param {*} to Пользователь (на кого подписывается)
   * @param {*} action Действие подписки, в случае 'remove' подписка удаляется
   */
  async subscribeToAuthor(userId, authorId, action) {
    let instance = await Subscribing_user_to_author.findOne({
      where: {
        userId,
        authorId
      }
    });

    if (action === 'remove') {
      if (!instance) return null;

      await instance.destroy();
      return null;
    }

    if (!instance) {
      instance = await Subscribing_user_to_author.create({
        userId,
        authorId
      });
    }

    return instance;
  },


  /**
   * * Получение списка авторов
   * @param {Object} query допустимая модель запроса - categoryId, findstr
   */
  async GetCountAuthors(query) {
    CoreUtils.EraseArgsIfNull(query);
    const { categoryId, findstr } = query;
    // категория
    let whereCategories = [];
    if (categoryId) {
      const subCategories = await Category.findAll({
        attributes: ['id'],
        where: {
          parent: categoryId
        }
      })
      .map(el => el.get('id'));

      // используем таблицу Product - в качестве связи м-м:  user - product(м-м) - product_category 
      const categoriesConcat = [...categoryId, ...subCategories].join(",");
      whereCategories = [ Sequelize.literal(`users.id in 
        (select distinct authorId 
          from product p inner join product_category c on p.id=c.productId
          where c.categoryId in (${categoriesConcat}))`)
      ]
    }

    // полнотекстовый поиск: имя автора, фамилия автора
    let whereFindstr = [];
    if (findstr) {
      whereFindstr = [
        Sequelize.where(Sequelize.fn('concat', Sequelize.col('firstName'), ' ', Sequelize.col('lastName')), {
          [Op.like]: `%${findstr}%`
        })
      ];
    }

    // авторы
    const authorsCount = await Users.count({
      where: {
        $and: [
         { active: true },
          ...whereFindstr,
          ...whereCategories,
          Sequelize.literal('0<(select count(*) from product where authorId=users.id)') // у автора - хотя бы один продукт
        ]
      },
    });

    return {count: authorsCount};
  },


  /**
   * * Получить список пользователей с ролью 'user'
   */
  async GetAllAsync() {
    return Users.findAll({
      where: {
        role: "user"
      }
    });
  },

  /**
   * * Получить пользователя
   */
  async getUser(id) {
    return Users.findOne({
      where: {
        id: id
      },
      attributes: {
        exclude: ["password"]
      }
    });
  },

  /**
   * * Получить пользователя
   */
  async getUserbyEmail(email) {
    return Users.findOne({
      where: {
        email
      },
      attributes: {
        exclude: ["password"]
      }
    });
  },

  /**
   * * Получить список пользователей асинхронно с ролью 'user'
   * * Используется для пагинации
   * * в модели обязателно передать limit и offset
   */
  async GetAllOffsetAsync(model) {
    return Users.findAll({
      limit: Number(model.limit),
      offset: Number(model.offset),
      where: {
        role: "user"
      }
    });
  },

  /**
   * * Получить список избранного конкретного пользователя
   * @param {*} userId идентификатор пользователя
   */
  async GetFavorites(userId) {
    const data = await Favorites.findAll({
      where: {
        userId: userId
      },

      raw: true,
      nest: true
    });

    const entities = Object.keys(Entities).reduce((acc, next) => {
      const id = Entities[next];
      acc[id] = next;
      return acc;
    }, {});

    return data.reduce((acc, next) => {
      const typeId = next.typeId;
      if (entities.hasOwnProperty(typeId)) {
        if (acc.filter(c => c.type == entities[typeId]).length > 0) {
          let p_data = acc.find(c => c.type === entities[typeId]);
          p_data.data.push(next);
        } else {
          acc.push({
            type: entities[typeId],
            data: [next]
          });
        }
      }

      return acc;
    }, []);
  },

  /**
   * * Получить список записей пользователей с ролью 'user'
   */
  async GetCountAsync() {
    return Users.count({
      where: {
        role: "user"
      }
    });
  },

  /**
   * * Получить список подписок пользователя на авторов
   * @param {*} authorId
   */
  async SubscriptionsToAuthorAsync(authorId) {
    return Subscribing_user_to_author.findAll({
      where: {
        userId: authorId
      },
      include: [
        {
          model: Users,
          as: "author",
          attributes: ["firstName", "lastName", "email", "avatar"]
        }
      ]
    });
  },

  /**
   * * Получить список подписок пользователя на теги
   * @param {*} authorId
   */
  async SubscriptionsToTagAsync(authorId) {
    return Subscribed_users_to_tags.findAll({
      where: {
        userId: authorId
      }
    });
  },


  /**
   * * Создать нового пользователя
   * @param {*} user - объект пользователя с полями email, password, firstName, lastName, phone 
   */
  async createUser(user) {
    return Users.findOrCreate({
      where: {
        email: user.email
      },
      defaults: {
        ...user
      } 
    });
  },

  /**
   * * Активировать/деактивировать пользователя
   * @param {*} userId - id пользователя 
   * @param {bool} active - включен/выключен
   */
  async activateUser(userId, active) {
    return Users.update( { active, token: null }, {
      where: {
        id: userId,
        active: !active
      }
    });
  },

  /**
   * * Изменить пароль пользователя
   * @param {*} userId - id пользователя 
   * @param {bool} passwordHash - хеш пароля
   */
  async changeUserPassword(userId, passwordHash) {
    return Users.update( { password: passwordHash }, {
      where: {
        id: userId,
      }
    });
  },

  /**
   * * У пользователя роль - менеджер?
   * @param {*} userId - id пользователя 
   */
  async isManager(userId) {
    const user = await Users.findByPk(userId);
    return user.role == 'manager'; 
  }

};

