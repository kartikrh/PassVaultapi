const [DataTypes] = require("sequelize");

module.exports = (sequelize) =>{
    const notificationLogModel = sequelize.define(
        "tblNotificationLogs",
        {
            wrId : {
                type : DataTypes.INTEGER,
                primaryKey : true,
                allowNull : false,
                autoIncrement : true
            },
            wrNotificationId :{
                type : DataTypes.INTEGER,
                allowNull : false
            },
            wrClientId : {
                type : DataTypes.INTEGER,
                allowNull : false
            },
            wrIsRead : {
                type : DataTypes.BOOLEAN,
                allowNull : false,
                defaultValue : false
            },
            wrCreatedAt:{
                type : DataTypes.DATE,
                allowNull : false,
                defaultValue : DataTypes.NOW
            }
        },
        {
            timestamps : false
        }
    )
    return notificationLogModel;
}