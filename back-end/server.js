import express from 'express';
import cors from 'cors';

import { passwordConfig } from './config.js';
import wardenRegistrationRoutes from './routes/wardenregister.js'; 
import loginRoute from './routes/loggingin.js'; 
import buildingsRoute from './routes/buildings.js';
import checkinsRoute from './routes/checkins.js';
import usersRoute from './routes/user.js';
import { createDatabaseConnection } from './database.js';
import { clearCheckIns } from './schedule.js';

const port = process.env.PORT || 5000;
const app = express();

const corsOptions = {
  origin: 'https://thankful-smoke-05a308503.6.azurestaticapps.net',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
 
app.use(express.json());

// Explicitly handle OPTIONS requests to ensure CORS headers are sent
app.options('*', cors(corsOptions));

// API Routes
app.use('/api/wardenregister', wardenRegistrationRoutes);
app.use('/api/login', loginRoute);  
app.use('/api/buildings', buildingsRoute); 
app.use('/api/checkins', checkinsRoute); 
app.use('/api/user', usersRoute); 

// Optional test endpoint
app.get('/api/test', (req, res) => {
  res.send('API is working');
});

// Start the server after connecting to the database
(async () => {
  try {
    const database = await createDatabaseConnection(passwordConfig);
    app.locals.database = database;

    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();





