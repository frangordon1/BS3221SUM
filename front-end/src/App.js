import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Pages/Layout';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Home from './Pages/Home';
import Wardens from './Pages/Wardens';
import MyUser from './Pages/MyUser';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="register" element={<Register />} />


        <Route path="/" element={<Layout />}>
          <Route path="home" element={<Home />} />
          <Route path="wardens" element={<Wardens />} />
          <Route path="myuser" element={<MyUser />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
