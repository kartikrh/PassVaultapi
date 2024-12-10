const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CommentaryModel = sequelize.define(
    "tblCommentary",
    {
      wrCommentaryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrMatchTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrEventTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCompetitionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrEventId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrEventDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrEventName: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      wrEventRefId: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      wrTeam1Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTeam2Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrLocation: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrWeather: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrPitch: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrHomeSideTeam: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTossWonBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrChoseTo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrWinnerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrWinnerName: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      wrIsClientShow: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      wrDisplayStatus: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      wrCommentaryStatus: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrRmk: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      wrCommentaryUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrUpdateTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrCreatedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrModifyDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrIsMatchDraw: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrTarget: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrMarketID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTpId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isSignalROn: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      isMatchTypeUpdated: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrCreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCurrentInnings: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrSystemPlayerCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsPlayersShow: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      wrIsPredictMarket: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      wrDelay: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      wrCommentaryResult: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      wrIsTeamPredictionOn: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      wrLineRatio: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 5,
      },
      wrHistoryMatchTypeId: { 
        type : DataTypes.INTEGER,	
        allowNull: true,
        defaultValue : null
      },
      wrShotType : {
        type : DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue : true
      },
      wrIsWheelShow : {
        type : DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue : true
      },
    },
    {
      timestamps: false,
    }
  );
  return CommentaryModel;
};
