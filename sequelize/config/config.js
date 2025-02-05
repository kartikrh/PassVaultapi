"use strict";

module.exports = () => {
  let posrgreSqlDatabase;
  if (process.env.DB == "production") {
  } else {
    posrgreSqlDatabase = {
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      dialect: process.env.POSTGRES_DIALECT,
      logging: false, 
      pool: {
        max: 20,          // Maximum number of connections
        min: 5,           // Minimum number of connections
        acquire: 60000,   // Maximum time to get a connection (ms)
        idle: 10000,      // Maximum time connection can be idle (ms)
        evict: 5000       // Run cleanup every 1 second
      }
    };
  }
  return posrgreSqlDatabase;
};
