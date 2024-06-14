const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MarketTemplateRunner = sequelize.define(
    "tblMarketTemplateRunners",
    {
        wrId :{
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          autoIncrement: true,
        },
        wrMarketTemplateId :{
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
        wrLastUpdate :{
            type: DataTypes.DATE,
            defaultValue: new Date(),
            allowNull: true,
        },
        wrSelectionId :{
            type: DataTypes.STRING,
            allowNull: true,
        },
        wrOrder :{
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
    }, {
      timestamps: false,
    }
    );

  return MarketTemplateRunner;
};
