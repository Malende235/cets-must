import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PageSpinner } from '../../components/Spinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform-wide overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card bg-[#003366] text-white">
          <p className="text-xs font-bold text-primary-200 uppercase">Total Users</p>
          <h3 className="text-3xl font-extrabold">{stats.totalUsers}</h3>
        </div>
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase">Total Revenue</p>
          <h3 className="text-3xl font-extrabold text-gold-600">UGX {parseInt(stats.totalRevenue).toLocaleString()}</h3>
        </div>
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase">Active Events</p>
          <h3 className="text-3xl font-extrabold text-gray-900">{stats.activeEvents}</h3>
        </div>
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase">Active Tickets</p>
          <h3 className="text-3xl font-extrabold text-primary-600">{stats.activeTickets}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="card p-6 border border-gray-100 flex items-center bg-white shadow-sm">
            <div className="flex-1">
               <h3 className="font-bold text-lg mb-1">User Management</h3>
               <p className="text-sm text-gray-500">View, activate, and suspend user accounts.</p>
            </div>
            <a href="/admin/users" className="btn-outline">Manage</a>
         </div>
         <div className="card p-6 border border-gray-100 flex items-center bg-white shadow-sm">
            <div className="flex-1">
               <h3 className="font-bold text-lg mb-1">Event Moderation</h3>
               <p className="text-sm text-gray-500">Monitor all created events and cancel if necessary.</p>
            </div>
            <a href="/admin/events" className="btn-outline">Manage</a>
         </div>
         <div className="card p-6 border border-gray-100 flex items-center bg-white shadow-sm">
            <div className="flex-1">
               <h3 className="font-bold text-lg mb-1">System Reports</h3>
               <p className="text-sm text-gray-500">Generate analytics for sales, events, and users.</p>
            </div>
            <a href="/admin/reports" className="btn-outline">View Reports</a>
         </div>
         <div className="card p-6 border border-gray-100 flex items-center bg-white shadow-sm">
            <div className="flex-1">
               <h3 className="font-bold text-lg mb-1">Audit Logs</h3>
               <p className="text-sm text-gray-500">Track all platform actions securely.</p>
            </div>
            <a href="/admin/audit-logs" className="btn-outline">View Logs</a>
         </div>
      </div>
    </div>
  );
}
