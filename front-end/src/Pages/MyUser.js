import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MyUser = () => {
  const [userData, setUserData] = useState({});
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const backEndURL = "https://warden-app-back-c2cfdhg8bnhwc4bj.uksouth-01.azurewebsites.net";
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem('userData')) || {};
    setUserData(storedUserData);
  }, []); 
  
 const handleEditClick = () => {
    setEditedData({
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      password: '',
    });
    setConfirmPassword('');
    setPasswordError('');
    setEditing(true);
  };

  const handleCancelClick = () => {
    setEditing(false);
    setEditedData({
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      password: '',
    });
    setConfirmPassword('');
    setPasswordError('');
  };

  const handleChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handleConfirmClick = async () => {
    if (editedData.password && editedData.password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    const updatePayload = {
      firstName: editedData.firstName,
      lastName: editedData.lastName,
      email: editedData.email,
      password: editedData.password
    };

    try {
      const res = await fetch(`${backEndURL}/api/user/${userData.staffID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUserData(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        setEditing(false);
        alert('Profile updated!');
      } else {
        alert('Failed to update profile.');
      }
    } catch (err) {
      console.error('Update failed:', err);
      alert('An error occurred.');
    }
  };

  const handleDeleteClick = async () => {
    if (userData.staffID === "001"){
      window.alert("This is the core admin account, deletion is not permitted", "OK");
      return;

    }
    const confirmation = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmation) return;

    try {
      const res = await fetch(`${backEndURL}/api/user/delete/${userData.staffID}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        localStorage.removeItem('userData'); 
        navigate('/'); 
        alert('Your account has been deleted.');
      } else {
        alert('Failed to delete account.');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('An error occurred while deleting your account.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>

      <div className="space-y-4">
        <div>
          <label className="font-medium">Staff ID:</label><br />
          <input type="text" readOnly value={userData.staffID} className="border p-1 w-full bg-gray-100"/>
        </div>

        <div>
          <label className="font-medium">First Name:</label><br />
          {editing ? (
            <input
              type="text"
              name="firstName"
              value={editedData.firstName}
              onChange={handleChange}
              className="border p-1 w-full"
            />
          ) : (
            <p>{userData.firstName}</p>
          )}
        </div>

        <div>
          <label className="font-medium">Last Name:</label><br />
          {editing ? (
            <input
              type="text"
              name="lastName"
              value={editedData.lastName}
              onChange={handleChange}
              className="border p-1 w-full"
            />
          ) : (
            <p>{userData.lastName}</p>
          )}
        </div>

        <div>
          <label className="font-medium">Email:</label><br />
          {editing ? (
            <input
              type="email"
              name="email"
              value={editedData.email}
              onChange={handleChange}
              className="border p-1 w-full"
            />
          ) : (
            <p>{userData.email}</p>
          )}
        </div>

        <div>
          <label className="font-medium">Password:</label><br />
          {editing ? (
            <>
              <input
                type="password"
                name="password"
                value={editedData.password}
                onChange={handleChange}
                className="border p-1 w-full"
                placeholder="New password"
              />
              <br />
              <label className="font-medium">Confirm Password:</label><br />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border p-1 w-full"
                placeholder="Confirm new password"
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </>
          ) : (
            <p>••••••••</p>
          )}
        </div>

        <div className="mt-4">
          {editing ? (
            <>
              <button onClick={handleConfirmClick} className="standard-button">✓ Confirm</button>
              <button onClick={handleCancelClick} className="standard-button">✗ Cancel</button>
            </>
          ) : (
            <button onClick={handleEditClick} className="standard-button">Edit Profile</button>
          )}
        </div>
        <div className="mt-4">
          <button onClick={handleDeleteClick} className="standard-button">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyUser;



