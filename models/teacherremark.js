const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class qrCode extends Model {}

qrCode.init(
  {
id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      report_card_id: {
        type:      Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      teacher_id: {
        type:      Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      remark: {
        type:      Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type:         Sequelize.DATE,
        allowNull:    false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type:         Sequelize.DATE,
        allowNull:    false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'qrCode', // We need to choose the model name
  },
);


module.exports = qrCode








 