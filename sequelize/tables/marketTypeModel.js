const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MarketTypeModel = sequelize.define(
    "tblMarketTypes",
    {
        wrId : {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        wrEnumId : {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        wrMarketTypeName : {
            type: DataTypes.STRING,
            allowNull: false
        },
        wrDisplayOrder : {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        wrIsActive : {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        wrDisplayName : {
            type: DataTypes.STRING,
            allowNull: false
        },
    },
    {
        timestamps: false,
    }
  );
  return MarketTypeModel;
};
