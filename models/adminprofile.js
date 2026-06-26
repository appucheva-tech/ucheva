const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class adminProfile extends Model {}

adminProfile.init(
  {
    // Model attributes are defined here
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: DataTypes.UUIDV4
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
        allowNull: false      
      },
      term: {
         type: Sequelize.STRING,
        allowNull: true,
      },
      academicSession: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      adminFirstName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      adminLastName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      adminUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      adminPublicId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      schoolLogoUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      schoolLogoPublicId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      schoolStampUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      schoolStampPublicId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      schoolSignatureUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      schoolSignaturePublicId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cacUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cacPublicId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      nepaUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      nepaPublicId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      schoolType: {
        type: Sequelize.TEXT,
        defaultValue: '[]',
            get() {
              const raw = this.getDataValue('schoolType');
              try {
                  return raw ? JSON.parse(raw) : [];
              } catch {
                  return [];
              }
          },
            set(value) {
             this.setDataValue('schoolType', JSON.stringify(value || []));
            }
      },
       continuousAssessmentConfig: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      examConfig: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      total: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'adminProfile', // We need to choose the model name
  },
);


module.exports = adminProfile