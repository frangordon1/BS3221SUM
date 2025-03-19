import express from 'express';
import { passwordConfig } from './config.js';
import wardenRoutes from './warden.js';
import { createDatabaseConnection } from './database.js';

const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(express.json());

// Connect App routes
app.use('/api/warden', wardenRoutes);

// Start the server after connecting to the database
(async () => {
  try {
    const database = await createDatabaseConnection(passwordConfig);
    app.locals.database = database; // Store the database in app.locals for reuse

    app.listen(port, () => {
      console.log(`✅ Server started on port ${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();


