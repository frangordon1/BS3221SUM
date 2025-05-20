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

const app = express();
const port = process.env.PORT || 5000;

// ✅ Allow only your front-end domain
const allowedOrigin = 'https://thankful-smoke-05a308503.6.azurestaticapps.net';

// ✅ CORS setup
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ✅ Handle preflight OPTIONS requests
app.options('*', cors());

// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use('/api/wardenregister', wardenRegistrationRoutes);
app.use('/api/login', loginRoute);  
app.use('/api/buildings', buildingsRoute); 
app.use('/api/checkins', checkinsRoute); 
app.use('/api/user', usersRoute); 

// ✅ Start server after DB
(async () => {
  try {
    const database = await createDatabaseConnection(passwordConfig);
    app.locals.database = database;

    app.get('/api/test', (req, res) => {
      res.send('API is working');
    });

    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();




