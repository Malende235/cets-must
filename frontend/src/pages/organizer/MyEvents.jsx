import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { PageSpinner } from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import { toast } from 'react-hot-toast';

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEvents = () => {
    api.get('/events/my')
      .then(res => setEvents(res.data.events))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-500 text-sm mt-1">Manage events you have created</p>
        </div>
        <Link to="/organizer/create" className="btn-primary">+ Create New</Link>
      </div>

      {events.length === 0 ? (
        <EmptyState title="No events found" message="You haven't created any events yet." action={<Link to="/organizer/create" className="btn-primary">Create Event</Link>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Capacity</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.eventID}>
                    <td className="font-bold text-gray-900">{e.title}</td>
                    <td>{e.categoryName}</td>
                    <td>{new Date(e.eventDate).toLocaleDateString()} at {e.eventTime.slice(0,5)}</td>
                    <td><span className={`badge ${e.status === 'Upcoming' ? 'badge-blue' : e.status === 'Cancelled' ? 'badge-red' : 'badge-gray'}`}>{e.status}</span></td>
                    <td>{e.ticketsSold} / {e.totalCapacity}</td>
                    <td className="text-right space-x-2">
                       <button onClick={() => navigate(`/organizer/events/${e.eventID}/sales`)} className="text-sm font-medium text-primary-600 hover:underline">Sales</button>
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
