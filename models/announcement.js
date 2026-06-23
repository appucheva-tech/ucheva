const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class announcement extends Model {}

announcement.init(
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    adminId: {
      type: Sequelize.UUID,
      allowNull: false
    },
    schoolUrl: {
      type: Sequelize.STRING,
      allowNull: false
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    audience: {
      type: Sequelize.ENUM('staff', 'parents', 'all'),
      defaultValue: 'all',
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('draft', 'scheduled', 'template', 'sent'),
      defaultValue: 'draft',
      allowNull: false
    },
    scheduledAt: {
      type: Sequelize.DATE,
      allowNull: true
    },
    sentAt: {
      type: Sequelize.DATE,
      allowNull: true
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
    sequelize,
    modelName: 'announcement'
  }
);

module.exports = announcement;
