const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const APIModel = sequelize.define(
    "tblAPIs",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrType : {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      wrApi : {
        type: DataTypes.STRING,
        allowNull: false
      },
      wrIsActive : {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue : false
      },
    },
    {
      timestamps: false,
    }
  );

  return APIModel;
};
