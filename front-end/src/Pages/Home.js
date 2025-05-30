import React, { useState, useEffect } from 'react';

const statusColors = {
  assigned: 'green',
  pending: 'yellow',
  none: 'red',
};

const Home = () => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  const { firstName = '', lastName = '', staffID = '' } = userData;

  const [formData, setFormData] = useState({ staffID, building: '', checkInTime: '', checkOutTime: '' });
  const [buildings, setBuildings] = useState([]);
  const [buildingStatuses, setBuildingStatuses] = useState([]);
  const [allShifts, setAllShifts] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [editedTimes, setEditedTimes] = useState({});
  const backEndURL = "https://warden-app-back-c2cfdhg8bnhwc4bj.uksouth-01.azurewebsites.net";

useEffect(() => {
  const fetchData = async () => {
    try {
      const buildingsRes = await fetch(`${backEndURL}/api/buildings`);
      const buildingsData = await buildingsRes.json();
      setBuildings(buildingsData);

      const statusesRes = await fetch(`${backEndURL}/api/buildings/statuses`);
      const statusesData = await statusesRes.json();

      const shiftsRes = await fetch(`${backEndURL}/api/checkins`);
      const shiftsData = await shiftsRes.json();

      const today = new Date().toISOString().split('T')[0];

      // Filter for current user's shifts
      const filteredShifts = shiftsData.filter((shift) => {
        const shiftDate = shift.timestamp?.split('T')[0];
        return shift.staffID === staffID && shiftDate === today;
      });
      setAllShifts(filteredShifts);

      // Use all shifts for building list
      const todayAllShifts = shiftsData.filter((shift) => {
        const shiftDate = shift.timestamp?.split('T')[0];
        return shiftDate === today;
      });

      const updatedStatuses = statusesData.map((status) => {
        const buildingShifts = todayAllShifts.filter(
          (shift) => shift.building === status.buildingName
        );

        const futureShifts = buildingShifts.filter((shift) => {
          const checkInDateStr = `${today}T${shift.checkInTime}:00`;
          const checkInDate = new Date(checkInDateStr);
          return checkInDate > new Date();
        });

        const nextShift = futureShifts
          .sort(
            (a, b) =>
              new Date(`${today}T${a.checkInTime}:00`) -
              new Date(`${today}T${b.checkInTime}:00`)
          )[0];
        const nextCheckInTime = nextShift ? nextShift.checkInTime : null;

        const currentShift = buildingShifts.find((shift) => {
          const now = new Date();
          const checkIn = new Date(`${today}T${shift.checkInTime}:00`);
          const checkOut = new Date(`${today}T${shift.checkOutTime}:00`);
          return now >= checkIn && now <= checkOut;
        });
        
        const nextCheckOutTime = currentShift
          ? currentShift.checkOutTime
          : nextShift
          ? nextShift.checkOutTime
          : null;

        const hasStartedShift = Boolean(currentShift);

        let statusLabel = 'none';
        if (hasStartedShift) {
          statusLabel = 'assigned';
        } else if (futureShifts.length > 0) {
          statusLabel = 'pending';
        }

        return {
          ...status,
          nextCheckInTime,
          nextCheckOutTime,
          status: statusLabel,
        };
      });

      setBuildingStatuses(updatedStatuses);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  fetchData();
}, [staffID]);

  const parseTime = (timeStr) => {
    const [hour, minute] = timeStr.split(':').map(Number);
    const time = new Date();
    time.setHours(hour, minute, 0, 0);
    return time;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const CheckInSubmit = async (e) => {
    e.preventDefault();
    const { staffID, building, checkInTime, checkOutTime } = formData;

    try {
      const response = await fetch(`${backEndURL}/api/checkins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffID, buildingName: building, checkInTime, checkOutTime }),
      });

      const result = await response.json();

      if(checkInTime > checkOutTime){
        window.alert("Check-in time must be earlier than the Check-out time.", "OK");
        return;
      }

      if (response.ok) {
        alert('Check-in recorded successfully!');
        setFormData({ staffID, building: '', checkInTime: '', checkOutTime: '' });

        const updatedBuildingStatusesRes = await fetch(`${backEndURL}/api/buildings/statuses`);
        const updatedBuildingStatuses = await updatedBuildingStatusesRes.json();
        setBuildingStatuses(updatedBuildingStatuses);
        window.location.reload();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Submission failed');
    }
  };

  const handleEditClick = (shift) => {
    setEditingRow(shift.checkInID);
    setEditedTimes({
      checkInTime: shift.checkInTime,
      checkOutTime: shift.checkOutTime,
    });
  };

  const handleCancelClick = () => {
    setEditingRow(null);
    setEditedTimes({});
  };

  const handleConfirmClick = async (shift) => {
    try {
      const response = await fetch(`${backEndURL}/api/checkins/${shift.checkInID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkInTime: editedTimes.checkInTime,
          checkOutTime: editedTimes.checkOutTime,
        }),
      });
  
      if (response.ok) {
        alert('Shift updated!');
        handleCancelClick();
        window.location.reload();
        
        const updatedShiftsRes = await fetch(`${backEndURL}/api/shifts?staffID=${shift.staffID}`);
        const updatedShifts = await updatedShiftsRes.json();
        setAllShifts(updatedShifts); // Update the shifts data
  
        // Refetch building statuses to ensure they reflect any changes
        const updatedBuildingStatusesRes = await fetch(`${backEndURL}/api/buildings/statuses`);
        const updatedBuildingStatuses = await updatedBuildingStatusesRes.json();
        setBuildingStatuses(updatedBuildingStatuses);
  

      } else {
        alert('Failed to update shift');
      }
    } catch (err) {
      console.error('Update failed:', err);
    }
  };
  

const handleDeleteClick = async (shift) => {
  const confirmed = window.confirm('Are you sure you want to delete this shift?');
  if (!confirmed) return;

  try {
    const response = await fetch(`${backEndURL}/api/checkins/${shift.checkInID}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      alert('Shift deleted!');
      const updatedShifts = allShifts.filter((s) => s.checkInID !== shift.checkInID);
      setAllShifts(updatedShifts);

      // Recalculate status for the affected building
      const today = new Date().toISOString().split('T')[0];
      const buildingName = shift.building;
      const todayShifts = updatedShifts.filter((s) => s.building === buildingName);

      const futureShifts = todayShifts.filter((s) => {
        const checkInDate = new Date(`${today}T${s.checkInTime}:00`);
        return checkInDate > new Date();
      });

      const nextShift = futureShifts
        .sort(
          (a, b) =>
            new Date(`${today}T${a.checkInTime}:00`) -
            new Date(`${today}T${b.checkInTime}:00`)
        )[0];

      const currentShift = todayShifts.find((s) => {
        const now = new Date();
        const checkIn = new Date(`${today}T${s.checkInTime}:00`);
        const checkOut = new Date(`${today}T${s.checkOutTime}:00`);
        return now >= checkIn && now <= checkOut;
      });

      const statusLabel = currentShift
        ? 'assigned'
        : futureShifts.length > 0
        ? 'pending'
        : 'none';

      const updatedBuildingStatuses = buildingStatuses.map((b) => {
        if (b.buildingName === buildingName) {
          return {
            ...b,
            status: statusLabel,
            nextCheckInTime: currentShift?.checkOutTime || nextShift?.checkOutTime || null,
          };
        }
        return b;
      });

      setBuildingStatuses(updatedBuildingStatuses);
    } else {
      alert('Failed to delete shift');
    }
  } catch (err) {
    console.error('Delete failed:', err);
    alert('An error occurred while deleting the shift.');
  }
};



  return (
    <div>
      <div className="form-container">
        <div className="new-shift-form">
          <h1 className="text-2xl font-bold">Welcome to the Warden Tracker, {firstName} {lastName}</h1>
          <h2 className="text-xl font-bold">New Warden Shift</h2>
          <form onSubmit={CheckInSubmit}>
            <label htmlFor="staffID">StaffID:</label><br />
            <input
              type="text"
              id="staffID"
              name="staffID"
              readOnly
              value={formData.staffID}
              onChange={handleChange}
            /><br />

            <label htmlFor="building">Building:</label><br />
            <select
              id="building"
              name="building"
              required
              value={formData.building}
              onChange={handleChange}
            >
              <option value="">-- Select a building --</option>
              {buildings.map((b, index) => (
                <option key={index} value={b.buildingName}>
                  {b.buildingName}
                </option>
              ))}
            </select><br />

            <label htmlFor="checkInTime">Check-In Time:</label><br />
            <input
              type="time"
              id="checkInTime"
              name="checkInTime"
              required
              value={formData.checkInTime}
              onChange={handleChange}
            /><br />

            <label htmlFor="checkOutTime">Check-Out Time:</label><br />
            <input
              type="time"
              id="checkOutTime"
              name="checkOutTime"
              required
              value={formData.checkOutTime}
              onChange={handleChange}
            /><br />

            <button className="standard-button" type="submit">Confirm</button>
          </form>
        </div>

        <div className="status-sidebar">
          <h3 className="text-xl font-bold">Buildings</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {buildingStatuses.map((status) => (
              <li
                key={status.buildingID}
                style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}
                title={  
                  status.status === 'assigned'
                  ? `Ongoing shift ends at: ${status.nextCheckOutTime}`
                  : status.nextCheckInTime
                  ? `Next Warden Shift: ${status.nextCheckInTime}`
                  : 'No upcoming shift'
                }
              >
                <span
                  style={{
                    height: '10px',
                    width: '10px',
                    borderRadius: '50%',
                    backgroundColor: statusColors[status.status],
                    display: 'inline-block',
                    marginRight: '8px',
                  }}
                ></span>
                {status.buildingName}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold mt-5">Today's Shifts</h3>
        <div>
          {allShifts.length === 0 ? (
            <p>No shifts recorded yet.</p>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2">Building</th>
                  <th className="border p-2">Check-In Time</th>
                  <th className="border p-2">Check-Out Time</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allShifts.map((shift, index) => {
                  const checkInTime = parseTime(shift.checkInTime);
                  const checkOutTime = parseTime(shift.checkOutTime);

                  let status = '';
                  let rowClass = '';

                  if (new Date() < checkInTime) {
                    status = 'Pending';
                    rowClass = 'bg-yellow';
                  } else if (new Date() >= checkInTime && new Date() <= checkOutTime) {
                    status = 'Started';
                    rowClass = 'bg-green-100';
                  } else {
                    status = 'Ended';
                    rowClass = 'bg-gray-200';
                  }

                  return (
                    <tr key={index} className={rowClass}>
                      <td className="border px-4 py-2">{shift.building}</td>
                      <td className="border px-4 py-2">
                        {editingRow === shift.checkInID ? (
                          <input
                            type="time"
                            value={editedTimes.checkInTime}
                            onChange={(e) => setEditedTimes({ ...editedTimes, checkInTime: e.target.value })}
                          />
                        ) : (
                          shift.checkInTime
                        )}
                      </td>
                      <td className="border px-4 py-2">
                        {editingRow === shift.checkInID ? (
                          <input
                            type="time"
                            value={editedTimes.checkOutTime}
                            onChange={(e) => setEditedTimes({ ...editedTimes, checkOutTime: e.target.value })}
                          />
                        ) : (
                          shift.checkOutTime
                        )}
                      </td>
                      <td className="border px-4 py-2">{status}</td>
                      <td className="border px-4 py-2">
                        {editingRow === shift.checkInID ? (
                          <>
                            <button className="standard-button" onClick={() => handleConfirmClick(shift)}>✓</button>
                            <button className="standard-button" onClick={handleCancelClick}>✗</button>
                          </>
                        ) : (
                          <>
                            <button className="standard-button" onClick={() => handleEditClick(shift)}>Edit</button>
                            <button className="standard-button" onClick={() => handleDeleteClick(shift)}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;




