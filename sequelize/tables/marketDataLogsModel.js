const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MarketDataLogsModel = sequelize.define(
    "tblMarketDataLogs",
    {
      wrID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrCommentaryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrEventMarketId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrData :{
        type: DataTypes.STRING,
        allowNull: false,
      },
      wrUpdateType :{
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrCreatedDate :{
        type: DataTypes.DATE,
        defaultValue: new Date(),
        allowNull: true,
      },
      wrLineDiff :{
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      wrCreatedBy :{
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      wrIsSendData :{
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
    },
    {
      timestamps: false,
    }
  );
  return MarketDataLogsModel;
};
