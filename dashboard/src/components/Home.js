import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import PrivateRoute from "./PrivateRoute";
import TopBar from "./TopBar";
import Dashboard from "./Dashboard";
import Menu from "./Menu";

const Home = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected route - Full Dashboard Layout */}
      <Route
        path="/dashboard/*"
        element={
          <PrivateRoute>
            <div className="app-container">
              <TopBar />
              <Menu />
              <Dashboard />
            </div>
          </PrivateRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default Home;