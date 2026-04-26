import { useState, useEffect } from 'react';
import api, { API_URL } from '../../api/axios';
import { PageSpinner } from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import { ArrowDownTrayIcon, XCircleIcon, TicketIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = () => {
    api.get('/tickets/my')
      .then(res => setTickets(res.data.tickets))
      .catch(() => toast.error('Failed to load tickets'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this ticket?')) return;
    try {
      await api.patch(`/tickets/${id}/cancel`);
      toast.success('Ticket cancelled');
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const statusBadge = (status) => {
    const colors = { Valid: 'badge-green', Used: 'badge-gray', Cancelled: 'badge-red', Refunded: 'badge-orange' };
    return <span className={colors[status] || 'badge-gray'}>{status}</span>;
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your purchased event tickets</p>
        </div>
      </div>

      {tickets.length === 0 ? (
        <EmptyState title="No tickets yet" message="You haven't bought any tickets. Browse upcoming events to get started!" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tickets.map(t => {
            const isFuture = new Date(t.eventDate) > new Date();
            const canCancel = isFuture && t.ticketStatus === 'Valid';
            return (
              <div key={t.ticketID} className="card overflow-hidden hover:shadow-lg transition-all flex flex-col group border-gray-200">
                <div className="p-5 flex-1 flex flex-col items-center text-center relative pointer-events-none">
                  {t.ticketStatus === 'Cancelled' && (
                     <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10" />
                  )}
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Booking Ref</p>
                  <p className="text-2xl font-mono font-extrabold text-[#003366] bg-gray-50 px-4 py-1.5 rounded-lg border border-gray-200 mb-6 shadow-sm">
                    {t.bookingReference}
                  </p>
                  <h3 className="font-bold text-lg text-gray-900 mb-1 leading-tight line-clamp-1">{t.eventTitle}</h3>
                  <p className="text-sm text-gray-500 font-medium mb-4">
                    {format(new Date(t.eventDate), 'MMM d, yyyy')} · {t.eventTime.slice(0,5)}
                  </p>
                  <div className="mt-auto">{statusBadge(t.ticketStatus)}</div>
                </div>

                <div className="px-5 py-3 bg-gray-50 border-t flex justify-between items-center gap-2 relative z-20 shadow-[inset_0_1px_0_rgba(255,255,255,1)]">
                  <span className="text-xs font-bold text-gray-500">{t.quantity} Ticket(s)</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.location.href = `${API_URL}/tickets/${t.ticketID}/pdf`}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-transparent hover:border-primary-100"
                      title="Download PDF"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(t.ticketID)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Cancel Ticket"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
