import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PageSpinner } from '../../components/Spinner';
import { toast } from 'react-hot-toast';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function OrganizerReports() {
  const [eventsData, setEventsData]  = useState(null);
  const [salesData,  setSalesData]   = useState(null);
  const [loading,    setLoading]     = useState(true);
  const [from, setFrom]              = useState('');
  const [to,   setTo]                = useState('');

  const fetchReports = () => {
    setLoading(true);
    const params = from && to ? `?from=${from}&to=${to}` : '';
    Promise.all([
      api.get(`/reports/organizer/events${params}`),
      api.get(`/reports/organizer/sales${params}`),
    ])
      .then(([e, s]) => {
        setEventsData(e.data);
        setSalesData(s.data);
      })
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  if (loading) return <PageSpinner />;

  const { summary, events } = eventsData;
  const { salesByDay, summary: saleSummary } = salesData;

  const statusColors = { Upcoming: 'badge-blue', Ongoing: 'badge-green', Cancelled: 'badge-red', Completed: 'badge-gray' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Performance overview for your events</p>
        </div>
        {/* Date filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="input text-sm px-3 py-1.5" />
          <span className="text-gray-400 text-sm">to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="input text-sm px-3 py-1.5" />
          <button onClick={fetchReports} className="btn-primary btn-sm">Apply</button>
          {(from || to) && (
            <button onClick={() => { setFrom(''); setTo(''); setTimeout(fetchReports, 0); }}
              className="btn-outline btn-sm">Clear</button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase">Total Events</p>
          <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{summary.totalEvents}</h3>
        </div>
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase">Tickets Sold</p>
          <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{summary.totalTicketsSold}</h3>
        </div>
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase">Gross Revenue</p>
          <h3 className="text-2xl font-extrabold text-primary-700 mt-1">
            UGX {summary.totalRevenue.toLocaleString()}
          </h3>
        </div>
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase">Transactions</p>
          <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
            {parseInt(saleSummary?.totalTransactions || 0).toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Sales Trend Chart */}
      {salesByDay.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-5">Daily Revenue</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByDay}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2971ba" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2971ba" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }} dy={8} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }} dx={-8}
                  tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v) => [`UGX ${parseFloat(v).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#003366" strokeWidth={2.5}
                  fillOpacity={1} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tickets by Day Chart */}
      {salesByDay.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-5">Tickets Sold Per Day</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dx={-8} />
                <Tooltip
                  formatter={(v) => [v, 'Tickets']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="ticketsSold" fill="#2971ba" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Event Breakdown</h3>
          <span className="text-sm text-gray-500">{events.length} events</span>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
                <th>Tickets Sold</th>
                <th className="text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.eventID}>
                  <td className="font-semibold text-gray-900">{e.title}</td>
                  <td className="text-gray-500">{e.categoryName}</td>
                  <td className="text-gray-500">{new Date(e.eventDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${statusColors[e.status] || 'badge-gray'}`}>{e.status}</span>
                  </td>
                  <td>
                    <span className="font-medium">{e.ticketsSold}</span>
                    <span className="text-gray-400 text-xs"> / {e.totalCapacity}</span>
                  </td>
                  <td className="text-right font-semibold text-primary-700">
                    UGX {parseFloat(e.revenue || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan="6" className="text-center py-8 text-gray-400">No events in this period.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
