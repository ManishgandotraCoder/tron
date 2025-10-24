import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AIDashboard from './pages/aidashboard';
import { ProfileDashboard, Layout } from './components';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './pages/register';
import LoginPage from './pages/login';
import './index.css'

export default function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Auth pages without header */}
          <Route
            path="/login"
            element={
              <Layout showHeader={false}>
                <LoginPage />
              </Layout>
            }
          />
          <Route
            path="/register"
            element={
              <Layout showHeader={false}>
                <RegisterPage />
              </Layout>
            }
          />

          {/* Protected pages with header */}
          <Route
            path="/profile"
            element={
              <Layout>
                <ProtectedRoute>
                  <ProfileDashboard />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/"
            element={
              <Layout>
                <ProtectedRoute>
                  <AIDashboard />
                </ProtectedRoute>
              </Layout>
            }
          />
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}