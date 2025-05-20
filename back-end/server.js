import express from 'express';
import { passwordConfig } from './config.js';
import wardenRegistrationRoutes from './routes/wardenregister.js';
import loginRoute from './routes/loggingin.js';
import buildingsRoute from './routes/buildings.js';
import checkinsRoute from './routes/checkins.js';
import usersRoute from './routes/user.js';
import { createDatabaseConnection } from './database.js';
import cors from 'cors';
// remove your `cors` import entirely, since Azure is handling it
// import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: 'https://thankful-smoke-05a308503.6.azurestaticapps.net',
  methods: ['GET', 'POST', 'OPTIONS', 'DELETE', 'PUT'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};


// no need for any CORS middleware here!
// app.use(cors({ origin: /*…*/ }));

app.use(express.json());

// API Routes
app.use('/api/wardenregister', wardenRegistrationRoutes);
app.use('/api/login',        loginRoute);
app.use('/api/buildings',    buildingsRoute);
app.use('/api/checkins',     checkinsRoute);
app.use('/api/user',         usersRoute);

// optional test endpoint
// Catch-all for any unhandled API routes
app.use('/api', (req, res, next) => {
  console.warn(`❌ Unmatched API route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `API route not found: ${req.originalUrl}` });
});

// Error handling middleware  

(async () => {
  try {
    const database = await createDatabaseConnection(passwordConfig);
    app.locals.database = database;

    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();






