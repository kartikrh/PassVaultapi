const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const CompetitionStatisticsTypeModel = sequelize.define(
        "tblCompetitionStatisticsType",
        {
            wrCompetitionStatisticsTypeId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            wrEventTypeId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrTypeId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrEntityEnum: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrName: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            wrDisplayOrder: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            wrDescription: {
                type: DataTypes.STRING(400),
                allowNull: true,
            },
            wrIsActive: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            wrCreatedBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrCreatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            wrUpdatedBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrUpdatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            wrIsDeleted: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            wrDeletedBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrDeletedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            }
        },
        {
            timestamps: false,
        }
    );
    return CompetitionStatisticsTypeModel;
};
