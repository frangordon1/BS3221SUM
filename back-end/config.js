const dotenv = require('dotenv');

// Load the .env file if NODE_ENV is set to 'development'
dotenv.config({ path: './.env.development', debug: true });

// Destructure environment variables
const {
  AZURE_SQL_USER: user,
  AZURE_SQL_PASSWORD: password,
  AZURE_SQL_SERVER: server,
  AZURE_SQL_DATABASE: database,
  AZURE_SQL_PORT: port,
  AZURE_SQL_AUTH_TYPE: authenticationType,  // if you have this defined
} = process.env;

// Check if environment variables are loaded correctly
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

// Debugging log to check values
console.log("Loaded environment variables:");
console.log({ server, database, port, authenticationType, user, password });

const noPasswordConfig = {
  server,
  port,
  database,
  authentication: {
    type: authenticationType,  // e.g., 'sql-login'
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


