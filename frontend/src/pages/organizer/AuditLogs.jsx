import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { PageSpinner } from '../../components/Spinner';
import { toast } from 'react-hot-toast';

const ACTION_LABELS = {
  CREATE_EVENT:  { label: 'Created Event',   cls: 'badge-green' },
  UPDATE_EVENT:  { label: 'Updated Event',   cls: 'badge-blue'  },
  CANCEL_EVENT:  { label: 'Cancelled Event', cls: 'badge-red'   },
  DELETE_EVENT:  { label: 'Deleted Event',   cls: 'badge-red'   },
};

export default function OrganizerAuditLogs() {
  const [logs,    setLogs]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback((p = 1) => {
    setLoading(true);
    api.get(`/organizer/audit-logs?page=${p}&limit=15`)
      .then(res => {
        setLogs(res.data.logs);
        setTotal(res.data.total);
        setPages(res.data.pages);
        setPage(p);
      })
      .catch(() => toast.error('Failed to load activity logs'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  const parseDetails = (raw) => {
    try {
      const d = JSON.parse(raw);
      return d?.body?.title || d?.params?.id || '';
    } catch { return ''; }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} action{total !== 1 ? 's' : ''} recorded for your account
          </p>
        </div>
        <button onClick={() => fetchLogs(page)} className="btn-outline btn-sm">↻ Refresh</button>
      </div>

      {loading ? (
        <PageSpinner />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Detail</th>
                    <th>IP Address</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => {
                    const meta = ACTION_LABELS[log.action] || { label: log.action, cls: 'badge-gray' };
                    const detail = parseDetails(log.details);
                    return (
                      <tr key={log.logID}>
                        <td>
                          <span className={`badge ${meta.cls}`}>{meta.label}</span>
                        </td>
                        <td className="text-gray-600 text-sm max-w-xs truncate">
                          {detail || <span className="text-gray-300 italic">—</span>}
                        </td>
                        <td className="font-mono text-xs text-gray-400">{log.ipAddress || '—'}</td>
                        <td className="text-gray-500 text-sm whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-12 text-gray-400">
                        No activity recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => fetchLogs(page - 1)}
                disabled={page <= 1}
                className="btn-outline btn-sm disabled:opacity-40"
              >← Prev</button>
              <span className="text-sm text-gray-500">Page {page} of {pages}</span>
              <button
                onClick={() => fetchLogs(page + 1)}
                disabled={page >= pages}
                className="btn-outline btn-sm disabled:opacity-40"
              >Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
