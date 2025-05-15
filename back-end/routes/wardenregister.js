import express from 'express';
const router = express.Router();

//Submit registration request
router.post('/register-request', async (req, res) => {
  const db = req.app.locals.database;
  const { staffID, firstName, lastName, email, password } = req.body;
  console.log("Extracted password:", password);
  try {
    const request = db.poolconnection.request(); 

    // Input parameters
    await request
      .input('staffID', db.sql.NVarChar(255), staffID)
      .input('firstName', db.sql.NVarChar(255), firstName)
      .input('lastName', db.sql.NVarChar(255), lastName)
      .input('email', db.sql.NVarChar(255), email)
      .input('password', db.sql.NVarChar(255), password)
      .query(`
        INSERT INTO PendingWardens (staffID, firstName, lastName, email, password)
        VALUES (@staffID, @firstName, @lastName, @email, @password)
      `);

    res.status(200).send('Request submitted');
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Server error');
  }
});

//Get the pending wardens
router.get('/pending-wardens', async (req, res) => {
  const db = req.app.locals.database;

  try {
    const request = db.poolconnection.request(); 
    const result = await request.query('SELECT * FROM PendingWardens');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching pending wardens');
  }
});

router.post('/approve-warden/:staffID', async (req, res) => {
  const db = req.app.locals.database;
  const { staffID } = req.params;
  const { isHealthAndSafetyTeam } = req.body;

  try {
    const request = db.poolconnection.request();

    // Fetch the specific pending warden
    const result = await request
      .input('staffID', db.sql.NVarChar(255), staffID)
      .query('SELECT * FROM PendingWardens WHERE staffID = @staffID');

    const warden = result.recordset[0];

    if (!warden) {
      return res.status(404).send('Warden not found');
    }

    const password = warden.password;

    // Insert into Wardens table
    await request
      .input('firstName', db.sql.NVarChar(255), warden.firstName)
      .input('lastName', db.sql.NVarChar(255), warden.lastName)
      .input('healthAndSafetyTeam', db.sql.Bit, isHealthAndSafetyTeam)
      .input('email', db.sql.NVarChar(255), warden.email)
      .query(`
        INSERT INTO Wardens (staffID, firstName, lastName, healthAndSafetyTeam, email)
        VALUES (@staffID, @firstName, @lastName, @healthAndSafetyTeam, @email)
      `);

    // Insert into WardenCredentials table
    await request
      .input('password', db.sql.NVarChar(255), password)
      .query(`
        INSERT INTO WardenCredentials (staffID, password)
        VALUES (@staffID, @password)
      `);

    // Delete from PendingWardens
    await request.query('DELETE FROM PendingWardens WHERE staffID = @staffID');

    res.send('Request approved');
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).send('Approval failed');
  }
});



export default router;

  