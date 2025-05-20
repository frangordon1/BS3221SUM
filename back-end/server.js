const { passwordConfig } = require('./config');
const wardenRegistrationRoutes = require('./routes/wardenregister');
const loginRoute = require('./routes/loggingin');
const buildingsRoute = require('./routes/buildings');
const checkinsRoute = require('./routes/checkins');
const usersRoute = require('./routes/user');
const { createDatabaseConnection } = require('./database');
const cors = require('cors');
const express = require('express');
const { scheduleTasks, clearCheckIns } = require('./schedule.js');

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: 'https://thankful-smoke-05a308503.6.azurestaticapps.net',
  methods: ['GET', 'POST', 'OPTIONS', 'DELETE', 'PUT'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.use('/api/wardenregister', wardenRegistrationRoutes);
app.use('/api/login', loginRoute);
app.use('/api/buildings', buildingsRoute);
app.use('/api/checkins', checkinsRoute);
app.use('/api/user', usersRoute);

// Catch-all for unrecognized API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Initialize DB and start server
(async () => {
  try {
    const database = await createDatabaseConnection(passwordConfig);
    app.locals.database = database;

    await clearCheckIns(database);
    scheduleTasks(database);

    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();




