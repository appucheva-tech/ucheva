'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reportCards', {
      id: {
              type: Sequelize.UUID,
              primaryKey: true,
              defaultValue: Sequelize.UUIDV4
            },
            adminId: {
              type: Sequelize.UUID,
              allowNull: false,
            },
            studentId: {
               type: Sequelize.UUID,
               allowNull: false,
            },
            scoresId: {
               type: Sequelize.UUID,
               allowNull: false,
            },
            classId: {
              type: Sequelize.UUID,
              allowNull: false,
            },
            sessionId: {
              type: Sequelize.UUID,
              allowNull: false,
            },
            average_score: {
              type: Sequelize.DECIMAL(5, 2),
              defaultValue: 0,
            },
            overall_grade: {
              type: Sequelize.STRING,
              defaultValue: null,
            },
            overall_remark: {
              type: Sequelize.STRING(50),
              defaultValue: null,
            },
            days_in_term: {
              type: Sequelize.INTEGER,
              defaultValue: 0,
            },
            days_present: {
              type: Sequelize.INTEGER,
              defaultValue: 0,
            },
            status: {
              type: Sequelize.ENUM('awaiting score', 'remark added', 'ready for review', 'submitted to admin'),
              allowNull: false,
              defaultValue: 'awaiting score',
            },
            generated_by: {
              type: Sequelize.UUID,
              allowNull: false,
            },
            submitted_at: {
              type: Sequelize.DATE,
              allowNull: true,
              defaultValue: null,
            },
            disbursed_at: {
              type: Sequelize.DATE,
              allowNull: true,
              defaultValue: null,
            },
            created_at: {
              type: Sequelize.DATE,
              allowNull:    false,
            },
            updated_at: {
              type: Sequelize.DATE,
              allowNull: false,
            },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reportCards');
  }
};