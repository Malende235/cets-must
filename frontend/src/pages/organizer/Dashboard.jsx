import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { PageSpinner } from '../../components/Spinner';

export default function OrganizerDashboard() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/organizer/stats'),
      api.get('/events/my?limit=5')
    ]).then(([s, e]) => {
      setStats(s.data);
      setEvents(e.data.events);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizer Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your events and track ticket sales</p>
        </div>
        <Link to="/organizer/create" className="btn-primary">Create Event</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase">Total Events</p>
          <h3 className="text-3xl font-extrabold text-gray-900">{stats.totalEvents}</h3>
        </div>
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase">Active Events</p>
          <h3 className="text-3xl font-extrabold text-green-600">{stats.activeEvents}</h3>
        </div>
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase">Tickets Sold</p>
          <h3 className="text-3xl font-extrabold text-primary-600">{stats.totalTicketsSold}</h3>
        </div>
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase">Revenue</p>
          <h3 className="text-3xl font-extrabold text-gold-600">
            UGX {parseInt(stats.totalRevenue).toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-900">Recent Events</h2>
          <Link to="/organizer/events" className="text-primary-600 text-sm font-medium hover:underline">View all</Link>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Status</th>
                <th>Sales</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.eventID}>
                  <td className="font-medium text-gray-900">{e.title}</td>
                  <td>{new Date(e.eventDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${e.status === 'Upcoming' ? 'badge-blue' : e.status === 'Cancelled' ? 'badge-red' : 'badge-gray'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-16">
                         <div className="h-1.5 bg-primary-500 rounded-full" style={{ width: `${(e.ticketsSold/e.totalCapacity)*100}%` }}></div>
                       </div>
                       <span className="text-xs font-medium">{e.ticketsSold}/{e.totalCapacity}</span>
                    </div>
                  </td>
                  <td>
                    <Link to={`/organizer/events/${e.eventID}/sales`} className="text-primary-600 font-medium hover:text-primary-800 text-sm">Dashboard</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && <div className="text-center py-8 text-gray-500">No events yet.</div>}
        </div>
      </div>
    </div>
  );
}
