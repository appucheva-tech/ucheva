'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('schoolClasses', {
      id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID,
            },
             adminId: {
              type: Sequelize.UUID,
              allowNull: false,
            },
             staffId: {
              type: Sequelize.UUID,
              allowNull: true,
            },
            className: {
              type: Sequelize.STRING,
              allowNull: false
            },
            selectSection: {
              type: Sequelize.ENUM('secondary', 'primary', 'nursery', 'creche','daycare'),
              allowNull: true
            },
            assignTeacher: {
              type: Sequelize.STRING,
              allowNull: true
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
    await queryInterface.dropTable('schoolClasses');
  }
};