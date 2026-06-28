const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class scores extends Model {}

scores.init(
  {
    // Model attributes are defined here
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      studentId: { 
        type: Sequelize.UUID,
        allowNull: false,
           unique: 'student_subject_unique' ,
        references: {
          model: "students",
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
      subjectId: { 
        type: Sequelize.UUID,
        allowNull: false,
             unique: 'student_subject_unique'  ,
        references: {
          model: "subjects",
          key: "id"
        },
        onDelete: 'CASCADE'
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
      totalScore: {
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
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'scores', // We need to choose the model name
      indexes: [
    {
      unique: true,
      fields: ['studentId', 'subjectId']   // ✅ THIS IS THE REAL FIX
    }
  ]
  },
);



module.exports = scores