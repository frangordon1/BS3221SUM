import * as dotenv from 'dotenv';

// Load the .env file if NODE_ENV is set to 'development'
dotenv.config({ path: './.env.development', debug: true });


// Check if environment variables are loaded correctly
const server = process.env.AZURE_SQL_SERVER;
const database = process.env.AZURE_SQL_DATABASE;
const port = +process.env.AZURE_SQL_PORT;  // Convert to a number
const authenticationType = process.env.AZURE_SQL_AUTHENTICATIONTYPE;
const user = process.env.AZURE_SQL_USER;
const password = process.env.AZURE_SQL_PASSWORD;

// Debugging log to check values
console.log("Loaded environment variables:");
console.log({ server, database, port, authenticationType, user, password });

export const noPasswordConfig = {
  server,
  port,
  database,
  authentication: {
    type: authenticationType,  // 'sql-login'
    options: {
      userName: user,
      password: password,
    }
  },
  options: {
    encrypt: true,
  }
};

export const passwordConfig = {
  server,
  port,
  database,
  user,
  password,
  options: {
    encrypt: true,
  }
};

