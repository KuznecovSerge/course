'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('users', [
            {
                id: 100000,
                firstName: '__system',
                login: '__system',
                role: 'system',
                active: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete(
            'users',
            {
                id: 100000,
                role: 'system'
            },
            {}
        );
    }
};
