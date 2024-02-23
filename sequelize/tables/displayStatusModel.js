const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DisplayStatus = sequelize.define(
    "tblDisplayStatus",
    {
      wrDisplayStatusId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrDisplayStatus: {
        type: DataTypes.STRING(2000),
        allowNull: true,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return DisplayStatus;
};
