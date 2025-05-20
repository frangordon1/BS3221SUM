
import { passwordConfig } from './config.js';
import wardenRegistrationRoutes from './routes/wardenregister.js';
import loginRoute from './routes/loggingin.js';
import buildingsRoute from './routes/buildings.js';
import checkinsRoute from './routes/checkins.js';
import usersRoute from './routes/user.js';
import { createDatabaseConnection } from './database.js';
import cors from 'cors';
import express from 'express';


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

app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    console.log(`[${req.method}] ${req.originalUrl}`);
  }
  next();
});

app.use(cors(corsOptions))
app.use(express.json());



// API Routes
app.use('/api/wardenregister', wardenRegistrationRoutes);
app.use('/api/login',        loginRoute);
app.use('/api/buildings',    buildingsRoute);
app.use('/api/checkins',     checkinsRoute);
app.use('/api/user',         usersRoute);

// optional test endpoint
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






