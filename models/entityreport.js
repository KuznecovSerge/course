'use strict';
module.exports = (sequelize, DataTypes) => {
    const entity_reports = sequelize.define(
        'entity_reports',
        {
            userId: DataTypes.INTEGER,
            referenceId: DataTypes.INTEGER,
            reference: DataTypes.STRING,
            message: DataTypes.STRING,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
            archive: DataTypes.BOOLEAN
        },
        {}
    );
    entity_reports.associate = function(models) {
        entity_reports.belongsTo(models.users, {
            foreignKey: 'userId',
            as: 'users'
        });
    };
    return entity_reports;
};
