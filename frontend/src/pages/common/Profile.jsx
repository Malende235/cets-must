import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { UserCircleIcon, IdentificationIcon, EnvelopeIcon, BriefcaseIcon, StarIcon } from '@heroicons/react/24/outline';
import { useRevenueCat } from '../../context/RevenueCatContext';

export default function Profile() {
  const { user } = useAuth();
  const { isPro, customerInfo } = useRevenueCat();
  const [loading, setLoading] = useState(false);

  // Fallback defaults if user somehow null
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    studentId: user?.role === 'Student' ? 'STU-MUST-2024' : 'N/A', // Mock student ID
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API settings update
    setTimeout(() => {
      toast.success('Profile settings updated successfully!');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your personal information and account preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Visual profile card */}
        <div className="md:col-span-1">
          <div className="card text-center p-6 bg-gradient-to-b from-white to-gray-50 flex flex-col items-center">
            <div className="w-24 h-24 bg-primary-900 rounded-full flex justify-center items-center text-white text-3xl font-extrabold shadow-inner border-4 border-white mb-4">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h3 className="font-bold text-gray-900 text-xl">{user?.fullName}</h3>
            <span className={`mt-2 badge ${user?.role === 'Administrator' ? 'badge-purple' : user?.role === 'Organizer' ? 'badge-gold' : 'badge-blue'} px-3 py-1 font-bold`}>
              {user?.role}
            </span>
            <div className="w-full mt-6 pt-6 border-t border-gray-200 space-y-4">
               <div>
                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-left mb-2">Account Status</p>
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium text-gray-700">Registration</span>
                   <span className="badge-green">Active</span>
                 </div>
               </div>

               <div>
                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-left mb-2">Membership</p>
                 <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="flex items-center gap-2">
                      <StarIcon className={`w-4 h-4 ${isPro ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                      <span className="text-sm font-bold text-blue-900">{isPro ? 'CETS Pro' : 'Free Member'}</span>
                    </div>
                    {isPro && <span className="text-[10px] text-blue-600 font-medium">Expires: {new Date(customerInfo?.entitlements?.active['cets Pro']?.expirationDate).toLocaleDateString()}</span>}
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Form settings */}
        <div className="md:col-span-2">
          <div className="card p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                <IdentificationIcon className="w-5 h-5 text-gray-400" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCircleIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      className="input pl-10" 
                      value={formData.fullName} 
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="label">Email Address (Read-only)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input 
                      type="email" 
                      className="input pl-10 bg-gray-50 text-gray-500 cursor-not-allowed" 
                      value={formData.email} 
                      disabled
                    />
                  </div>
                </div>
                
                {user?.role === 'Student' && (
                  <div className="space-y-1 md:col-span-2">
                    <label className="label">University ID / Registration</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BriefcaseIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        className="input pl-10" 
                        value={formData.studentId}
                        onChange={e => setFormData({...formData, studentId: e.target.value})}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Leave untouched unless your university ID has physically mutated.</p>
                  </div>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Saving preferences...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
