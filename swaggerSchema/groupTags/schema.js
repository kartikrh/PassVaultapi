//! for every new route add a schema name you wish to group the api's on swagger
const admin = {
  schema: {
    tags: ["Admin"],
  },
};


const user = {
  schema: {
    tags: ["User"],
  },
};

module.exports = {
  admin,
  user,
};
