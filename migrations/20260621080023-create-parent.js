'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('parents', {
      id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID,
            },
            adminId:{
               type: Sequelize.UUID,
               allowNull: false,
            },
            schoolUrl: {
               type: Sequelize.STRING,
               allowNull: false
            },
            firstName: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            lastName: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            address: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            phoneNumber: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            email: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            role: {
              type: Sequelize.STRING,
              defaultValue: 'parent'      
            },
            profileUrl: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            profilePublicId: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            password: {
              type: Sequelize.STRING,
              allowNull: true,
            },
             parentToken: {
              type: Sequelize.STRING,
              allowNull: true
            },
            parentTokenExpiresAt: {
              type: Sequelize.DATE
            },
            isActive: {
              type: Sequelize.BOOLEAN,
              defaultValue: false
            },
            isVerified: {
              type: Sequelize.BOOLEAN,
              defaultValue: false
            },
            loginAttempts: {
              type: Sequelize.INTEGER,
              defaultValue: 0,
              allowNull: false
            },
            lockUntil: {
              type: Sequelize.DATE
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('parents');
  }
};