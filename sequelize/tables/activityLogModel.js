const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ActivityLogModel = sequelize.define(
    "tblActivityLogs",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrActivityType: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrRefID: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrIpAddress:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      wrCreatedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );
  return ActivityLogModel;
};
