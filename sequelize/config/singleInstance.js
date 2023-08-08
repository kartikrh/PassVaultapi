const { Sequelize } = require("sequelize");
const dbConnect = require("../../sequelize/config/config")();
module.exports= new Sequelize(dbConnect);