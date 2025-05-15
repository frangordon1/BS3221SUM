import express from 'express';

const router = express.Router();

function parseTimeToToday(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  now.setSeconds(0, 0); // Clear seconds & milliseconds
  now.setHours(hours);
  now.setMinutes(minutes);
  return now;
}

  
router.post('/', async (req, res) => {
  const db = req.app.locals.database;
  const { staffID, buildingName, checkInTime, checkOutTime } = req.body;

  try {
    const buildingQuery = await db.poolconnection
      .request()
      .input('buildingName', db.sql.NVarChar, buildingName)
      .query('SELECT buildingID FROM Buildings WHERE buildingName = @buildingName');

    if (buildingQuery.recordset.length === 0) {
      return res.status(400).json({ message: 'Invalid building name' });
    }

    const buildingID = buildingQuery.recordset[0].buildingID;

    const checkInID = Math.floor(100000 + Math.random() * 900000);

    // Insert check-in record
    await db.poolconnection
      .request()
      .input('staffID', db.sql.NVarChar, staffID)
      .input('buildingID', db.sql.NVarChar, String(buildingID))
      .input('checkInTime', db.sql.NVarChar, checkInTime)
      .input('checkOutTime', db.sql.NVarChar, checkOutTime)
      .query(`
        INSERT INTO CheckIns (staffID, buildingID, checkInTime, checkOutTime)
        VALUES (@staffID, @buildingID, @checkInTime, @checkOutTime)
      `);

    // Get current time and parse check-in/check-out time
    const now = new Date();
    const checkInDate = parseTimeToToday(checkInTime);
    const checkOutDate = parseTimeToToday(checkOutTime);

    // Update the wardenAssigned status only for the specific building
    const updateWardenAssigned = (value) => db.poolconnection
      .request()
      .input('buildingID', db.sql.NVarChar, String(buildingID))
      .input('value', db.sql.Bit, value)
      .query('UPDATE Buildings SET wardenAssigned = @value WHERE buildingID = @buildingID');

    // Check if there's at least one active shift for this building now
    const activeShifts = await db.poolconnection
      .request()
      .input('buildingID', db.sql.NVarChar, buildingID)
      .query(`
        SELECT * FROM CheckIns
        WHERE buildingID = @buildingID
      `);

    let isActive = false;
    const currentTime = new Date();

    for (const shift of activeShifts.recordset) {
      const start = parseTimeToToday(shift.checkInTime);
      const end = parseTimeToToday(shift.checkOutTime);
      if (currentTime >= start && currentTime <= end) {
        isActive = true;
        break;
      }
    }

    await updateWardenAssigned(isActive ? 1 : 0);


    res.status(200).json({ success: true, checkInID });
  } catch (err) {
    console.error('Error inserting check-in:', err);
    res.status(500).json({ success: false, message: 'Database insert failed' });
  }
});

  
router.get('/', async (req, res) => {
  const db = req.app.locals.database;
  const { staffID } = req.query; // Assuming staffID is sent as a query parameter

  try {
    // Modify the SQL query to filter by staffID
    const result = await db.poolconnection
      .request()
      .input('staffID', db.sql.NVarChar, staffID) // Ensure that the staffID is passed correctly
      .query(`
        SELECT 
          c.checkInID,
          c.checkInTime, 
          c.checkOutTime, 
          b.buildingName AS building,
          s.firstName,
          s.lastName,
          c.staffID
        FROM CheckIns c
        JOIN Buildings b ON c.buildingID = b.buildingID
        JOIN Wardens s ON c.staffID = s.staffID
        WHERE c.staffID = s.staffID
      `);
      
    const now = new Date();
    const shiftsWithStatus = result.recordset.map(shift => {
      const parsedCheckInTime = parseTimeToToday(shift.checkInTime);

      let status = 'Ended';
      let statusColor = 'red';

      if (now < parsedCheckInTime) {
        status = 'pending';
        statusColor = 'yellow';
      }

      return {
        ...shift,
        status,
        statusColor
      };
    });

    console.log(result.recordset); 
    res.status(200).json(shiftsWithStatus);
  } catch (err) {
    console.error('Error fetching check-ins:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch check-ins' });
  }
});


router.put('/:id', async (req, res) => {
  const db = req.app.locals.database;
  const { id } = req.params;
  const { checkInTime, checkOutTime } = req.body;

  try {
    const updateResult = await db.poolconnection
      .request()
      .input('checkInID', db.sql.Int, parseInt(id))
      .input('checkInTime', db.sql.NVarChar, checkInTime)
      .input('checkOutTime', db.sql.NVarChar, checkOutTime)
      .query(`
        UPDATE CheckIns
        SET checkInTime = @checkInTime, checkOutTime = @checkOutTime
        WHERE checkInID = @checkInID
      `);

    const buildingQuery = await db.poolconnection
      .request()
      .input('checkInID', db.sql.Int, parseInt(id))
      .query(`
        SELECT b.buildingID
        FROM CheckIns c
        JOIN Buildings b ON c.buildingID = b.buildingID
        WHERE c.checkInID = @checkInID
      `);

    if (buildingQuery.recordset.length === 0) {
      return res.status(400).json({ message: 'Building not found for this check-in' });
    }
    const buildingID = buildingQuery.recordset[0].buildingID;

    const updateStatus = (value) => {
      return db.poolconnection
        .request()
        .input('buildingID', db.sql.NVarChar, buildingID)
        .input('value', db.sql.Bit, value)
        .query(`
          UPDATE Buildings
          SET wardenAssigned = @value
          WHERE buildingID = @buildingID
        `);
    };

    // Check if there's at least one active shift for this building now
    const activeShifts = await db.poolconnection
      .request()
      .input('buildingID', db.sql.NVarChar, buildingID)
      .query(`
        SELECT * FROM CheckIns
        WHERE buildingID = @buildingID
      `);

    let isActive = false;
    const currentTime = new Date();

    for (const shift of activeShifts.recordset) {
      const start = parseTimeToToday(shift.checkInTime);
      const end = parseTimeToToday(shift.checkOutTime);
      if (currentTime >= start && currentTime <= end) {
        isActive = true;
        break;
      }
    }

    await updateStatus(isActive ? 1 : 0);

    return res.status(200).json({ success: true, message: 'Check-in updated successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update check-in' });
  }
});



router.delete('/:id', async (req, res) => {
  const db = req.app.locals.database;
  const { id } = req.params;

  try {
    await db.poolconnection
      .request()
      .input('checkInID', db.sql.Int, parseInt(id))
      .query(`DELETE FROM CheckIns WHERE checkInID = @checkInID`);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error deleting check-in:', err);
    res.status(500).json({ success: false, message: 'Failed to delete check-in' });
  }
});


export default router;

