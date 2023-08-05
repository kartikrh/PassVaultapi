//! for every new route add a schema name you wish to group the api's on swagger
const Auth = {
  signUp: {
    schema: {
      tags: ["Auth"],
      body: {
        type: 'object',
        properties: {
          WrUserName: { type: 'string' },
          WrPassword: { type: 'string' },
          WrRoleId: { type: 'integer' },
          WrName: { type: 'string' },
          WrUserType: { type: 'integer', enum: [1, 2, 3] },
          WrMobile: { type: 'string' },
          WrIsActive: { type: 'boolean' },
          WrIsSuperAdmin: { type: 'boolean' },
          WrCreatedBy: { type: 'integer' },
          WrCreatedType: { type: 'integer' },
          WrModifyBy: { type: 'integer' },
          WrModifyType: { type: 'integer' },
          WrParentId: { type: 'integer' },
          WrIsDelete: { type: 'boolean' },
          WrDeleteBy: { type: 'integer' },
          WrDeleteDate: { type: 'string', format: 'date-time' },
          WrAllowMultipleLogin: { type: 'boolean' },
          WrSubAdminId: { type: 'integer' },
        },
        required: [
          'WrUserName',
          'WrPassword',
        ],
      },
    },
  },  
  signIn:{
    schema:{
      tags: ['Auth'],
  body: {
    type: 'object',
    properties: {
      WrUserName: { type: 'string' },
      WrPassword: { type: 'string' },
    },
    required: ['WrUserName', 'WrPassword'],
  },
    }
  }
  
};


const user = {
  schema: {
    tags: ["User"],
  },
};

module.exports = {
  Auth,
  user,
};
