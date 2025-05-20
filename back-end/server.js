import express from 'express';
import { passwordConfig } from './config.js';
import wardenRegistrationRoutes from './routes/wardenregister.js'; 
import loginRoute from './routes/loggingin.js'; 
import buildingsRoute from './routes/buildings.js';
import checkinsRoute from './routes/checkins.js';
import usersRoute from './routes/user.js';
import { createDatabaseConnection } from './database.js';
import { clearCheckIns } from './schedule.js';
import cors from 'cors';

const port = process.env.AZURE_SQL_PASSWORD || 5000;
const app = express();

// ✅ CORS configuration (replace the origin with your Static Web App URL)
const allowedOrigin = 'https://thankful-smoke-05a308503.6.azurestaticapps.net';

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/wardenregister', wardenRegistrationRoutes);
app.use('/api/login', loginRoute);  
app.use('/api/buildings', buildingsRoute); 
app.use('/api/checkins', checkinsRoute); 
app.use('/api/user', usersRoute); 

// Test endpoint
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




