const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
const config = require("../config.js");
const common = require("../common.js");
const Sequelize = require("sequelize");
const log = common.log;

const db = {};

// Or you can simply use a connection uri
const sequelize = new Sequelize(config.db.uri);

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach(file => {
    var model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
