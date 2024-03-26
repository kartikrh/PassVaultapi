const { DataTypes } = require("sequelize");
// marketTime = {"Ball": 1, "over": 2} //nullable
//wrAutoOpenType
//wrAutoCloseType
//wrAutoSuspendType

// new
// wrTemplateName
module.exports = (sequelize) => {
  const marketTemplateModel = sequelize.define(
    "tblMarketTemplate",
    {
      wrID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrTemplateName: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      wrMatchTypeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
        type: DataTypes.STRING(100),
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
      wrCreateType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCreate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
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
      wrCreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrActionType :{
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      wrMarketTypeId :{
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrMarketTypeCategoryId :{
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrMargin :{
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );
  return marketTemplateModel;
};
