import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import { format } from 'date-fns';
import { CalendarIcon, TicketIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tickets: 0, notifications: 0 });
  const [upcomingTickets, setUpcomingTickets] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tickets/my?limit=5'),
      api.get('/events?limit=5'),
      api.get('/notifications/my')
    ]).then(([t, e, n]) => {
      setUpcomingTickets(t.data.tickets.filter(t => new Date(t.eventDate) >= new Date() && t.ticketStatus === 'Valid'));
      setStats({ tickets: t.data.total, notifications: n.data.notifications.filter(x => !x.isRead).length });
      setUpcomingEvents(e.data.events);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-primary-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex justify-between items-center">
        <div className="relative z-10 w-full sm:w-2/3">
          <p className="text-primary-200 mb-1">Good morning,</p>
          <h1 className="text-3xl font-bold mb-2">{user?.fullName}</h1>
          <p className="text-primary-100 text-sm">{user?.email}</p>
        </div>
        <div className="hidden sm:flex flex-col items-end z-10">
          <Link to="/events" className="btn-gold shadow-lg shadow-gold-500/20">
            + Book a ticket
          </Link>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-primary-800 to-transparent pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Upcoming Events</p>
          <h3 className="text-3xl font-extrabold text-primary-600">{upcomingEvents.length}</h3>
          <p className="text-sm text-gray-500 font-medium">Available now</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">My Tickets</p>
          <h3 className="text-3xl font-extrabold text-gray-900">{stats.tickets}</h3>
          <p className="text-sm text-gray-500 font-medium">All time</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Notifications</p>
          <h3 className="text-3xl font-extrabold text-gold-600">{stats.notifications}</h3>
          <p className="text-sm text-gray-500 font-medium">Unread</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Your Next Ticket</h2>
          {upcomingTickets.length > 0 ? (
            <div className="bg-[#153448] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-6">
              <div className="flex-1 z-10 border-r border-white/20 pr-6">
                <h3 className="text-2xl font-bold mb-1">{upcomingTickets[0].eventTitle}</h3>
                <p className="text-primary-200 text-sm mb-6 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {format(new Date(upcomingTickets[0].eventDate), 'EEEE, dd MMM yyyy')} · {upcomingTickets[0].eventTime.slice(0,5)}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm mt-auto">
                  <div>
                    <p className="text-primary-300 font-medium mb-0.5 text-xs uppercase tracking-wider">Venue</p>
                    <p className="font-semibold">{upcomingTickets[0].location}</p>
                  </div>
                  <div>
                    <p className="text-primary-300 font-medium mb-0.5 text-xs uppercase tracking-wider">Ref</p>
                    <p className="font-semibold font-mono bg-white/10 inline-block px-2 py-0.5 rounded">{upcomingTickets[0].bookingReference}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl z-10 shrink-0">
                <img src={upcomingTickets[0].qrCode} alt="QR Code" className="w-24 h-24" />
              </div>
            </div>
          ) : (
            <EmptyState title="No upcoming tickets" message="You don't have any valid tickets for upcoming events." action={<Link to="/events" className="btn-outline">Browse events</Link>} />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <h2 className="text-lg font-bold text-gray-900">Upcoming events</h2>
             <Link to="/events" className="text-sm font-medium text-primary-600 hover:text-primary-800">View all</Link>
          </div>
          <div className="card divide-y border-0 shadow-lg">
            {upcomingEvents.slice(0, 3).map(event => (
              <div key={event.eventID} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors group">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex flex-col items-center justify-center shrink-0 border border-gray-200 shadow-sm group-hover:bg-primary-50 group-hover:border-primary-100 group-hover:text-primary-700 transition-colors">
                  <span className="text-xs font-bold uppercase text-gray-500">{format(new Date(event.eventDate), 'MMM')}</span>
                  <span className="text-lg font-extrabold leading-none">{format(new Date(event.eventDate), 'dd')}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-900 truncate mb-1">{event.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge-gray text-[10px] uppercase font-bold">{event.categoryName}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${parseFloat(event.ticketPrice) === 0 ? 'bg-green-100 text-green-700' : 'bg-gold-100 text-gold-900'}`}>
                      {parseFloat(event.ticketPrice) === 0 ? 'Free' : `UGX ${parseInt(event.ticketPrice).toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
