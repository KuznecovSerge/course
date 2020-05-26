'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('product', 'discountkeeperId');
    await queryInterface.dropTable('discountkeeper');
    await queryInterface.dropTable('discountblock');
    await queryInterface.dropTable('discounttype');

    await queryInterface.addColumn(
      'product',
      'discountAndCoupon',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      } 
    );
    
    await queryInterface.createTable('coupons', {
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
      code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      percent: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      dateEnd: {
        type: Sequelize.DATE,
        allowNull: false,
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

    await queryInterface.createTable('discounts', {
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
      percent: {
        type: Sequelize.INTEGER
      },
      dateEnd: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('coupons');
    await queryInterface.dropTable('discounts');

    await queryInterface.createTable('discounttype', {
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
    }).then(() => {
      queryInterface.sequelize.query("insert into discounttype (name) values('Certificate'), ('Stock'), ('Discount')")
    }),

    await queryInterface.createTable('discountkeeper', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      discountTypeId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'discounttype',
          key: 'id'
        }
      },
      code: {
        type: Sequelize.STRING
      },
      percent: {
        type: Sequelize.DECIMAL
      },
      amount: {
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
    }),

    await queryInterface.createTable('discountblock', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      discountKeeperId: {
        type: Sequelize.INTEGER
      },
      begin: {
        type: Sequelize.DATE
      },
      end: {
        type: Sequelize.DATE
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

    await queryInterface.addColumn(
      'product',
      'discountkeeperId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: "discountkeeper",
          key: "id"
        } 
      }
    );

    await queryInterface.removeColumn('product', 'discountAndCoupon');

    
    return Promise.resolve();
  }
};