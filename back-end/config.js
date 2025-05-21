const dotenv = require('dotenv');

dotenv.config({ path: './.env.development', debug: true });

const {
  AZURE_SQL_USER: user,
  AZURE_SQL_PASSWORD: password,
  AZURE_SQL_SERVER: server,
  AZURE_SQL_DATABASE: database,
  AZURE_SQL_PORT: port,
  AZURE_SQL_AUTH_TYPE: authenticationType, 
} = process.env;

const passwordConfig = {
  user,
  password,
  server,
  database,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

const noPasswordConfig = {
  server,
  port,
  database,
  authentication: {
    type: authenticationType, 
    options: {
      userName: user,
      password: password,
    }
  },
  options: {
    encrypt: true,
  }
};

module.exports = {
  passwordConfig,
  noPasswordConfig,
};


