const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class subject extends Model {}

subject.init(
  {
    // Model attributes are defined here
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    adminId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
      model: 'admins', 
      key: 'id', 
      },
    },
    classId: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
      model: 'schoolClasses', 
      key: 'id', 
      },
    },
    staffId: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
      model: 'staffs', 
      key: 'id', 
      },
    },
    schoolUrl: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    subjectName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
      applicableClasses: {
        type: Sequelize.JSON,
        allowNull: false,
    },
      applicableDepartment:{
        type: Sequelize.STRING,
         allowNull: false,
    },
      subjectTeacher:{
        type: Sequelize.STRING,
         allowNull: false,
    },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
    },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
    }
 },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'subjects', // We need to choose the model name
  },
);


module.exports = subject             