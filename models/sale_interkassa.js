"use strict";
module.exports = (sequelize, DataTypes) => {
  const sale_interkassa = sequelize.define(
    "sale_interkassa",
    {
      ik_co_id: {
        type: DataTypes.STRING
      },
      ik_co_prs_id: {
        type: DataTypes.STRING
      },
      ik_co_rfn: {
        type: DataTypes.STRING
      },
      ik_cur: {
        type: DataTypes.STRING
      },
      ik_desc: {
        type: DataTypes.STRING
      },
      ik_inv_crt: {
        type: DataTypes.STRING
      },
      ik_inv_id: {
        type: DataTypes.STRING
      },
      ik_inv_prc: {
        type: DataTypes.STRING
      },
      ik_inv_st: {
        type: DataTypes.STRING
      },
      ik_pm_no: {
        type: DataTypes.INTEGER,
        references: {
          model: "sale",
          key: "id"
        }
      },
      ik_ps_price: {
        type: DataTypes.STRING
      },
      ik_pw_via: {
        type: DataTypes.STRING
      },
      ik_sign: {
        type: DataTypes.STRING
      },
      ik_trn_id: {
        type: DataTypes.STRING
      }
    },
    {
      freezeTableName: true
    }
  );
  sale_interkassa.associate = function(models) {
    // associations can be defined here
  };
  return sale_interkassa;
};
