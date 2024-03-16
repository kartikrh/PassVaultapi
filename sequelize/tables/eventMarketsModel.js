const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const EventMarketsModel = sequelize.define(
    "tblEventMarkets",
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
      wrEventRefID: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      wrTeamID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrInningsID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrMarketName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      wrMargin: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      wrStatus: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsPredefineMarket: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrIsPreMatchOnly: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrIsPreMatchMarket: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrIsOver: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrOver: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      wrIsPlayer: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrPlayerID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsAutoCancel: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrAutoOpenType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrAutoOpen: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      wrAutoCloseType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBeforeAutoClose: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      wrAutoSuspendType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBeforeAutoSuspend: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      wrIsBallStart: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrIsAutoResultSet: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrAutoResultType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrAutoResultafterBall: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      wrAfterWicketAutoSuspend: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrAfterWicketNotCreated: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrIsAllow: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      wrCloseTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrOpenTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrSettledTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrResult: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      wrIsResult: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      wrData :{
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrLastUpdate :{
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrIsSendData :{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: false,
    }
  );
  return EventMarketsModel;
};
