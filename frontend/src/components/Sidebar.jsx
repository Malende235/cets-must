import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon, CalendarDaysIcon, TicketIcon, BellIcon,
  UserGroupIcon, Cog6ToothIcon, ChartBarIcon,
  ClipboardDocumentListIcon, PlusCircleIcon,
  ArrowRightOnRectangleIcon, QuestionMarkCircleIcon,
  ShieldCheckIcon, RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { useRevenueCat } from '../context/RevenueCatContext';
import Paywall from './Paywall';
import { useState } from 'react';

const SideLink = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `sidebar-link ${isActive ? 'active' : ''}`
    }
  >
    <Icon className="w-4 h-4 shrink-0" />
    <span>{children}</span>
  </NavLink>
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isPro } = useRevenueCat();
  const navigate = useNavigate();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const studentLinks = [
    { to: '/dashboard',    icon: HomeIcon,              label: 'Dashboard' },
    { to: '/events',       icon: CalendarDaysIcon,       label: 'Browse events' },
    { to: '/my-tickets',   icon: TicketIcon,             label: 'My tickets' },
    { to: '/notifications',icon: BellIcon,               label: 'Notifications' },
  ];

  const organizerLinks = [
    { to: '/organizer',              icon: HomeIcon,                  label: 'Dashboard'    },
    { to: '/organizer/events',       icon: CalendarDaysIcon,          label: 'My events'    },
    { to: '/organizer/create',       icon: PlusCircleIcon,            label: 'Create event' },
    { to: '/organizer/reports',      icon: ChartBarIcon,              label: 'Reports'      },
    { to: '/organizer/audit-logs',   icon: ClipboardDocumentListIcon, label: 'Audit logs'   },
  ];

  const adminLinks = [
    { to: '/admin',             icon: HomeIcon,                    label: 'Dashboard' },
    { to: '/admin/users',       icon: UserGroupIcon,               label: 'Manage users' },
    { to: '/admin/events',      icon: CalendarDaysIcon,             label: 'Manage events' },
    { to: '/admin/reports',     icon: ChartBarIcon,                label: 'Reports' },
    { to: '/admin/audit-logs',  icon: ClipboardDocumentListIcon,   label: 'Audit logs' },
  ];

  const links = user?.role === 'Administrator' ? adminLinks
    : user?.role === 'Organizer' ? organizerLinks
    : studentLinks;

  return (
    <aside className="w-64 h-full min-h-full bg-white border-r border-gray-100 flex flex-col py-6 px-3 shrink-0">
      {/* User card */}
      <div className="px-3 mb-6">
        <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
          <div className="w-10 h-10 bg-primary-900 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-sm text-gray-900 truncate">{user?.fullName}</p>
              {isPro && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold tracking-tight">PRO</span>
              )}
            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Section label */}
      <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</p>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {links.map(({ to, icon, label }) => (
          <SideLink key={to} to={to} icon={icon}>{label}</SideLink>
        ))}

        <div className="mt-4 border-t pt-4 flex flex-col gap-0.5">
          <SideLink to="/profile" icon={Cog6ToothIcon}>Profile settings</SideLink>
          <SideLink to="/help" icon={QuestionMarkCircleIcon}>Help &amp; support</SideLink>
        </div>

        {!isPro && (
          <button 
            onClick={() => setShowPaywall(true)}
            className="mt-6 mx-3 flex items-center gap-2 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl text-blue-700 hover:from-blue-100 transition-all group"
          >
            <RocketLaunchIcon className="w-5 h-5 text-blue-600 animate-pulse" />
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wide">Upgrade</p>
              <p className="text-[10px] text-blue-600/80">Get CETS Pro features</p>
            </div>
          </button>
        )}
      </nav>

      <Paywall isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

      {/* Sign out */}
      <div className="pt-4 border-t">
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
