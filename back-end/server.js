import express from 'express';
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

app.use(express.json());

// ✅ Manual CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://thankful-smoke-05a308503.6.azurestaticapps.net');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// API routes
app.use('/api/wardenregister', wardenRegistrationRoutes);
app.use('/api/login', loginRoute);
app.use('/api/buildings', buildingsRoute);
app.use('/api/checkins', checkinsRoute);
app.use('/api/user', usersRoute);

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






