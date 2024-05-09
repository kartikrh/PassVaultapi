const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ApiEndPointModel = sequelize.define(
    "tblAPIEndpoints",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrServiceType : {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      wrEndpoint : {
        type: DataTypes.STRING,
        allowNull: false
      },
      wrModuleType : {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      wrTimeOut : {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue : 0
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

  return ApiEndPointModel;
};
