"use strict";
const clone = require("lodash/clone");
const omit = require("lodash/omit");
const urlApi = require("url");
const {
  product,
  product_category,
  product_course,
  product_user_access,
  product_skills,
  skills,
  coupon,
  discount,
  course,
  course_lection,
  category,
  users,
  lessons,
  webinars,
  consultations,
  books,
  attachment_to,
  rate
} = require("../models/index");
const CourseService = require("../services/CourseService");
const db = require("../models/index");
const { IService } = require("../core/interfaces/IService");
const { Entities } = require("../core/Constants");

/**
 * * Сервис работы с продуктами
 */
class ProductService extends IService {
  /**
   * * Создать продукт
   */
  async Create(prod, material) {
    
    try {
      const result = await db.sequelize.transaction(async (t) => {

        // Скидка и промокод
        let include = [];
        if (prod.discount && prod.discount.enabled) {
          include.push({
            model: discount,
            as: 'discount'
          });  
        }
        if (prod.coupon && prod.coupon.enabled) {
          include.push({
            model: coupon,
            as: 'coupon'
          });  
        }
        
        // Записываем в БД продукт
        const resultProduct = await product.create(prod, { 
          include: include,
          transaction: t });
        // категории
        for (const cat of prod.category) {
          await product_category.create({
            productId: resultProduct.id,
            categoryId: cat
          }, { transaction: t })
        };

        // скилы
        for (const skill of prod.skills) {
          if (skill) {
            const [skillResult, created] = await skills.findOrCreate({
              where: {
                description: skill
              },
              transaction: t
            });
            await product_skills.create({
              productId: resultProduct.id,
              skillsId: skillResult.id
            }, { transaction: t });
          }
        }

        // материал
        let materialPatch = omit(material, ['attachment_ids']);
        materialPatch.productId = resultProduct.id;
        let resultMaterial;

        // В зависимости от типа продукта, записываем: Курс, Урок, Вебинар, Консультацию
        switch (prod.producttypeId) {
          case Entities.Course: //'course':
            resultMaterial = await CourseService.Create(material, t); 
            await product_course.create({
              productId: resultProduct.id,
              courseId: resultMaterial.id
            }, { transaction: t });

            break;
            
          case Entities.Lesson: //'lesson':
            resultMaterial = await lessons.create(materialPatch, { transaction: t });
            break;

          case Entities.Webinar: //'webinar':
            resultMaterial = await webinars.create(materialPatch, { transaction: t });
            break;

          case Entities.Consult: //'consultation':
            resultMaterial = await consultations.create(materialPatch, { transaction: t });
            break;

          case Entities.Book: //'book':
            materialPatch.attachment_ids = material.attachment_ids.map(item => { return {
              attachmentId: item,
              entityId: 10
            }});
            resultMaterial = await books.create(materialPatch, {
              include: [{
                model: attachment_to,
                as: 'attachment_ids'
              }], 
              transaction: t 
            });
            break;
  
          default:
            throw new Error('Не указан тип продукта');

        } 

        return resultProduct;
        
      });

      return result;

    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  }

  async DetailsCourse(model, userId) {
    try {
      const c = await course.findOne({
        where: model,
        include: [
          {
            model: product,
            as: "products",
            include: [
              {
                model: product_user_access,
                as: "usersAccess"
              }
            ]
          },
          {
            model: course_lection,
            as: "courselections"
          }
        ]
      });

      if (
        !c.products.filter(
          p => p.usersAccess.filter(u => u.userId === userId).length
        ).length
      ) {
        return {
          success: false,
          message: `Нет доступа до данного продукта!`
        };
      }

      return c;
    } catch (err) {
      console.log(err);
    }
  }

  async Details(model) {
    const access = await product_user_access.findOne({
      where: model
    });

    if (!access) {
      return {
        success: false,
        message: `Нет доступа до данного продукта!`
      };
    }
    try {
      const data = await product.findOne({
        where: {
          id: model.productId
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
            model: course,
            as: "courses"
          }
        ]
      });

      return {
        success: true,
        message: `Success`,
        item: data
      };
    } catch (err) {
      console.log(err);
    }
  }

    async PrepareVideo(data) {
        return new Promise(((resolve, reject) => {
            // если указан iframe, то его и возвращаем
            if (data.indexOf("<iframe") !== -1) {
                resolve(data);
            }

            const urlObject = urlApi.parse(data, true);
            const youTubeFullRegexp = new RegExp("[www.]*youtube\\.com.*");
            const youTubeMinRegexp = new RegExp("[www.]*youtu\\.be.*");
            const vimeoRegexp = new RegExp("[www.]*vimeo\\.com.*");
            const dailyMotionFullRegexp = new RegExp("[www.]*dailymotion\\.com.*");
            const dailyMotionMinRegexp = new RegExp("[www.]*dai\\.li.*");


            // проверяем к какому ресурсу пренадлежит ссылка
            if (youTubeFullRegexp.test(urlObject.hostname)) {
                const videoId = urlObject.query.v || null;

                if (videoId !== null) {
                    resolve(`https://www.youtube.com/embed/${videoId}`);
                } else {
                    reject(new Error("Ошибка парсинга ссылки: youtube"));
                }
            } else if (youTubeMinRegexp.test(urlObject.hostname)) {
                const videoId = urlObject.path || null;

                if (videoId !== null) {
                    resolve(`https://www.youtube.com/embed${videoId}`);
                } else {
                    reject(new Error("Ошибка парсинга ссылки: youtu.be"));
                }
            } else if (vimeoRegexp.test(urlObject.hostname)) {
                const videoId = urlObject.path || null;

                if (videoId !== null) {
                    resolve(`https://player.vimeo.com/video${videoId}`);
                } else {
                    reject(new Error("Ошибка парсинга ссылки: vimeo"));
                }
            } else if (dailyMotionFullRegexp.test(urlObject.hostname)) {
                const videoId = urlObject.path.substring(urlObject.path.lastIndexOf("/") + 1) || null;

                if (videoId !== null) {
                    resolve(`https://www.dailymotion.com/embed/video/${videoId}`);
                } else {
                    reject(new Error("Ошибка парсинга ссылки: dailymotion"));
                }
            } else if (dailyMotionMinRegexp.test(urlObject.hostname)) {
                const videoId = urlObject.path || null;

                if (videoId !== null) {
                    resolve(`https://www.dailymotion.com/embed/video${videoId}`);
                } else {
                    reject(new Error("Ошибка парсинга ссылки: dai.ly"));
                }
            } else {
                reject(new Error("Не известный хостинг, укажите iframe"));
            }
        }));
    }
}

const productService = new ProductService();

module.exports = { ProductService, productService };
