import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { PageSpinner } from '../../components/Spinner';
import { MagnifyingGlassIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function Landing() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [filterCat]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/events', { params: { category: filterCat, search } });
      setEvents(data.events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Hero */}
      <div className="bg-primary-900 text-white pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-700 via-primary-900 to-primary-900 opacity-50"></div>
        <div className="max-w-7xl mx-auto relative z-10 lg:pl-8">
          <p className="text-gold-500 font-bold tracking-widest text-sm uppercase mb-4">University of Technology</p>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Discover & attend <br /> campus events
          </h1>
          <p className="text-primary-100 text-lg md:text-xl max-w-2xl mb-10">
            Browse seminars, sports days, cultural nights and club activities — buy your ticket in seconds.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            {['Academic', 'Sports', 'Cultural', 'Club Activity'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat === filterCat ? '' : cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  filterCat === cat ? 'bg-gold-500 text-primary-900' : 'bg-primary-800 text-white hover:bg-primary-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex max-w-2xl bg-white p-2 rounded-xl shadow-xl">
            <div className="flex-1 flex items-center px-4 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4" />
              <input
                type="text"
                placeholder="Search events by name or location..."
                className="w-full pl-8 pr-4 py-3 outline-none text-gray-800"
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary !px-8 !rounded-lg !py-3">Search</button>
          </form>
        </div>
      </div>

      {/* Stats overlap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 mb-12 hidden md:block">
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-b-4 border-gold-500">
            <h3 className="text-4xl font-bold text-primary-900 mb-1">120+</h3>
            <p className="text-sm text-gray-500">Events this semester</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-b-4 border-gold-500">
            <h3 className="text-4xl font-bold text-primary-900 mb-1">4,800</h3>
            <p className="text-sm text-gray-500">Students registered</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-b-4 border-gold-500 flex items-center justify-between">
             <div>
               <h3 className="text-xl font-bold text-primary-900 mb-1">Host an Event</h3>
               <p className="text-sm text-gray-500">Are you an organizer?</p>
             </div>
             <Link to="/register" className="btn-gold !px-6">Join</Link>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
          {filterCat && <span className="badge-blue text-sm px-3">{filterCat}</span>}
        </div>

        {loading ? <PageSpinner /> : (
          events.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500">No events found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => {
                const isSoldOut = event.ticketsSold >= event.totalCapacity;
                return (
                  <Link to={`/event/${event.eventID}`} key={event.eventID} className="group card-hover overflow-hidden flex flex-col">
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      {event.bannerImage ? (
                        <img src={`http://localhost:5000${event.bannerImage}`} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-800 to-primary-900 flex items-center justify-center">
                          <TicketIcon className="w-16 h-16 text-primary-700 opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className="badge bg-white/90 text-gray-900 shadow-sm backdrop-blur backdrop-filter px-3 py-1 font-bold">
                          {parseFloat(event.ticketPrice) === 0 ? 'FREE' : `UGX ${parseInt(event.ticketPrice).toLocaleString()}`}
                        </span>
                      </div>
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                          <span className="text-white font-extrabold text-2xl tracking-widest border-4 border-white px-6 py-2 rotate-[-5deg]">SOLD OUT</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="badge-gold">{event.categoryName}</span>
                        <span className="text-xs text-gray-500 font-medium">
                          {format(new Date(event.eventDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">{event.title}</h3>
                      <div className="space-y-1.5 mt-auto pt-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4 shrink-0 text-gray-400" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 shrink-0 text-gray-400" />
                          <span>{event.eventTime.slice(0,5)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
