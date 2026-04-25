import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PageSpinner } from '../../components/Spinner';
import { toast } from 'react-hot-toast';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users', { params: { search } })
      .then(res => setUsers(res.data.users))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/users/${id}/status`, { accountStatus: status });
      toast.success('User status updated');
      setUsers(users.map(u => u.userID === id ? { ...u, accountStatus: status } : u));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-500 text-sm mt-1">Activate, suspend, or manage roles</p>
        </div>
        <form onSubmit={handleSearch} className="flex max-w-sm w-full">
          <input type="text" className="input rounded-r-none border-r-0" placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          <button type="submit" className="btn-primary rounded-l-none">Search</button>
        </form>
      </div>

      <div className="card overflow-hidden">
        {loading ? <PageSpinner /> : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name & Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.userID}>
                    <td>
                      <p className="font-bold text-gray-900">{u.fullName}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </td>
                    <td><span className={`badge ${u.role === 'Administrator' ? 'badge-purple' : u.role === 'Organizer' ? 'badge-gold' : 'badge-gray'}`}>{u.role}</span></td>
                    <td>{new Date(u.registrationDate).toLocaleDateString()}</td>
                    <td><span className={`badge ${u.accountStatus === 'Active' ? 'badge-green' : u.accountStatus === 'Suspended' ? 'badge-red' : 'badge-gray'}`}>{u.accountStatus}</span></td>
                    <td className="text-right">
                      {u.accountStatus === 'Suspended' ? (
                        <button onClick={() => updateStatus(u.userID, 'Active')} className="btn-sm btn-ghost text-green-600 hover:text-green-700">Activate</button>
                      ) : (
                        <button onClick={() => updateStatus(u.userID, 'Suspended')} className="btn-sm btn-ghost text-red-600 hover:text-red-700" disabled={u.role === 'Administrator'}>Suspend</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
