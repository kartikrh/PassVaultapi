//! for every new route add a schema name you wish to group the api's on swagger
const Auth = {
  signUp: {
    schema: {
      tags: ["Auth"],
      body: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
          roleId: { type: 'integer' },
          name: { type: 'string' },
          mobile: { type: 'string' },
        },
        required: ['username', 'password', 'roleId', 'name', 'mobile'],
      },
    },
  },
  signIn:{
    schema:{
      tags: ['Auth'],
  body: {
    type: 'object',
    properties: {
      username: { type: 'string' },
      password: { type: 'string' },
    },
    required: ['username', 'password'],
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
