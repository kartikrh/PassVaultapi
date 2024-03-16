const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MarketLogsModel = sequelize.define(
    "tblMarketLogs",
    {
          wrId :{
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
          },
          wrEventMarketId :{
            type: DataTypes.INTEGER,
            allowNull: false,

          },
          wrActionType :{
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          wrValue :{
            type: DataTypes.STRING,
            allowNull: true,
          },
          wrUserId :{
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          wrCreatedDate :{
            type: DataTypes.DATE,
            defaultValue: new Date(),
            allowNull: true,
          },
        },
        {
            timestamps: false,
        }
    );

  return MarketLogsModel;
};
