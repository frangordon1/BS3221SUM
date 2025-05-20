import express from 'express';
import { passwordConfig } from './config.js';
import wardenRegistrationRoutes from './routes/wardenregister.js'; 
import loginRoute from './routes/loggingin.js'; 
import buildingsRoute from './routes/buildings.js';
import checkinsRoute from './routes/checkins.js';
import usersRoute from './routes/user.js';
import { createDatabaseConnection } from './database.js';
import { scheduleTasks } from './schedule.js';  // <-- updated import
import cors from 'cors';

const port = process.env.PORT || 5000;
const app = express();

// CORS configuration
const corsOptions = {
  origin: 'https://thankful-smoke-05a308503.6.azurestaticapps.net',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/wardenregister', wardenRegistrationRoutes);
app.use('/api/login', loginRoute);  
app.use('/api/buildings', buildingsRoute); 
app.use('/api/checkins', checkinsRoute); 
app.use('/api/user', usersRoute);

app.get('/api/test', (req, res) => {
  res.send('API is working');
});

(async () => {
  try {
    const database = await createDatabaseConnection(passwordConfig);
    app.locals.database = database;

    // Pass DB connection to schedule tasks to initialize cron jobs
    scheduleTasks(database);

    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();





