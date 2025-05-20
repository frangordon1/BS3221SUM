const cron = require('node-cron');

let db;

const clearCheckIns = async (db) => {
  if (!db) {
    console.error('Database connection not established yet.');
    return;
  }

  try {
    console.log('Deleting old CheckIns...');
    await db.poolconnection.request().query(`
      DELETE FROM CheckIns 
      WHERE CAST(timestamp AS DATE) < CAST(GETDATE() AS DATE)
    `);

    console.log('Old check-ins cleared.');
  } catch (err) {
    console.error('Error clearing old CheckIns:', err);
  }
};


const updateStatuses = async (db) => {
  if (!db) {
    console.error('Database connection not established yet.');
    return;
  }

  try {
    const now = new Date();
    const result = await db.poolconnection.request()
      .query('SELECT checkInTime, checkOutTime, buildingID FROM CheckIns');

    const activeBuildings = new Set();

    for (const { checkInTime, checkOutTime, buildingID } of result.recordset) {
      const start = new Date(checkInTime);
      const end = new Date(checkOutTime);
      if (now >= start && now < end) {
        activeBuildings.add(buildingID);
      }
    }

    for (const buildingID of activeBuildings) {
      await db.poolconnection.request()
        .input('buildingID', db.sql.NVarChar, buildingID)
        .input('value', db.sql.Bit, 1)
        .query('UPDATE Buildings SET wardenAssigned = @value WHERE buildingID = @buildingID');
    }

    const allBuildings = await db.poolconnection.request()
      .query('SELECT buildingID FROM Buildings');

    for (const { buildingID } of allBuildings.recordset) {
      if (!activeBuildings.has(buildingID)) {
        await db.poolconnection.request()
          .input('buildingID', db.sql.NVarChar, buildingID)
          .input('value', db.sql.Bit, 0)
          .query('UPDATE Buildings SET wardenAssigned = @value WHERE buildingID = @buildingID');
      }
    }
  } catch (err) {
    console.error('Error updating statuses:', err);
  }
};

// This function receives the database connection and sets up cron jobs
function scheduleTasks(database) {
  db = database;

  cron.schedule('0 0 * * *', clearCheckIns, {
    timezone: 'Europe/London',
  });

  cron.schedule('* * * * *', updateStatuses, {
    timezone: 'Europe/London',
  });

  console.log('Scheduled tasks started.');
}

module.exports = {
  scheduleTasks,
};


