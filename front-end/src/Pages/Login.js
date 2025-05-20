import React, { useState } from 'react';

function Login() {
    const [formData, setFormData] = useState({ staffID: '', firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    const backEndURL = "https://warden-app-back-c2cfdhg8bnhwc4bj.uksouth-01.azurewebsites.net";

    const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const LoginSubmit = async (e) => {
        e.preventDefault();


        const response = await fetch(`${backEndURL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ staffID: formData.staffID, password: formData.password })
        });

        if(response.ok)
        {
            const userData = await response.json();
            console.log('User:', userData);
            if (userData.success) {
                console.log("User found, details received");
                localStorage.setItem('userData', JSON.stringify(userData.user)); 
                window.location.href = '/home';
            } else {
                alert('Invalid credentials');
            }
        } else {
            alert('Login failed. Please try again.');
        }
    }

    return (
        <>
            <h1 className="text-2xl font-bold"> Login </h1>

            <form onSubmit={LoginSubmit}>
                <label htmlFor="staffID">Staff Number:</label><br />
                <input type="text" id="staffID" name="staffID" required value={formData.staffID} onChange={handleChange}/><br/>

                <label htmlFor="password">Password:</label><br/>
                <input type="password" id="password" name="password" required value={formData.password} onChange={handleChange}/><br/>

                <button className="standard-button" type="submit" padding="10">Login</button>
                <button className="standard-button" type="button" padding="10" onClick={() => window.location.href = '/register'}>Register</button>
            </form>

            <footer className="footer">
            <h3>Contact Health and Safety: healthandsafety@winchester.ac.uk</h3>
            &copy; {new Date().getFullYear()} My Website | All rights reserved.
            </footer>
        </>
    );
}



export default Login;