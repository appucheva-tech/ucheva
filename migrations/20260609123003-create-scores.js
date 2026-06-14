'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('scores', {
      id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID,
            },
            studentId: { 
              type: Sequelize.UUID,
              allowNull: false,
            },
            staffId: { 
              type: Sequelize.UUID,
              allowNull: false,
            },
            subjectId: { 
              type: Sequelize.UUID,
              allowNull: false,
            },
            subject: {
              type: Sequelize.TEXT,
              allowNull: false,
            },
            className: {
              type: Sequelize.TEXT,
              allowNull: false,
            },
            studentName: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            admissionNumber: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            continuousAssessment: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            exam: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            createdAt: {
              allowNull: false,
              type: Sequelize.DATE,
            },
            updatedAt: {
              allowNull: false,
              type: Sequelize.DATE,
            }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('scores');
  }
};