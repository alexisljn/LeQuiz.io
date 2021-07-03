'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tag', {
      id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false
      },
      label: {
        type: Sequelize.STRING(80),
        unique: true,
        allowNull: false
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
    await queryInterface.addIndex('tag', ['name']);
    await queryInterface.addIndex('tag', ['label']);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tag');
  }
};
