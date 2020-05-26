const { category } = require("../../../models/index");

function categoryResolver() {
  var resolve = async function(cursor) {
    // * Получаем список категорий
    const categories = await cursor.query(
      `select id, name, parent_id as parent from thematics_from_monecle_curses tfmc`,
      {
        model: category,
        mapToModel: true,
        raw: true
      }
    ).map(c => {
      if (!c.parent) {
        delete c.parent;
      };

      return c;
    });

    // * Устанавлиаем список категорий
    if (categories && categories.length) {
      try {
        let cat = {};

        var unique = categories.filter(function(c) {
          const key = c.name.toLowerCase().trim();
          if (cat[key]) {
            return false;
          }
          cat[key] = true;
          return true;
        });
        await category.bulkCreate(unique);
      } catch (err) {
        console.log(err);
      }
    }
  };

  return {
    resolve: resolve
  };
}

module.exports = categoryResolver;
