const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ClientDltReqModel = sequelize.define(
    "tblClientDltReq",
    {
        wrId : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            allowNull : false,
            autoIncrement : true
        },
        wrClientId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        wrCreatedAt : {
            type : DataTypes.DATE,
            allowNull : false,
            defaultValue : DataTypes.NOW()
        }

    },
    {
      timestamps: false,
    }
  );

  return ClientDltReqModel;
};
