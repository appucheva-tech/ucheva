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
            schoolUrl: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            subject: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            className: {
              type: Sequelize.STRING,
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
             type: Sequelize.INTEGER,
              defaultValue: 0
            },
            exam: {
              type: Sequelize.INTEGER,
              defaultValue: 0
            },
            totalscore: {
              type: Sequelize.INTEGER,
              defaultValue: 0
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