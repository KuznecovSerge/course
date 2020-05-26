const { users, users_data } = require("../../../models/index");
const path = require("path");
const fs = require("fs");

function usersDataResolver() {
  var resolve = async function(cursor) {
    const usersQuery = fs.readFileSync(
      path.join(__dirname, "/sql/users.sql"),
      "utf8"
    );
    const usersItems = await cursor.query(usersQuery, {
      model: users,
      mapToModel: true,
      raw: true
    });
    if (usersItems && usersItems.length) {
      try {
        for (user of usersItems) {
          try {
            // Устанавливаем аватары похеренные ранее
            const __user = await users.findOne({
                where: {
                    id: user.id
                }
            });
            if (__user && user.avatar) {
                await __user.update({
                    avatar: user.avatar
                })
            }

            // инфо о пользователе
            const data = {
              userId: user.id,
              vk_user_id: user.vk_user_id,
              tg_chat_id: user.tg_chat_id
            };
            if (data.vk_user_id || data.tg_chat_id) {
                await users_data.create(data);
            }
          } catch (err) {
            console.log(err);
          }
        }
      } catch (err) {}
    }
  };

  return {
    resolve: resolve
  };
}

module.exports = usersDataResolver;
