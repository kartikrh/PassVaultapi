const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    const VendorModel = sequelize.define(
    "tblVendors",
    {
        wrId :{
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        wrName :{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        wrKey :{
            type: DataTypes.STRING,
            allowNull: false,
        },
        wrSubscriptionDate :{
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue:new Date(),
        },
        wrExpiryDate :{
            type: DataTypes.DATE,
            allowNull: false,
        },
        wrIsActive :{
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        wrIsIPCheck :{
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        wrCreatedDate :{
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue:new Date(),
        },
        wrCreatedBy :{
            type: DataTypes.INTEGER,
            allowNull: false,
        },  
    },
    {
        timestamps: false,
    }
    );
    return VendorModel;
}