import express from 'express';
import { passwordConfig } from './back-end/config.js';  // Correct path from root to back-end folder

// Import App routes
import warden from './back-end/warden.js';  // Correct path from root to back-end folder
import { createDatabaseConnection } from './back-end/database.js';  // Correct path from root to back-end folder

const database = await createDatabaseConnection(passwordConfig);  // Pass the correct config object

const port = process.env.PORT || 3000;

const app = express();

// Connect App routes
app.use('/warden', warden);

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

