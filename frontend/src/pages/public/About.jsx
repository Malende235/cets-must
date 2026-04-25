import React from 'react';
import { UserGroupIcon, AcademicCapIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function About() {
  const teamMembers = [
    { name: 'Muzoora Morris', regNo: '2024/BCS/229/PS', color: 'from-blue-500 to-cyan-500' },
    { name: 'Mubiru Usama Malende', regNo: '2024/BCS/103/PS', role: 'Lead Contact', color: 'from-gold-400 to-orange-500' },
    { name: 'Kamukama Joram Jothan', regNo: '2024/BCS/074/PS', color: 'from-purple-500 to-indigo-500' },
    { name: 'Asiimwe Shabellah', regNo: '2024/BCS/049/PS', color: 'from-pink-500 to-rose-500' },
    { name: 'Asaasira Leila', regNo: '2024/BCS/046/PS', color: 'from-emerald-500 to-teal-500' },
    { name: 'Mukundane Medard', regNo: '2024/BCS/110/PS', color: 'from-blue-600 to-blue-800' },
  ];

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto space-y-16 animate-fade-in">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-white border border-gray-100 shadow-xl rounded-2xl flex items-center justify-center mb-6">
            <AcademicCapIcon className="w-8 h-8 text-primary-900" />
          </div>
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-900 directly to-primary-600">
            About CETS
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            The Campus Event & Ticketing System (CETS) is a premier administrative tool crafted to modernize 
            and streamline how events, workshops, and gatherings are orchestrated within the university ecosystem.
          </p>
        </div>

        {/* The Team Section */}
        <div className="space-y-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <UserGroupIcon className="w-8 h-8 text-gold-500" />
              Meet The Developers
            </h2>
            <p className="text-gray-500 mt-2 text-sm">The brilliant minds behind this architecture.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, idx) => (
              <div 
                key={idx} 
                className="group relative bg-white overflow-hidden rounded-2xl shadow-card hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-gray-100"
              >
                {/* Micro animation gradient background */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${member.color} rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    {member.role && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-gold-100 text-gold-800 mb-2">
                        {member.role}
                      </span>
                    )}
                    <p className="text-sm font-mono text-gray-500 mt-2 bg-gray-50 inline-block px-2 py-1 rounded">
                      {member.regNo}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
