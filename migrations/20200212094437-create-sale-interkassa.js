"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("sale_interkassa", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ik_co_id: {
        type: Sequelize.STRING
      },
      ik_co_prs_id: {
        type: Sequelize.STRING
      },
      ik_co_rfn: {
        type: Sequelize.STRING
      },
      ik_cur: {
        type: Sequelize.STRING
      },
      ik_desc: {
        type: Sequelize.STRING
      },
      ik_inv_crt: {
        type: Sequelize.STRING
      },
      ik_inv_id: {
        type: Sequelize.STRING
      },
      ik_inv_prc: {
        type: Sequelize.STRING
      },
      ik_inv_st: {
        type: Sequelize.STRING
      },
      ik_pm_no: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sale",
          key: "id"
        }
      },
      ik_ps_price: {
        type: Sequelize.STRING
      },
      ik_pw_via: {
        type: Sequelize.STRING
      },
      ik_sign: {
        type: Sequelize.STRING
      },
      ik_trn_id: {
        type: Sequelize.STRING
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
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("sale_interkassa");
  }
};
