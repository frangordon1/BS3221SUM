import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  const { staffID, password } = req.body;
  const db = req.app.locals.database;

  try {
    const request = db.poolconnection.request();

    const result = await request
      .input('staffID', db.sql.NVarChar(255), staffID)
      .query('SELECT * FROM WardenCredentials WHERE staffID = @staffID');

    if (result.recordset.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const user = result.recordset[0];

    // Plain-text password comparison
    if (user.password !== password) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const wardenResult = await db.poolconnection
      .request()
      .input('staffID', db.sql.NVarChar(255), staffID)
      .query('SELECT * FROM Wardens WHERE staffID = @staffID');

    if (wardenResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Warden details not found' });
    }

    const warden = wardenResult.recordset[0];

    res.json({
      success: true,
      user: {
        staffID: warden.staffID,
        firstName: warden.firstName,
        lastName: warden.lastName,
        email: warden.email,
        healthAndSafetyTeam: warden.healthAndSafetyTeam,
      }
    });
    console.log("User found, sending login success response.");
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;


