const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ClientSocketModel = sequelize.define(
        "tblClientSockets",
        {
            wrId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            wrServerName : {
                type: DataTypes.STRING,
                allowNull: false,
            },
            wrUrl : {
                type: DataTypes.STRING,
                allowNull: false,
            },
            wrStatus : {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            wrIsActive : {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            wrReconnectDelay :{
                type: DataTypes.INTEGER,
                allowNull: false
            },
            wrReconnectAttempts : {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            wrReconnectMaxDelay : {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            wrReconnectCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            wrActionType : {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
        },
        {
            timestamps: false,
        }
    );
    return ClientSocketModel;
}