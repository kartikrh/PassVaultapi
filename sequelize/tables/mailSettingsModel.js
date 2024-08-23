const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const mailSettingsModel = sequelize.define(
        "tblMailSettings",
        {
            wrId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            wrEmail: {
                type: DataTypes.STRING(200),
                allowNull: false,
                unique: true,
            },
            wrUserName: {
                type: DataTypes.STRING(200),
                allowNull: false
            },
            wrPassword: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            wrMailType: {
                type: DataTypes.INTEGER,
                allowNull: false // 1 => Google, 2 => SMTP
            },
            wrSmtpAddress: {
                type: DataTypes.STRING(200),
                allowNull: true
            },
            wrPortNumber: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            wrIsEnableSSL: {
                type: DataTypes.BOOLEAN,
                allowNull: true
            },
            wrIsActive: {
                type: DataTypes.BOOLEAN,
                allowNull: true
            },
            wrIsDefault: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            wrCreatedBy: {
                type: DataTypes.INTEGER,
            },
            wrCreatedDate: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW,
            },
            wrModifiedBy: {
                type: DataTypes.INTEGER,
            },
            wrModifiedDate: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            timestamps: false,
        }
    )
    return mailSettingsModel;
}