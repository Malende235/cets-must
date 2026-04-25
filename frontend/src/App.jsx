import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoute';

// Layouts
import DashboardLayout from './components/DashboardLayout';
import Navbar from './components/Navbar';

// Public Pages
import Landing from './pages/public/Landing';
import EventDetail from './pages/public/EventDetail';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import About from './pages/public/About';
import Help from './pages/public/Help';
import Profile from './pages/common/Profile';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import Purchase from './pages/student/Purchase';
import Confirmation from './pages/student/Confirmation';
import MyTickets from './pages/student/MyTickets';

// Organizer Pages
import OrganizerDashboard from './pages/organizer/Dashboard';
import MyEvents from './pages/organizer/MyEvents';
import CreateEvent from './pages/organizer/CreateEvent';
import SalesDashboard from './pages/organizer/SalesDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
          <Route path="/events" element={<PublicLayout><Landing /></PublicLayout>} />
          <Route path="/event/:id" element={<PublicLayout><EventDetail /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/help" element={<PublicLayout><Help /></PublicLayout>} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes (Dashboard Layout) */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            {/* Student */}
            <Route path="/dashboard" element={<RoleRoute roles={['Student']}><StudentDashboard /></RoleRoute>} />
            <Route path="/purchase/:id" element={<RoleRoute roles={['Student']}><Purchase /></RoleRoute>} />
            <Route path="/confirmation" element={<RoleRoute roles={['Student']}><Confirmation /></RoleRoute>} />
            <Route path="/my-tickets" element={<RoleRoute roles={['Student']}><MyTickets /></RoleRoute>} />

            {/* Organizer */}
            <Route path="/organizer" element={<RoleRoute roles={['Organizer', 'Administrator']}><OrganizerDashboard /></RoleRoute>} />
            <Route path="/organizer/events" element={<RoleRoute roles={['Organizer', 'Administrator']}><MyEvents /></RoleRoute>} />
            <Route path="/organizer/create" element={<RoleRoute roles={['Organizer', 'Administrator']}><CreateEvent /></RoleRoute>} />
            <Route path="/organizer/events/:id/sales" element={<RoleRoute roles={['Organizer', 'Administrator']}><SalesDashboard /></RoleRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<RoleRoute roles={['Administrator']}><AdminDashboard /></RoleRoute>} />
            <Route path="/admin/users" element={<RoleRoute roles={['Administrator']}><ManageUsers /></RoleRoute>} />
            
            {/* Catch-all for protected */}
            <Route path="/notifications" element={<div className="p-8 text-center">Notifications coming soon</div>} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
