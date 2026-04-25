import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { PageSpinner } from '../../components/Spinner';
import { toast } from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalesDashboard() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/events/${id}`),
      api.get(`/tickets/event/${id}?limit=100`)
    ]).then(([e, t]) => {
      setEvent(e.data.event);
      setTickets(t.data.tickets);
    }).catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSpinner />;
  if (!event) return <div>Event not found</div>;

  // Process data for chart
  const salesByDate = tickets.reduce((acc, ticket) => {
    if (ticket.ticketStatus !== 'Valid') return acc;
    const date = new Date(ticket.purchaseTimestamp).toLocaleDateString();
    acc[date] = (acc[date] || 0) + ticket.quantity;
    return acc;
  }, {});

  const chartData = Object.keys(salesByDate).map(date => ({ date, tickets: salesByDate[date] })).reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
           <Link to="/organizer/events" className="text-sm text-primary-600 hover:underline mb-1 inline-block">← Back to events</Link>
           <h1 className="text-2xl font-bold text-gray-900">{event.title} - Sales</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase">Tickets Sold</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-extrabold text-gray-900">{event.ticketsSold}</h3>
            <span className="text-gray-500 mb-1 font-medium">/ {event.totalCapacity} capacity</span>
          </div>
        </div>
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase">Gross Revenue</p>
          <h3 className="text-3xl font-extrabold text-gold-600">
            UGX {(parseInt(event.ticketsSold) * parseInt(event.ticketPrice)).toLocaleString()}
          </h3>
        </div>
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase">Status</p>
          <div className="mt-1">
             <span className={`badge lg:px-4 lg:py-1 ${event.status === 'Upcoming' ? 'badge-blue' : event.status === 'Cancelled' ? 'badge-red' : 'badge-gray'}`}>{event.status}</span>
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold mb-6">Sales Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2971ba" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2971ba" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="tickets" stroke="#003366" strokeWidth={3} fillOpacity={1} fill="url(#colorTickets)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900">Recent Purchasers</h3>
          <button className="btn-outline btn-sm">Export CSV</button>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Attendee</th>
                <th>Booking Ref</th>
                <th>Status</th>
                <th>Qty</th>
                <th>Purchase Date</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.ticketID}>
                  <td>
                    <p className="font-medium text-gray-900">{t.fullName}</p>
                    <p className="text-xs text-gray-500">{t.email}</p>
                  </td>
                  <td className="font-mono">{t.bookingReference}</td>
                  <td><span className={`badge ${t.ticketStatus === 'Valid' ? 'badge-green' : t.ticketStatus === 'Cancelled' ? 'badge-red' : 'badge-gray'}`}>{t.ticketStatus}</span></td>
                  <td>{t.quantity}</td>
                  <td className="text-gray-500">{new Date(t.purchaseTimestamp).toLocaleString()}</td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr><td colSpan="5" className="text-center py-6 text-gray-500">No tickets sold yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
