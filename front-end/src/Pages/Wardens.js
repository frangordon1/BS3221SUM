import React, { useEffect, useState } from 'react';
import './WardenSchedule.css';

function Wardens() {
  const [pendingWardens, setPendingWardens] = useState([]);
  const [passwords] = useState({});
  const [roles, setRoles] = useState({});
  const [buildings, setBuildings] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const backEndURL = "https://warden-app-back-c2cfdhg8bnhwc4bj.uksouth-01.azurewebsites.net";

  useEffect(() => {
    const fetchData = async () => {
      const pendingRes = await fetch(`${backEndURL}/api/wardenregister/pending-wardens`);
      const buildingRes = await fetch(`${backEndURL}/api/buildings`);
      const checkInRes = await fetch(`${backEndURL}/api/checkinS`);

      const [pendingData, buildingsData, checkInsData] = await Promise.all([
        pendingRes.json(),
        buildingRes.json(),
        checkInRes.json(),
      ]);

      setPendingWardens(pendingData);
      setBuildings(buildingsData);
      setCheckIns(checkInsData);
    };

    fetchData();
  }, []);

  const handleRoleChange = (staffID, isChecked) => {
    const newValue = isChecked ? 1 : 0;
    setRoles({ ...roles, [staffID]: newValue });
  };

  const approveWarden = async (warden) => {
    const { staffID, firstName, lastName } = warden;
    const password = passwords[staffID];
    const role = roles[staffID];
    const isHealthAndSafetyTeam = role === 1 ? 1 : 0;

    const response = await fetch(`${backEndURL}/api/wardenregister/approve-warden/${staffID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, isHealthAndSafetyTeam }),
    });

    if (response.ok) {
      alert(`Registration of ${firstName} ${lastName} Approved`);
      setPendingWardens(prev => prev.filter(w => w.staffID !== staffID));
    } else {
      alert('Approval failed.');
    }
  };

  const user = JSON.parse(localStorage.getItem('userData'));
  const hstStatus = user?.healthAndSafetyTeam;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const timeToHour = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h + m / 60;
  };

  if (!hstStatus) {
    return <p>You are not authorized to view this page.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Pending Warden Requests</h2>
      {pendingWardens.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table className="table-auto w-full">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                <th>Staff ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Health and Safety Team?</th>
                <th>Approval Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingWardens.map((warden, index) => (
                <tr key={warden.staffID || index}>
                  <td>{warden.staffID}</td>
                  <td>{warden.firstName}</td>
                  <td>{warden.lastName}</td>
                  <td className="text-center">
                    <label>
                      <input
                        type="checkbox"
                        checked={roles[warden.staffID] === 1}
                        onChange={(e) => handleRoleChange(warden.staffID, e.target.checked)}
                      />{' '}
                      Member of Health and Safety Team?
                    </label>
                  </td>
                  <td>
                    <button
                      className="standard-button"
                      onClick={() => approveWarden(warden)}
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="text-xl font-bold mt-8 mb-4">Warden Schedule</h2>
      <div className="schedule-scroll">
        <div className="schedule-grid">
          {/* Header with sticky hour labels */}
          <div className="schedule-header">
          <div className="building-column-header">Building</div>
          {hours.map(hour => (
            <div key={hour} className="hour-cell">{`${hour}:00`}</div>
          ))}
        </div>

        {buildings.map((building, index) => (
          <div key={index} className="schedule-row">
            <div className="building-name">{building.buildingName}</div>
            <div className="shift-cells">
              {checkIns
                .filter(ci => ci.building === building.buildingName)
                .map((ci, i) => {
                  const left = timeToHour(ci.checkInTime) * 60;
                  const width = (timeToHour(ci.checkOutTime) - timeToHour(ci.checkInTime)) * 60;
                  return (
                    <div key={i} className="shift-bar" style={{left: `${left}px`, width: `${width}px`,}} title={`${ci.firstName} ${ci.lastName} | ${ci.checkInTime} - ${ci.checkOutTime}`}>
                      <div className="shift-info-name">
                        {`${ci.firstName} ${ci.lastName}`}
                      </div>
                      <div className="shift-info-time">
                        {`${ci.checkInTime} - ${ci.checkOutTime}`}
                      </div>
                      <div className="tooltip">
                        {`${ci.firstName} ${ci.lastName}\n${ci.checkInTime} - ${ci.checkOutTime}`}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
        </div>
      </div>

    </div>
  );
}

export default Wardens;
