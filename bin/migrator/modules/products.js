const { product } = require("../../../models/index");
const path = require("path");
const fs = require("fs");

function productsResolver() {
  var resolve = async function(cursor) {
    // * Получаем список продуктов и мапим в существующую модель
    const productsQuery = fs.readFileSync(
      path.join(__dirname, "/sql/allproducts.sql"),
      "utf8"
    );
    const items = await cursor.query(productsQuery, {
      model: product,
      mapToModel: true,
      raw: true
    });
    // * Устанавливаем список продуктов
    try {
      if (items && items.length) {
        for (pItem of items) {
          try {
            const p = await product.create(pItem);
            if (pItem.categoryId) {
              await p.addCategory(pItem.categoryId);
            }
          } catch (err) {
            console.log(err);
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  return {
    resolve: resolve
  };
}

module.exports = productsResolver;