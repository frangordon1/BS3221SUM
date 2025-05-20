const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  const db = req.app.locals.database;

  try {
    const request = db.poolconnection.request();
    const result = await request.query('SELECT buildingName FROM Buildings');

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching buildings:', err);
    res.status(500).json({ message: 'Failed to retrieve buildings' });
  }
});

router.get('/statuses', async (req, res) => {
  const db = req.app.locals.database;

  try {
    const result = await db.poolconnection.request().query(`
      SELECT 
        b.buildingID, 
        b.buildingName,
        CASE 
          WHEN b.wardenAssigned = 1 THEN 'assigned'
          ELSE 'none'
        END AS status,
      (
        SELECT TOP 1 c.checkInTime
        FROM Checkins c 
        WHERE c.buildingID = b.buildingName 
          AND CAST(GETDATE() AS time) < CAST(c.checkInTime AS time)
          AND c.checkInTime IS NOT NULL
        ORDER BY CAST(c.checkInTime AS time)
      ) AS nextCheckInTime
      FROM Buildings b
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching building statuses:', err);
    res.status(500).json({ error: 'Failed to fetch building statuses' });
  }
});

module.exports = router;

