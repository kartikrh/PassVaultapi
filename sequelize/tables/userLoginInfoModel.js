// for test purposes
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
 
const UserLoginInfoModel = sequelize.define('tblUserLoginInfo', {
  WrID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  WrUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  WrUserType: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isIn: {
        args: [[0, 1, 2, 3]], // Define valid numbers
        msg: 'Invalid status value',
      },
    },
  },
  wrInfo: {
    type: DataTypes.STRING(2000),
    allowNull: true,
  },
  wrIsLogin: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  WrCreatedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  wrToken: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
},{
  timestamps: false,
});
sequelize
.sync({ alter: true,logging: false  })
.then(() => {
  console.log("Models synchronized with the database.");
})
.catch((error) => {
  console.error("Error:", error);
});

  return UserLoginInfoModel;
};
