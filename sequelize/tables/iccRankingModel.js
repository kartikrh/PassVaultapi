const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const ICCRankingModel = sequelize.define(
        "tblICRanking",
        {
            wrId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            wrSportId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            wrMatchTypeId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrType: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrIsMen: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            wrTeamId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrPlayerId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrPlayerType: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrRating: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrPoint: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrRank: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrPreRank: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrRemark: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },
            wrIsActive: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            wrCreateDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            wrCreatedBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrModifyDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            wrModifyBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrIsDeleted: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue : false
            },
            wrDeletedBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrDeletedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            timestamps: false,
        });

    return ICCRankingModel;
};
