const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MarketTypeCategories = sequelize.define(
    "tblMarkerTypeCategories",
    {
        wrId : {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        wrMarketTypeId : {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        wrCategoryName : {
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
        wrIsDefault : {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },

    },
    {
        timestamps: false,
    }
  );
  return MarketTypeCategories;
};
