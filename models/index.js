'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const db = {};

// =========================
// SEQUELIZE INSTANCE
// =========================
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false
  }
);

// =========================
// LOAD MODELS (NO RE-INIT)
// =========================
fs.readdirSync(__dirname)
  .filter(file =>
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js'
  )
  .forEach(file => {
    const model = require(path.join(__dirname, file));

    // IMPORTANT: models already call init internally
    db[model.name] = model;
  });

// =========================
// ASSOCIATIONS
// =========================
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// =========================
// EXPORT
// =========================
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;