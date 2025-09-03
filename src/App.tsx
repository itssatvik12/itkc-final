import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import InstitutionDashboard from './pages/InstitutionDashboard';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { userData } = useAuth();
  
  if (!userData) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(userData.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Dashboard Redirect Component
const DashboardRedirect: React.FC = () => {
  const { userData } = useAuth();
  
  console.log('DashboardRedirect - userData:', userData); // Debug log
  
  if (!userData) {
    return <Navigate to="/login" replace />;
  }
  
  switch (userData.role) {
    case 'admin':
      console.log('Redirecting to admin dashboard');
      return <Navigate to="/admin-dashboard" replace />;
    case 'student':
      console.log('Redirecting to student dashboard');
      return <Navigate to="/student-dashboard" replace />;
    case 'institution':
      console.log('Redirecting to institution dashboard');
      return <Navigate to="/institution-dashboard" replace />;
    default:
      console.log('Unknown role, redirecting to home');
      return <Navigate to="/" replace />;
  }
};

// Main App Component
const AppContent: React.FC = () => {
  const { userData } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={userData ? <Navigate to="/" replace /> : <Login />} 
          />
          <Route 
            path="/signup" 
            element={userData ? <Navigate to="/" replace /> : <Signup />} 
          />
          <Route 
            path="/dashboard" 
            element={<DashboardRedirect />} 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/institution-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['institution']}>
                <InstitutionDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;