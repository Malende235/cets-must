import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon, CalendarDaysIcon, TicketIcon, BellIcon,
  UserGroupIcon, Cog6ToothIcon, ChartBarIcon,
  ClipboardDocumentListIcon, PlusCircleIcon,
  ArrowRightOnRectangleIcon, QuestionMarkCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

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
  const navigate = useNavigate();

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
    { to: '/organizer',         icon: HomeIcon,              label: 'Dashboard' },
    { to: '/organizer/events',  icon: CalendarDaysIcon,       label: 'My events' },
    { to: '/organizer/create',  icon: PlusCircleIcon,         label: 'Create event' },
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
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{user?.fullName}</p>
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
      </nav>

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
