// for test purposes
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define("users", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'default-password'
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'male'
    },
    age:{
      type: DataTypes.INTEGER,
      allowNull:true

    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  // Syncs all models with the database
  sequelize
    .sync({ alter: true,logging: false  })
    .then(() => {
      console.log("Models synchronized with the database.");
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  return User;
};
