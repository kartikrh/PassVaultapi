// for test purposes
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
const UserModel = require('./userModel')(sequelize)

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
    references: {
      model: UserModel,
      key: 'WrUserId',
    },
  },
  WrUserType: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isIn: {
        args: [[-1, 0, 1, 2, 3]], // Define valid numbers
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

UserLoginInfoModel.belongsTo(UserModel, {
  foreignKey: 'WrUserId', // Foreign key in UserLoginInfoModel
  targetKey: 'WrUserId', // Target key in UserModel
});

  return UserLoginInfoModel;
};
