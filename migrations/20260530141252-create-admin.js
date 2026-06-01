'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admins', {
      id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID,
            },
            schoolName: {
              type: Sequelize.STRING,
              allowNull: false
            },
            schoolUrl: {
              type: Sequelize.STRING,
              allowNull: false
            },
            email: {
              type: Sequelize.STRING,
              allowNull: false
            },
            address: {
              type: Sequelize.STRING,
              allowNull: false
            },
            phoneNumber: {
              type: Sequelize.STRING,
              allowNull: false
            },
            password: {
              type: Sequelize.STRING,
              allowNull: false
            },
            otp: {
              type: Sequelize.STRING,
              allowNull: false
            },
            otpExpiresAt: {
              type: Sequelize.DATE
            },
            isVerified: {
              type: Sequelize.BOOLEAN,
              defaultValue: false
            },
            passwordReset: {
              type: Sequelize.BOOLEAN,
              defaultValue: false
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
    await queryInterface.dropTable('admins');
  }
};