import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function CreateEvent() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', categoryID: '', eventDate: '', eventTime: '',
    location: '', ticketPrice: '0', totalCapacity: '100'
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/events/categories').then(res => {
      setCategories(res.data.categories);
      if (res.data.categories.length) setFormData(prev => ({ ...prev, categoryID: res.data.categories[0].categoryID }));
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (file) data.append('bannerImage', file);

    try {
      await api.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Event created successfully');
      navigate('/organizer/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to publish your event</p>
      </div>

      <div className="card p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Event Title</label>
            <input type="text" required className="input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g., Annual Tech Symposium" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Category</label>
              <select required className="input" value={formData.categoryID} onChange={e => setFormData({...formData, categoryID: e.target.value})}>
                {categories.map(c => <option key={c.categoryID} value={c.categoryID}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Location / Venue</label>
              <input type="text" required className="input" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g., Main Hall" />
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" required className="input" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} />
            </div>
            <div>
              <label className="label">Time</label>
              <input type="time" required className="input" value={formData.eventTime} onChange={e => setFormData({...formData, eventTime: e.target.value})} />
            </div>
            <div>
              <label className="label">Ticket Price (UGX)</label>
              <input type="number" min="0" required className="input" value={formData.ticketPrice} onChange={e => setFormData({...formData, ticketPrice: e.target.value})} placeholder="0 for free" />
            </div>
            <div>
              <label className="label">Total Capacity</label>
              <input type="number" min="1" required className="input" value={formData.totalCapacity} onChange={e => setFormData({...formData, totalCapacity: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="label">Event Description</label>
            <textarea required rows="4" className="input resize-none py-3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe what the event is about..."></textarea>
          </div>

          <div>
            <label className="label">Banner Image (Optional)</label>
            <input type="file" accept="image/*" className="input py-2" onChange={e => setFile(e.target.files[0])} />
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/organizer/events')} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary min-w-[120px]">
              {loading ? 'Publishing...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
