import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Loader from './components/ui/Loader';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import Browse from './pages/Browse';
import ListingDetail from './pages/ListingDetail';
import OwnerDashboard from './pages/OwnerDashboard';
import PostListing from './pages/PostListing';
import Interests from './pages/Interests';
import ChatPage from './pages/ChatPage';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  const { loading } = useAuth();

  if (loading) return <Loader label="Starting FlatMatch" />;

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      <Route
        path="/browse"
        element={
          <ProtectedRoute roles={['tenant']}>
            <AppLayout>
              <Browse />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/listing/:id"
        element={
          <ProtectedRoute roles={['tenant', 'owner', 'admin']}>
            <AppLayout>
              <ListingDetail />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner"
        element={
          <ProtectedRoute roles={['owner']}>
            <AppLayout>
              <OwnerDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/new"
        element={
          <ProtectedRoute roles={['owner']}>
            <AppLayout>
              <PostListing />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/interests"
        element={
          <ProtectedRoute roles={['tenant', 'owner']}>
            <AppLayout>
              <Interests />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:interestId"
        element={
          <ProtectedRoute roles={['tenant', 'owner']}>
            <AppLayout>
              <ChatPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute roles={['tenant', 'owner', 'admin']}>
            <AppLayout>
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout>
              <AdminDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}