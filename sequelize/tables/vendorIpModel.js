const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    const VendorIpModel = sequelize.define(
    "tblVendorIps",
    {
        wrId :{
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        wrVendorId :{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        wrIpAddress:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        wrIsActive:{
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        wrCreatedDate:{
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue:new Date(),
        },
        wrCreatedBy:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
       
    },
    {
        timestamps: false,
    }
    );
    return VendorIpModel;
}