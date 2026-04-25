import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import {
  CalendarDaysIcon, BellIcon, UserCircleIcon,
  Bars3Icon, XMarkIcon, TicketIcon
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const dashPath = user?.role === 'Administrator' ? '/admin'
    : user?.role === 'Organizer' ? '/organizer'
    : '/dashboard';

  return (
    <nav className="bg-primary-900 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
              <TicketIcon className="w-5 h-5 text-primary-900" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-white text-base">CETS</span>
              <span className="text-gold-400 font-medium text-base"> · Campus Events</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/events" className="text-primary-200 hover:text-white text-sm font-medium transition-colors">Events</Link>
            <Link to="/about" className="text-primary-200 hover:text-white text-sm font-medium transition-colors">About</Link>
            <Link to="/help" className="text-primary-200 hover:text-white text-sm font-medium transition-colors">Help</Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/notifications" className="relative text-primary-200 hover:text-white">
                  <BellIcon className="w-5 h-5" />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setDropOpen(o => !o)}
                    className="flex items-center gap-2 bg-primary-800 hover:bg-primary-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <div className="w-7 h-7 bg-gold-500 rounded-full flex items-center justify-center text-primary-900 font-bold text-xs">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium hidden lg:block">{user.fullName?.split(' ')[0]}</span>
                  </button>
                  {dropOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 animate-fade-in z-50">
                      <Link to={dashPath} onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <CalendarDaysIcon className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link to="/profile" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <UserCircleIcon className="w-4 h-4" /> Profile
                      </Link>
                      <hr className="my-1" />
                      <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-primary-200 hover:text-white transition-colors">Sign in</Link>
                <Link to="/register" className="btn-gold btn-sm">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-white" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary-800 border-t border-primary-700 px-4 py-4 space-y-2 animate-fade-in">
          <Link to="/events" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-primary-200 hover:text-white">Events</Link>
          {user ? (
            <>
              <Link to={dashPath} onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-primary-200 hover:text-white">Dashboard</Link>
              <button onClick={handleLogout} className="block py-2 text-sm text-red-400">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-primary-200 hover:text-white">Sign in</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gold-400">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
