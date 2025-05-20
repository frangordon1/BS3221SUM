import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./Layout.css";

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the user data from localStorage
    localStorage.removeItem('userData');
    // Redirect to the Login page
    navigate('/');
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="logo-container">
          <img src="/resources/logo.png" alt="Logo" className="logo" />
        </div>
        <nav className="nav-links">
          <NavLink to="/home" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Home
          </NavLink>
          <NavLink to="/wardens" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Wardens
          </NavLink>
          <NavLink to="/myuser" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            My User
          </NavLink>
          <button className="logoutButton" onClick={handleLogout}>
          Logout
          </button>
        </nav>
      </aside>

      <div className="main-content">
        <main className="page-content">
          <Outlet />
        </main>
        <footer className="footer">
          <h3>Contact Health and Safety: healthandsafety@winchester.ac.uk</h3>
          &copy; {new Date().getFullYear()} My Website | All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Layout;



