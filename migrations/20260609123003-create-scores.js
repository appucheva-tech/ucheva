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
    totalScore: {   // ✅ also fix typo here
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

  // ✅ THIS IS THE KEY FIX
  await queryInterface.addConstraint('scores', {
    fields: ['studentId', 'subjectId'],
    type: 'unique',
    name: 'unique_student_subject_constraint'
  });
},
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('scores');
  }
};