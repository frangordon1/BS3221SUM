const express = require('express');
const router = express.Router();

router.put('/:staffID', async (req, res) => {
    const db = req.app.locals.database;
    const { firstName, lastName, email, password } = req.body;
    const staffID = req.params.staffID;

    try {
        const userQuery = 'SELECT * FROM Wardens WHERE staffID = @staffID';
        const result = await db.poolconnection.request()
            .input('staffID', db.sql.NVarChar(255), staffID)
            .query(userQuery);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updateQuery = `
            UPDATE Wardens
                SET staffID = @newStaffID,
                    firstName = @firstName,
                    lastName = @lastName,
                    email = @email
                WHERE staffID = @staffID;
            `;

        await db.poolconnection.request()
            .input('staffID', db.sql.NVarChar(255), staffID)
            .input('firstName', db.sql.NVarChar(255), firstName)
            .input('lastName', db.sql.NVarChar(255), lastName)
            .input('email', db.sql.NVarChar(255), email)
            .query(updateQuery);

        if (password) {
            await db.poolconnection.request()
                .input('staffID', db.sql.NVarChar(255), staffID)
                .input('password', db.sql.NVarChar(255), password)
                .query('UPDATE WardenCredentials SET staffID = @newStaffID, password = @password WHERE staffID = @staffID');
        }

        const updatedUser = await db.poolconnection.request()
            .input('staffID', db.sql.NVarChar(255), staffID)
            .query('SELECT * FROM Wardens WHERE staffID = @staffID');

        res.json(updatedUser.recordset[0]);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

router.delete('/delete/:staffID', async (req, res) => {
  const db = req.app.locals.database;

  try {
    const userQuery = 'SELECT * FROM Wardens WHERE staffID = @staffID';
    const result = await db.poolconnection.request()
      .input('staffID', db.sql.NVarChar(255), req.params.staffID)
      .query(userQuery);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await db.poolconnection.request()
      .input('staffID', db.sql.NVarChar(255), req.params.staffID)
      .query('DELETE FROM CheckIns WHERE staffID = @staffID');

    await db.poolconnection.request()
      .input('staffID', db.sql.NVarChar(255), req.params.staffID)
      .query('DELETE FROM WardenCredentials WHERE staffID = @staffID');

    await db.poolconnection.request()
      .input('staffID', db.sql.NVarChar(255), req.params.staffID)
      .query('DELETE FROM Wardens WHERE staffID = @staffID');

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

module.exports = router;


