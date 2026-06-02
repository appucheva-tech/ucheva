'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('classConfigs', {
      id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID,
              defaultValue: DataTypes.UUIDV4
            },
             adminId: {
              type: Sequelize.UUID,
              allowNull: false,
            },
            classConfiguration: {
              type: Sequelize.STRING,
              allowNull: false
            },
            createdAt: {
              type: Sequelize.DATE,
              allowNull: false
            },
            updatedAt: {
              type: Sequelize.DATE,
              allowNull: false
            }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('classConfigs');
  }
};