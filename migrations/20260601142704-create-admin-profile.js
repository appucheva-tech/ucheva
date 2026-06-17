'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('adminProfiles', {
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
            schoolUrl: {
              type: Sequelize.STRING,
              allowNull: false,
              unique: true
            },
            schoolLogoUrl: {
              type: Sequelize.STRING,
              allowNull: true
            },
            schoolLogoPublicId: {
              type: Sequelize.STRING,
              allowNull: true
            },
            schoolType: {
              type: Sequelize.TEXT,
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
    await queryInterface.dropTable('adminProfiles');
  }
};