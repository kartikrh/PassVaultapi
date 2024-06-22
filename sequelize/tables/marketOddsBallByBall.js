const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MarketOddsBallByBall = sequelize.define(
    "tblMatchType",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrCommentaryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCommentaryBallByBallId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrEventMarketId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrRunnerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrMarketStatus: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBackPrice : {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },  
      wrLayPrice : {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },  
      wrBackSize : {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },  
      wrLaySize : {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },  
      wrMarketName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrRunnerName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrDateTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return MarketOddsBallByBall;
};
