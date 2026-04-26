import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { BASE_URL } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/Spinner';
import { format } from 'date-fns';
import {
  MapPinIcon, CalendarIcon, ClockIcon, UserIcon,
  TagIcon, ArrowLeftIcon, TicketIcon
} from '@heroicons/react/24/outline';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(res => setEvent(res.data.event))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mt-20"><PageSpinner /></div>;
  if (!event) return <div className="text-center py-20 text-xl font-medium">Event not found</div>;

  const isSoldOut = event.ticketsSold >= event.totalCapacity;
  const isFree = parseFloat(event.ticketPrice) === 0;

  const handleBuyClick = () => {
    if (!user) navigate('/login', { state: { from: `/event/${id}` } });
    else navigate(`/purchase/${id}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeftIcon className="w-4 h-4" /> Back to events
      </Link>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="h-64 sm:h-96 w-full relative bg-gray-100">
          {event.bannerImage ? (
             <img src={`${BASE_URL}${event.bannerImage}`} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-800 to-primary-900 flex items-center justify-center">
              <TicketIcon className="w-32 h-32 text-primary-700 opacity-30" />
            </div>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10">
              <span className="text-white font-extrabold text-4xl tracking-widest border-4 border-white px-8 py-3 rotate-[-5deg] shadow-2xl">SOLD OUT</span>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-10 lg:flex gap-12">
          {/* Main info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="badge-gold px-3 py-1 text-sm">{event.categoryName}</span>
              <span className={`badge ${event.status === 'Upcoming' ? 'badge-blue' : 'badge-gray'} text-sm`}>
                {event.status}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">{event.title}</h1>

            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap mb-10">
              {event.description || 'No description provided.'}
            </div>

            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Organizer Details</h3>
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8 sm:mb-0">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-900 font-bold text-lg">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{event.organizerName}</p>
                <p className="text-sm text-gray-500">Event Organizer</p>
              </div>
            </div>
          </div>

          {/* Sticky sidebar / CTA */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 card p-6 bg-white border-primary-100 border shadow-xl shadow-primary-900/5">
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-1">Ticket Price</p>
                <p className="text-3xl font-extrabold text-primary-900">
                  {isFree ? 'Free' : `UGX ${parseInt(event.ticketPrice).toLocaleString()}`}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{format(new Date(event.eventDate), 'EEEE, MMMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{event.eventTime.slice(0,5)} EAT</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{event.location}</p>
                  </div>
                </div>
              </div>

              {/* Progress bar for capacity */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span className="text-gray-600">Availability</span>
                  <span className={isSoldOut ? 'text-red-500' : 'text-primary-600'}>
                    {event.totalCapacity - event.ticketsSold} left
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${isSoldOut ? 'bg-red-500' : 'bg-primary-500'}`}
                    style={{ width: `${Math.min(100, (event.ticketsSold / event.totalCapacity) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={handleBuyClick}
                disabled={isSoldOut || event.status !== 'Upcoming'}
                className={`w-full py-3.5 text-base rounded-xl font-bold transition-all shadow-lg text-white ${
                  isSoldOut || event.status !== 'Upcoming'
                    ? 'bg-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-primary-900 hover:bg-primary-800 hover:shadow-primary-900/30 hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {event.status !== 'Upcoming' ? 'Event Closed' : isSoldOut ? 'Sold Out' : user ? 'Book Ticket Now' : 'Login to Buy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
