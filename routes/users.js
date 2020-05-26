"use strict";

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const omit = require("lodash/omit");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const upload = multer({ dest: `${global.FileStorage.path}/avatar/` });
const sharp = require("sharp");
const fs = require("fs");
const ProfileAggregator = require("../aggregators/ProfileAggregator");
const { CacheService, UserService, NotifyService, TagService, LikeService } = require("../services/index");
const passport = require("passport");
require("../config/passport.js")(passport);

const cacheService = new CacheService(2);

const {
  users,
  subscribing_user_to_author,
  like_blog_posts
} = require("../models/index.js");
const middleware = passport.authenticate("jwt", { session: false });

const generateJwt = function(id, email) {
  const token = jwt.sign({ id: id, email: email }, process.env.SECRET_KEY, {
    expiresIn: process.env.TOKEN_EXPIRES_IN
  });
  return token;
};

router.get("/count", middleware, getUserCount);
router.get("/section/:state", middleware, Section);
router.get("/stat", middleware, Statistic);
router.get("/me", middleware, getMe);
router.get("/authors", middleware, getAllAuthors);
router.post("/authors/subscribe", middleware, subscribeToAuthor);
router.post("/authors/rate", middleware, rateAuthor);
router.post("/authors/messages", middleware, multer().array("attachments"), sendMessageToAuthor);
router.get("/authors/:id", middleware, getAuthor);
router.get("/:id", getUser);
router.put("/:id", middleware, upload.single("avatar"), updateUser);
router.get("/", middleware, getAllUsers);

router.post("/token", checkUserEmail);
router.post("/password", resetUserPassword);
router.post("/login", [check("email").isEmail(), check("password").isLength({ min: 5 })], userLogin);
router.post("/", createUser);
router.post("/tag", middleware, tagSubscribe);
router.delete("/tag/:name", middleware, tagUnsubscribe);

async function subscribeToAuthor(req, res) {
  try {
    const { userId, authorId, action } = req.body;

    if (!userId) {
      throw new Error();
    }

    const subscribe = await UserService.subscribeToAuthor(userId, authorId, action);

    return res.status(200).json({
      success: true,
      subscribe: !!subscribe || false
    });
  } catch (err) {
    return res.status(500).json({
      success: false
    });
  }
}

/**
 * * Получить информацию об авторах с пагинацией
 * @param {*} req
 * @param {*} res
 */
async function getAllAuthors(req, res) {
  try {
    const { countOnly, findstr, categoryId, sort, direction, offset, limit } = req.query;

    if (countOnly) {
      const data = await UserService.GetCountAuthors({
        findstr,
        categoryId: (categoryId) ? categoryId.split(",") : null
      });
      return res.status(200).json({
        success: true,
        items: data
      });
    }

    const pageing = {
      limit: Number(limit ? limit : 20),
      offset: Number(offset ? offset : 0)
    };
    const sorting = {
      sort: (sort && ['date', 'product', 'sale', 'seen'].includes(sort)) ? sort : 'product',
      direction: (direction && ['desc', 'asc'].includes(direction)) ? direction : 'DESC' 
    };

    const data = await UserService.GetAllAuthors(pageing, sorting, {
      userId: req.user.id,
      findstr,
      categoryId: (categoryId) ? categoryId.split(",") : null
    });
    return res.status(200).json({
      success: true,
      items: data
    });
  } catch (error) {
    ILogger.error("Ошибка получения данных %o", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}


/**
 * * Получить информацию об авторе
 * @param {*} req
 * @param {*} res
 */
async function getAuthor(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const author = await UserService.GetOneAuthor(id, userId);

    return res.status(200).json({
      success: true,
      items: author,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * * Отписаться от тега
 * @param {*} req
 * @param {*} res
 */
async function tagUnsubscribe(req, res) {
  try {
    const { user, params } = req;
    let { name } = params;
    if (name) {
      name = decodeURIComponent(name);
    }

    const tagItem = await TagService.GetOne(name);
    if (tagItem && (await user.hasTag(tagItem))) {
      const result = await user.removeTag(tagItem);
    }

    return res.status(200).json({
      success: true,
      error: "user is not subscribed on this tag"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error
    });
  }
}

/**
 * * Подписаться на тег
 * @param {*} req
 * @param {*} res
 */
async function tagSubscribe(req, res) {
  try {
    const { user, body } = req;
    let { name } = body;
    if (name) {
      name = decodeURIComponent(name);
    }

    const tagItem = await TagService.GetOne(name);
    if (tagItem && !(await user.hasTag(tagItem))) {
      const result = await user.addTag(tagItem);

      return res.status(200).json({
        success: true
      });
    }

    return res.status(200).json({
      success: false,
      error: "user already subscribed"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error
    });
  }
}

async function getMe(req, res) {
  try {
    return res.json(req.user);
  } catch (e) {
    ILogger.error(e);
  }
}

/**
 * * Получить список пользователей
 * * С поддержкой пагинации
 */
async function getAllUsers(req, res) {
  try {
    const { limit, offset } = req.query;
    if (limit && offset) {
      const model = {
        limit: limit,
        offset: offset - limit || 0
      };
      const users = await UserService.GetAllOffsetAsync(model);
      return res.status(200).json({
        success: true,
        items: users
      });
    }

    const users = await UserService.GetAllAsync();
    return res.status(200).json({
      success: true,
      items: users
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: error });
  }
}

/**
 * * Получить кол-во пользователей
 */
async function getUserCount(req, res) {
  try {
    const count = await UserService.GetCountAsync();
    return res.status(200).json({
      success: true,
      count: count
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: error });
  }
}

/**
 * * Получить пользователя [GET]
 */
function getUser(req, res, next) {
  UserService
    .getUser(req.params.id)
    .then(user => {
      // при указании в запросе параметра /api/user/:id?authoremptyfields=1 , вывести не заполненые поля
      if (req.query.authoremptyfields)
        user.setDataValue("authorEmptyFields", authorEmptyFields(user));
      return res.json(user);
    })
    .catch(error => {
      console.log(error);
      return res.status(500).json({ success: false, error: error });
    });
}

// Возвращает список незаполненых полей пользователя, необходимых для создания авторского курса
function authorEmptyFields(user) {
  let result = [];
  if (user) {
    if (!user.firstName || user.firstName == "")
      result.push({ field: "firstName", text: "Имя не заполнено" });
    if (!user.lastName || user.lastName == "")
      result.push({ field: "lastName", text: "Фамилия не заполнена" });
    if (!user.avatar || user.avatar == "")
      result.push({ field: "avatar", text: "Фотография не прикреплена" });
    if (!user.authorAbout || user.authorAbout == "")
      result.push({
        field: "authorAbout",
        text: 'Не заполнено поле "О себе" '
      });
    if (!user.authorSocial || user.authorSocial.length == 0)
      result.push({
        field: "authorSocial",
        text: "Не заполнена ни одна соц. сеть для связи с автором"
      });
  }
  return result;
}

/**
 * * Создать пользователя
 * @param {*} req
 * @param {*} res
 */
async function createUser (req, res, next) {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    const { origin } = req.body;  // например, http://localhost:8080

    if (!email) { 
      throw new Error('Не указан email') 
    }
    if (!password) { 
      throw new Error('Не указан пароль') 
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // генерируем токен для отправки на почту пользователя
    const token = jwt.sign({ email: email }, process.env.SECRET_KEY, {
      expiresIn: "4h"
    });

    const [user, isCreated] = await UserService.createUser({
      email,
      password: passwordHash,
      firstName,
      lastName,
      phone,
      role: "user", // isManager ? "manager" : "user",
      token,
      active: 0
    });

    if (!isCreated) { 
      throw new Error('Пользователь с таким email уже существует') 
    }

    const url = `${origin}/signup/verify?token=${token}`;
    const mailLog = await NotifyService.sendEmailVerification(email, url);

    return res.status(200).json({ success: true, mailLog: mailLog });

  } catch (error) {
    ILogger.error('Ошибка создания пользователя: %o', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * * Подтверждение email пользователя 
 * @param {*} req
 * @param {*} res
 */
async function checkUserEmail (req, res) {
  try {
    const { token } = req.body;
    if (!token) {
      throw new Error('Не указан токен');
    }

    // проверяем устарел ли токен, и достаём email
    const { email } = jwt.verify(token, process.env.SECRET_KEY);
    if (!email) {
      throw new Error('Токен не содержит email');
    }

    const user = await UserService.getUserbyEmail(email);
    if (!user) {
      throw new Error('На найден пользователь с указанным email');
    }
    // если пользователь не активный, сверяем пришедший токен с токеном в бд
    if (!user.active && user.token !== token) {
      throw new Error('Токены не совпадают');
    }
    
    // активируем пользователя
    const result = await UserService.activateUser(user.id, true);
    // генерирует токен для логина
    const tokenUser = generateJwt(user.id, user.email);

    return res.status(200).json({ success: true, token: tokenUser });

  } catch (error) {
    ILogger.error('Ошибка подтверждения email пользователя: %o', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * * Сброс пароля пользователя 
 * @param {*} req
 * @param {*} res
 */
async function resetUserPassword (req, res) {
  try {
    const { email, token, password, origin } = req.body;

    // если указан email, то отправляем письмо
    if (email) {
      //проверяем, существует ли пользователь
      const user = await UserService.getUserbyEmail(email);
      if (!user) {
        throw new Error('Пользователя с указанным email не существует.');
      }
      //генерируем токен для письма
      const token = jwt.sign({ email: email }, process.env.SECRET_KEY, {
        expiresIn: "1h"
      });
      const url = `${origin}/restore/password?token=${token}`;
      const mailLog = await NotifyService.sendEmailResetPassword(email, url);
      return res.status(200).json({ success: true, mailLog });
    }

    // если указан токен, то меняем пароль
    if (token) {
      // проверяем устарел ли токен
      const { payload } = jwt.decode(token, {complete: true});
      if ( Date.now() >= payload.exp * 1000 ) {
        throw new Error('Токен устарел. Повторите процедуру заново.');
      }
      // проверяем валидность токена
      const { email } = jwt.verify(token, process.env.SECRET_KEY);
      const user = await UserService.getUserbyEmail(email);
      // готовим пароль
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      // меняем пароль в бд
      await UserService.changeUserPassword(user.id, passwordHash);
      // генерирует токен для логина
      const tokenUser = generateJwt(user.id, user.email);
      return res.status(200).json({ success: true, token: tokenUser });
    }

    return res.status(500).json({ success: false, message: 'Необходимы email или token' });

  } catch (error) {
    ILogger.error('Ошибка подтверждения email пользователя: %o', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * * Логин пользователя 
 * @param {*} req
 * @param {*} res
 */
async function userLogin(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  await users
    .findOne({
      where: {
        email: email
      }
    })
    .then(async user => {
      if (user !== null) {
        if (bcrypt.compareSync(password, user.password)) {
          if (!user.active) {
            return res.status(401).json({
              success: true,
              message: "Пользователь заблокирован!"
            });
          }
          const token = generateJwt(user.id, email);
          return res.json({ success: true, token: token });
        } else {
          const md5pwd = crypto
            .createHash("md5")
            .update(password + "*dff34*")
            .digest("hex");
          if (user.password == md5pwd) {
            return res.json({
              success: true,
              token: generateJwt(user.id, email)
            });
          }
          return res.status(401).json({
            success: true,
            error: {
              errors: {
                email: {
                  msg: ""
                },
                password: {
                  msg: ""
                }
              }
            },
            message: "Пароль или email введен не верно!"
          });
        }
      } else {
        return res.status(401).json({
          success: true,
          error: {
            errors: {
              email: {
                msg: ""
              },
              password: {
                msg: ""
              }
            }
          },
          message: "Пароль или email введен не верно!"
        });
      }
    })
    .catch(error => {
      console.log(error);
      return res.status(500).json({ success: false, error: error });
    });
};

/**
 * * Записывает изменнённые поля пользователя
 */
async function updateUser(req, res, next) {
  let patch = {};
  try {
    let data = req.body;
    patch = omit(data, ["avatar", "password", "description"]);
    patch.userId = req.user.id;

    // avatar
    // если пришёл файл, значит грузим новую аву
    if (req.file !== undefined) {
      const file = req.file;
      if (file.mimetype.includes("image")) {
        //сохраняем фото в png
        await sharp(`${global.FileStorage.path}/avatar/${file.filename}`)
          .png()
          .toFile(`${global.FileStorage.path}/avatar/${patch.userId}.png`);
        //удаляем оригинальный файл
        fs.unlinkSync(`${global.FileStorage.path}/avatar/${file.filename}`);
      } else throw new Error("Не правильный тип файла аватара");

      patch.avatar = `avatar/${patch.userId}.png`;
    }

    if (data.currentPassword) {
      if (!bcrypt.compareSync(data.currentPassword, req.user.password)) {
        return res.json({success: false, error: { message: 'Текущий пароль указан не верно' }});
      }
    }

    //password
    if (data.password !== undefined && data.password.length > 0) {
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(data.password, salt);
      patch.password = password;
    }

    //description map
    if (data.description !== undefined)
      patch.descriptionAuthor = data.description;

    const result = await users.update(patch, {
      where: {
        id: req.user.id
      }
    });

    return res.json({ success: true, items: result });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

router.post("/lockunlock", middleware, (req, res, next) => {
  const active = !req.body.locked;
  try {
    users
      .update(
        { active: !active },
        {
          where: {
            id: req.body.id
          }
        }
      )
      .then(result => {
        return res.status(200).json({
          success: true
        });
      })
      .catch(err => {
        return res.status(500).json({
          success: false,
          error: err
        });
      });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e
    });
  }
});

router.get("/get-subscriptions/:userId", middleware, (req, res, next) => {
  try {
    subscribing_user_to_author
      .findAll({
        where: {
          usersId: req.params.userId
        }
      })
      .then(subscriptions => {
        return res.json({ success: true, items: subscriptions });
      })
      .catch(error => {
        console.log(error);
        return res.status(500).json({ success: false, error: error });
      });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, error: e });
  }
});

 /**
 * * Получить данные по секции профиля пользователя
 * @param {*} state
 */
async function Section(req, res) {
  try {
    const section = req.params.state;
    if (!section) {
      return res.status(500).json({
        success: false
      });
    }

    const data = await ProfileAggregator.Section(req.user.id, section);

    return res.status(200).json({
      success: true,
      viewmodel: data
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
};

/**
 * * Статистика по продажам
 * @param {*} req
 * @param {*} res
 */
async function Statistic(req, res) {
  try {
    const userId = req.user.id;
    if (!userId) {
      throw new Error(`Not authorized!`);
    }
    const data = await cacheService.GetOrAdd(
      `Statistic${userId}`,
      async () => {
        return ProfileAggregator.Statistic(userId);
      }
    );

    return res.status(200).json({
      success: true,
      stat: data
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: error });
  }
};


/**
 * * Отправить вопрос автору
 */
async function sendMessageToAuthor(req, res) {
  try {
    const { authorId, emailFrom, message } = req.body;
    const { files } = req;
    const userId = req.user.id;
  
    if (!authorId) {
      throw new Error('Не указан id автора');
    }

    const user = await UserService.getUser(userId);
    const author = await UserService.getUser(authorId);
    if (!author) {
      throw new Error('Указанного автора не существует');
    }

    const notificationModel = {
      entityId: global.Entities.Author,
      referenceId: authorId,
      typeId: global.NotifyType.SendMessage,
      userId,
    };

    // проверяем, отправлял ли пользователь сообщение автору
    const notificationCount = await NotifyService.GetCountNotifications(notificationModel);
    if (notificationCount >= 5) {
      throw new Error('Нельзя отправлять подряд больше 5 сообщений автору');
    }

    // отправляем сообщение на email
    const mailLog = await NotifyService.SendMessageToAuthor(user, author, message, files);
  
    // создаём уведомление в системе
    await NotifyService.CreateNotify({
      ...notificationModel,
      message
    });
  
    return res.status(200).json({
      success: true,
      mailLog
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

}


/**
 * * Добавить оценку для автора 
 * @param {*} req 
 * @param {*} res 
 */
async function rateAuthor(req, res) {
  try {
    const { authorId, ball } = req.body;
    const userId = req.user.id;

    const myRaiting = await LikeService.addRate(global.Entities.Author, authorId, userId, ball);
    const avgBall = await LikeService.getRate(global.Entities.Author, authorId);

    return res.status(200).json({
      success: true,
      myRating: myRaiting,
      ball: avgBall
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }


}

module.exports = router;
