//! for every new route add a schema name you wish to group the api's on swagger
const Auth = {
  signin: {
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
