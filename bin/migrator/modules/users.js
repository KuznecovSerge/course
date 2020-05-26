const { users, users_data } = require("../../../models/index");
const path = require("path");
const fs = require("fs");

function usersResolver() {
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
            const data = {
              userId: user.id,
              vk_user_id: user.vk_user_id,
              tg_chat_id: user.tg_chat_id
            };
            delete user.vk_user_id;
            delete user.tg_chat_id;
            await users.create(user).then(u => {
              _user = u;
              if (data.vk_user_id || data.tg_chat_id) {
                return users_data.create(data);
              }
              return Promise.resolve();
            });
          } catch (err) {
            console.log(err);
          }
        }
        while (usersItems.length) {
          await users.bulkCreate(usersItems.splice(0, 1000));
        }
      } catch (err) {}
    }
  };

  return {
    resolve: resolve
  };
}

module.exports = usersResolver;
