import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { PageSpinner } from '../../components/Spinner';
import { toast } from 'react-hot-toast';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback((p = 1) => {
    setLoading(true);
    api.get(`/audit-logs?page=${p}&limit=20`)
      .then(res => {
        setLogs(res.data.logs);
        setTotal(res.data.total);
        setPages(res.data.pages);
        setPage(p);
      })
      .catch(() => toast.error('Failed to load system audit logs'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Audit Logs</h1>
          <p className="text-gray-500 text-sm mt-1">Full platform activity history</p>
        </div>
        <button onClick={() => fetchLogs(page)} className="btn-outline btn-sm">Refresh</button>
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.logID}>
                  <td>
                    <div className="font-medium text-gray-900">{log.fullName}</div>
                    <div className="text-xs text-gray-500">{log.email}</div>
                  </td>
                  <td><span className="text-xs uppercase font-bold text-gray-400">{log.role}</span></td>
                  <td><span className="badge badge-blue">{log.action}</span></td>
                  <td className="font-mono text-xs">{log.ipAddress}</td>
                  <td className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => fetchLogs(page - 1)} disabled={page <= 1} className="btn-outline btn-sm">Prev</button>
          <span className="text-sm self-center">Page {page} of {pages}</span>
          <button onClick={() => fetchLogs(page + 1)} disabled={page >= pages} className="btn-outline btn-sm">Next</button>
        </div>
      )}
    </div>
  );
}
