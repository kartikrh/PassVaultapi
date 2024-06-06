const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {

  const ThirdPartyApiLogsModel = sequelize.define('tblThirdPartyApiLogs', {
    //* Auto increment primary key
    wrId : {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    wrEndPoint : {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    wrRequestBody : {
      type: DataTypes.JSON,
      allowNull: true,
    },
    wrRequestStartTime : {
        type: DataTypes.DATE,
        allowNull: true,
    },
    wrRequestEndTime : {
        type: DataTypes.DATE,
        allowNull: true,
    },
    wrResponse : {
        type: DataTypes.JSON,
        allowNull: true,
    },
  }, {
    timestamps: false,
  });

  return ThirdPartyApiLogsModel;
};