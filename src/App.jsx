import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import Map from './components/Map';
import './App.css';
import { Analytics } from "@vercel/analytics/react";
import { VisualizerProvider } from './context/VisualizerContext';
import authService from './services/authService';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <VisualizerProvider>
          <Analytics />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <div className="app">
                    <Map />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* Default route */}
            <Route 
              path="*" 
              element={
                authService.isAuthenticated() ? 
                  <Navigate to="/dashboard" replace /> : 
                  <Navigate to="/login" replace />
              } 
            />
          </Routes>
        </VisualizerProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;