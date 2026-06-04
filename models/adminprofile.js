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
      schoolLogoUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      schoolLogoPublicId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      schoolType: {
        type: Sequelize.JSON,
        allowNull: true
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