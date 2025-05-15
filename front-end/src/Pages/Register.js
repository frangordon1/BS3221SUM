import React, { useState } from 'react';

function Register() {
  const [formData, setFormData] = useState({ staffID: '', firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const { staffID, firstName, lastName, email, password } = formData;
    console.log(formData);


    const response = await fetch('/api/wardenregister/register-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffID, firstName, lastName, email, password }),
    });

    if (response.ok) {
      alert('Your request has been sent to the Health and Safety Team');
      window.location.href = '/';
    } else {
      alert('Something went wrong!');
    }
  };

  return (
    <>
        <h1 className="text-2xl font-bold"> Register as a Warden </h1>

        <form onSubmit={handleSubmit}>
            <label htmlFor="staffID">Staff Number:</label><br />
            <input type="text" id="staffID" name="staffID" required value={formData.staffID} onChange={handleChange}/><br/>

            <label htmlFor="firstName">First name:</label><br/>
            <input type="text" id="firstName" name="firstName" required value={formData.firstName} onChange={handleChange}/><br/>

            <label htmlFor="lastName">Last name:</label><br/>
            <input type="text" id="lastName" name="lastName" required  value={formData.lastName} onChange={handleChange}/><br/>

            <label htmlFor="email">Email:</label><br/>
            <input type="text" id="email" name="email" required pattern=".+@.+" value={formData.email} onChange={handleChange}/><br/>

            <label htmlFor="password">Password:</label><br/>
            <input type="password" id="password" name="password" required value={formData.password} onChange={handleChange}/><br/>

            <label htmlFor="confirmPassword">Confirm Password:</label><br/>
            <input type="password" id="confirmPassword" name="confirmPassword" required  value={formData.confirmPassword} onChange={handleChange}/><br/>

            <button className="standard-button" type="submit">Register</button>
            <button className="standard-button" type="button" padding="10" onClick={() => window.location.href = '/'}>Cancel</button>
        </form>

        <footer className="footer">
          <h3>Contact Health and Safety: healthandsafety@winchester.ac.uk</h3>
          &copy; {new Date().getFullYear()} My Website | All rights reserved.
        </footer>
    </>
  );
}

export default Register;
