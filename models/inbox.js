'use strict';

module.exports = (sequelize, DataTypes) => {
    const inbox = sequelize.define(
        'inbox',
        {
            sender: DataTypes.INTEGER,
            receiver: DataTypes.INTEGER,
            title: DataTypes.TEXT,
            message: DataTypes.TEXT,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
            archive: DataTypes.BOOLEAN,
            read: DataTypes.BOOLEAN
        },
        {
            freezeTableName: true
        }
    );
    inbox.associate = function(models) {
        inbox.belongsTo(models.users, {
            foreignKey: 'sender',
            as: 'userSender'
        });

        inbox.belongsTo(models.users, {
            foreignKey: 'receiver',
            as: 'userReceiver'
        });
    };
    return inbox;
};
