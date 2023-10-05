const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ConfigModel = sequelize.define(
    "tblConfig",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrKey: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrValue: {
        type: DataTypes.STRING(2000),
        allowNull: false,
      },
      wrDesc: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  return ConfigModel;
};
