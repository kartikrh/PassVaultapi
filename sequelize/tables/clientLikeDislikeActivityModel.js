const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const ClientLikeDislikeActivityModel = sequelize.define(
        "tblClientLikeDislikeActivity",
        {
            wrId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            wrType: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            wrRefId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrClientId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrIsLike: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            wrCreatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            wrUpdatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            wrWhitelabelId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            }
        },
        {
            timestamps: false,
        });

    return ClientLikeDislikeActivityModel;
};
