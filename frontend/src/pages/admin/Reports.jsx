import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PageSpinner } from '../../components/Spinner';
import { toast } from 'react-hot-toast';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminReports() {
  const [eventsData, setEventsData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [usersData, setUsersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetchReports = () => {
    setLoading(true);
    const params = from && to ? `?from=${from}&to=${to}` : '';
    Promise.all([
      api.get(`/reports/events${params}`),
      api.get(`/reports/sales${params}`),
      api.get(`/reports/users${params}`)
    ])
      .then(([e, s, u]) => {
        setEventsData(e.data);
        setSalesData(s.data);
        setUsersData(u.data);
      })
      .catch(() => toast.error('Failed to load system reports'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  if (loading) return <PageSpinner />;

  const { summary: eventSummary, events } = eventsData;
  const { salesByDay, summary: saleSummary } = salesData;
  const { byRoleAndStatus } = usersData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Platform-wide performance and growth metrics</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input text-sm px-3 py-1.5" />
          <span className="text-gray-400 text-sm">to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input text-sm px-3 py-1.5" />
          <button onClick={fetchReports} className="btn-primary btn-sm">Apply</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase">Total Revenue</p>
          <h3 className="text-2xl font-extrabold text-primary-700 mt-1">UGX {parseFloat(saleSummary.totalRevenue || 0).toLocaleString()}</h3>
        </div>
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase">Total Tickets</p>
          <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{saleSummary.totalTickets || 0}</h3>
        </div>
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase">Active Events</p>
          <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{eventSummary.totalEvents}</h3>
        </div>
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase">Transactions</p>
          <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{saleSummary.totalTransactions || 0}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-5">Revenue Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#2971ba" fill="#2971ba33" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-5">User Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byRoleAndStatus} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={80} label>
                  {byRoleAndStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-bold text-gray-900">Event Performance</h3>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Organizer</th>
                <th>Status</th>
                <th>Sold</th>
                <th className="text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.eventID}>
                  <td className="font-medium">{e.title}</td>
                  <td className="text-sm text-gray-500">{e.organizerName}</td>
                  <td><span className="badge badge-gray">{e.status}</span></td>
                  <td>{e.ticketsSold} / {e.totalCapacity}</td>
                  <td className="text-right font-bold">UGX {parseFloat(e.revenue).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
