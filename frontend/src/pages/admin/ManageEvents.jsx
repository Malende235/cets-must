import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PageSpinner } from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import { toast } from 'react-hot-toast';

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = () => {
    api.get('/events?status=all&limit=100')
      .then(res => setEvents(res.data.events))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This action is irreversible.')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      fetchEvents();
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage all events on the platform</p>
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState title="No events found" message="There are no events registered in the system." />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Organizer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Sales</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.eventID}>
                    <td className="font-bold text-gray-900">{e.title}</td>
                    <td className="text-sm">{e.organizerName}</td>
                    <td className="text-sm">{new Date(e.eventDate).toLocaleDateString()}</td>
                    <td><span className={`badge ${e.status === 'Upcoming' ? 'badge-blue' : e.status === 'Cancelled' ? 'badge-red' : 'badge-gray'}`}>{e.status}</span></td>
                    <td className="text-sm">{e.ticketsSold} / {e.totalCapacity}</td>
                    <td className="text-right">
                       <button onClick={() => handleDelete(e.eventID)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
