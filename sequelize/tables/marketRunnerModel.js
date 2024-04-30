const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MarketRunnerModel = sequelize.define(
    "tblMarketRunners",
    {
        wrRunnerId :{
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          autoIncrement: true,
        },
        wrEventMarketId :{
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        wrRunner :{
          type: DataTypes.STRING,
          allowNull: false,
        },
        wrLine :{
          type: DataTypes.DOUBLE,
          allowNull: true,
        },
        wrOverRate :{
          type: DataTypes.DOUBLE,
          allowNull: true,
        },
        wrUnderRate :{
          type: DataTypes.DOUBLE,
          allowNull: true,
        },
        wrYesRate :{
          type: DataTypes.DOUBLE,
          allowNull: true,
        },
        wrYesPoint :{
          type: DataTypes.DOUBLE,
          allowNull: true,
        },
        wrNoRate :{
          type: DataTypes.DOUBLE,
          allowNull: true,
        },
        wrNoPoint :{
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        wrLastUpdate :{
            type: DataTypes.DATE,
            defaultValue: new Date(),
            allowNull: true,
        },
        wrSelectionId :{
            type: DataTypes.STRING,
            allowNull: true,
        },
        wrSelectionStatus :{
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        wrOrder :{
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        wrLineRatio:{
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
    }, {
      timestamps: false,
    }
    );

  return MarketRunnerModel;
};
