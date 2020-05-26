const { course, product, course_lesson } = require("../../../models/index");
const path = require("path");
const fs = require("fs");

function coursesResolver() {
  courseCreator = async courses => {
    for (var i = 0; i < courses.length; i++) {
      const crs_p = courses[i];
      const db_crs = await course.findOne({
        where: {
          id: crs_p.id
        }
      });
      if (db_crs) {
        const pp = await product.findOne({
          where: {
            id: crs_p.productId
          }
        });
        await pp.addCourse(db_crs);
      } else {
        const p_id = crs_p.productId;
        delete crs_p.productId;
        if (crs_p.parent === 0) {
          delete crs_p.parent;
        }
        crs_p.language = 1;
        const new_crs = await course.create(crs_p);
        await new_crs.addProduct(p_id);
      }
    }
  };

  lessonsCreator = async (cursor, coursesId) => {
    const query = `select tl.training_lesson_id as id, 
      tl.name, 
      tl.training_id as courseId,
      tl.description, 
      tl.content, 
      tl.content_html, 
      tl.task, 
      tl.date as createdAt 
  from training_lessons tl where tl.training_id in (${coursesId})`;
    const lessons = await cursor.query(query, {
      model: course,
      mapToModel: true,
      raw: true
    });

    for (let i = 0; i < lessons.length; i++) {
        try {
            const lesson = lessons[i];
            const courseId = lesson.courseId;
            delete lesson.courseId;
    
            const lessonres = await course_lesson.create(lesson);
            await lessonres.addCourse(courseId);
        } catch (err) {
            console.log(err);
        }
    }
  };

  var resolve = async function(cursor) {
    // * Получаем список курсов к продуктам и мапим в существующую модель
    let coursesQuery = fs.readFileSync(
      path.join(__dirname, "/sql/courses.sql"),
      "utf8"
    );
    let products = await product.findAll();
    const productsIds = products.map(p => +p.id);
    const courses = await cursor.query(
      coursesQuery.replace("$GOOD_ID_ARR", productsIds),
      {
        model: course,
        mapToModel: true,
        raw: true
      }
    );

    try {
      await courseCreator(courses);
      await lessonsCreator(
        cursor,
        courses.map(c => c.id)
      );
    } catch (err) {
      console.log(err);
    }
  };

  return {
    resolve: resolve
  };
}

module.exports = coursesResolver;
