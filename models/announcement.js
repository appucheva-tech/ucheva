'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class announcement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  announcement.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    otherName: DataTypes.STRING,
    gender: DataTypes.ENUM,
    dateOfBirth: DataTypes.DATE,
    nationality: DataTypes.STRING,
    address: DataTypes.STRING,
    class: DataTypes.STRING,
    department: DataTypes.STRING,
    session: DataTypes.INTEGER,
    parentGuardiansName: DataTypes.STRING,
    relationship: DataTypes.STRING,
    phoneNubmer: DataTypes.INTEGER,
    email: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'announcement',
  });
  return announcement;
};