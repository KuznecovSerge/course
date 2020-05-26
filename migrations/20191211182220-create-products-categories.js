"use strict";
const sequelize = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable(
        "product_type",
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          name: {
            type: Sequelize.STRING
          },
          active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: new Date()
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: new Date()
          }
        },
        {
          charset: "utf8",
          collate: "utf8_unicode_ci"
        }
      )
      .then(() => {
        queryInterface.sequelize.query(
          "insert into product_type (name) values('Курс'), ('Урок'), ('Вебинар'), ('Консультация')"
        );
      });

    await queryInterface.createTable(
      "product",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        producttypeId: {
          type: Sequelize.INTEGER,
          references: {
            model: "product_type",
            key: "id"
          }
        },
        discountkeeperId: {
          type: Sequelize.INTEGER,
          references: {
            model: "discountkeeper",
            key: "id"
          }
        },
        authorId: {
          type: Sequelize.INTEGER,
          references: {
            model: "users",
            key: "id"
          }
        },
        title: Sequelize.TEXT,
        description: Sequelize.TEXT,
        content: Sequelize.TEXT,
        price: Sequelize.DECIMAL,
        ball: Sequelize.INTEGER,
        date: Sequelize.DATE,
        image: Sequelize.TEXT,
        video: Sequelize.BLOB,
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }
    );

    await queryInterface.createTable("category", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        unique: true
      },
      parent: {
        type: Sequelize.INTEGER
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable("product_category", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      productId: {
        type: Sequelize.INTEGER
      },
      categoryId: {
        type: Sequelize.INTEGER
      },
      quantity: {
        type: Sequelize.DECIMAL
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable("product_user_access", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      productId: {
        type: Sequelize.INTEGER,
        references: {
          model: "product",
          key: "id"
        }
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id"
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    return Promise.resolve();
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("product_user_access");
    await queryInterface.dropTable("product_category");
    await queryInterface.dropTable("category");
    await queryInterface.dropTable("product");
    await queryInterface.dropTable("product_type");

    return Promise.resolve();
  }
};
