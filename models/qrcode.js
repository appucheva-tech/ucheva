const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class qrCode extends Model {}

qrCode.init(
  {
    // Model attributes are defined here
 id:{
    type: Sequelize.UUID,
    primaryKey:true,
    defaultValue: Sequelize.UUIDV4
  },
  adminId:{
      type: Sequelize.UUID,
      allowNull: false
  },
  schoolUrl:{
    type: Sequelize.STRING,
    allowNull: false
  },
  qrToken:{
    type: Sequelize.STRING,
    allowNull: false,
    unique:true
  },
  date:{
    type: Sequelize.DATEONLY,
    allowNull: false
  },
  expiresAt:{
    type:Sequelize.DATE,
    allowNull:false
  },
  status:{
      type:Sequelize.ENUM('active', 'expired'),
      defaultValue:'active'
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
    modelName: 'qrCode', // We need to choose the model name
  },
);


module.exports = qrCode




