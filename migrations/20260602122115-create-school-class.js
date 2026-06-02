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
              references: {
                model: "admins",
                key: "id"
              },
              onDelete: 'CASCADE'
            },
             staffId: {
              type: Sequelize.UUID,
              allowNull: false,
              references: {
                model: "staffs",
                key: "id"
              },
              onDelete: 'CASCADE'
            },
            className: {
              type: Sequelize.STRING,
              allowNull: false
            },
            selectSection: {
              type: Sequelize.STRING,
              allowNull: false
            },
            assignTeacher: {
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
    await queryInterface.dropTable('schoolClasses');
  }
};