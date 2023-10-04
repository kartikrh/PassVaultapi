const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MatchTypeModel = sequelize.define(
    "tblMatchType",
    {
      wrMatchTypeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrMatchType: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      wrMatchRefType: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrNoOfIningsPerSide: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrNoOfDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrNoOfPlayer: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrSubstitutesPlayer: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsLastManStand: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrIsLimitedOvers: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrTakeNewBallAfterOvers: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrOversInLastHour: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalOversInMatch: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrOversPerDay: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrMaxOversInFirstInings: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrMaxOversInSecondInings: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsBowlersLimitedOvers: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrOversPerBowler: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsPowerPlay: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrTotalPowerPlay: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsExtraInings: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrOversPerInings: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBatsmenPerInings: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBallsPerOver: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrValueOfNoBall: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsExtraBallWhenNoBall: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrValueOfNoBallInLastOver: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsExtraBallWhenNoBallInLastOver: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrValueOfWideBall: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsExtraBallWhenWideBall: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrValueOfWideBallInLastOver: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsExtraBallWhenWideBallInLastOver: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrIsWideBallCountInPartnership: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrIsPenaltyRunsInPartnership: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrValueOfFrontFootNoBall: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCreatedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrModifyBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrModifyDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return MatchTypeModel;
};
