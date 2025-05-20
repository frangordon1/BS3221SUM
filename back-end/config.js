import * as dotenv from 'dotenv';

// Load the .env file if NODE_ENV is set to 'development'
dotenv.config({ path: './.env.development', debug: true });


// Check if environment variables are loaded correctly
export const passwordConfig = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};


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


