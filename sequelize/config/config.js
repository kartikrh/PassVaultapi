"use strict";

module.exports = () => {
  let posrgreSqlDatabase;
  if (process.env.DB == "production") {
  } else {
    posrgreSqlDatabase = {
      username: "postgres",
      password: "user123",
      database: "ScoreAPI",
      host: "127.0.0.1",
      port: 5432,
      dialect: "postgresql",
      logging: false, 
    };
  }
  return posrgreSqlDatabase;
};
