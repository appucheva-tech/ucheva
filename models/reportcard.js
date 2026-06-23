const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class reportCard extends Model {}

reportCard.init(
  {
    // Model attributes are defined here
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
        type: Sequelize.TINYINT.UNSIGNED,
        defaultValue: 0,
      },
      days_present: {
        type: Sequelize.TINYINT.UNSIGNED,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('draft', 'teacher_ready', 'submitted', 'disbursed'),
        allowNull: false,
        defaultValue: 'draft',
      },
      generated_by: {
        type: Sequelize.UUID
        allowNull: false,
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      disbursed_at: {
        type:         Sequelize.DATE,
        allowNull:    true,
        defaultValue: null,
      },
      created_at: {
        type:         Sequelize.DATE,
        allowNull:    false,
      },
      updated_at: {
        type:         Sequelize.DATE,
        allowNull:    false,
      },
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'reportCard', // We need to choose the model name
  },
);



module.exports = reportCard