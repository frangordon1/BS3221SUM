import cron from 'node-cron';
import { createDatabaseConnection } from './database.js';
import { passwordConfig } from './config.js';

let db;

const clearCheckIns = async () => {
  if (!db) {
    console.error('Database connection not established yet.');
    return;
  }

  try {
    console.log('Clearing CheckIns table...');
    await db.poolconnection
      .request()
      .query('DELETE FROM CheckIns')
      .query('UPDATE Buildings SET wardenAssigned = 0;')
    console.log('All entries in CheckIns table have been cleared.');
  } catch (err) {
    console.error('Error clearing CheckIns table:', err);
  }
};

const updateStatuses = async () => {
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
};



(async () => {
  try {
    db = await createDatabaseConnection(passwordConfig);
    console.log('Database connected for scheduled tasks.');

    cron.schedule('0 0 * * *', clearCheckIns, {
      timezone: "Europe/London"
    });

    cron.schedule('* * * * *', updateStatuses, {
      timezone: "Europe/London"
    });

  } catch (err) {
    console.error('Failed to connect database in scheduled task:', err);
  }
})();

export { clearCheckIns, updateStatuses };

