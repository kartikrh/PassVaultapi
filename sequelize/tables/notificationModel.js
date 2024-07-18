const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const notificationModel = sequelize.define(
    "tblNotifications",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrTitle: {
        type : DataTypes.STRING,
        allowNull: false,
      },
      wrDescription :{
        type : DataTypes.TEXT,
        allowNull: true,
      },
      wrCommentaryId : {
        type : DataTypes.INTEGER,
        allowNull: true,
      },
      wrSendType : {
        type : DataTypes.INTEGER,
        allowNull: true,
      },
      wrCreatedAt : {
        type : DataTypes.DATE,
        allowNull: false,
        defaultValue : DataTypes.NOW,
      },
      wrCreatedBy : {
        type : DataTypes.INTEGER,
        allowNull: true,
      },
      wrModifyAt : {
        type : DataTypes.DATE,
        allowNull: true,
      },
      wrModifyBy : {
        type : DataTypes.INTEGER,
        allowNull: true,
      },
      wrUrl :{
        type : DataTypes.TEXT,
        allowNull: true,
        defaultValue : null,
      },
      wrImage : {
        type : DataTypes.TEXT,
        allowNull: true,
        defaultValue : null,
      },
      wrIcon :{
        type : DataTypes.TEXT,
        allowNull : true,
        defaultValue : null
      },
      wrIsSend : {
        type : DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue : false,
      },
      
    },
    {
      timestamps: false,
    }
  );
  return notificationModel;
};
