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
        max: 20,
        min: 0,
        acquire: 60000,
        idle: 30000,
        evict: 10000,
      }
    };
  }
  return posrgreSqlDatabase;
};
