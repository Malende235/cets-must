import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon, EnvelopeIcon, QuestionMarkCircleIcon, LightBulbIcon } from '@heroicons/react/24/outline';

const FAQs = [
  {
    q: 'How do I download my ticket after purchase?',
    a: 'Once your transaction is verified, you can find the QR ticket in the "My Tickets" section of your dashboard. You can screenshot it or download the PDF automatically.'
  },
  {
    q: 'What happens if my ticket scan fails?',
    a: 'If a QR scan fails in a well-lit area, the organizer can forcefully look up your Reference number attached below your ticket on their Verification dashboard.'
  },
  {
    q: 'How can I reach out for direct feature suggestions?',
    a: 'We always welcome thoughts! Feel free to shoot an email to our core team for immediate routing.'
  }
];

export default function Help() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12 animate-slide-up">
        
        {/* Header */}
        <div className="text-center bg-[#003366] rounded-3xl p-10 sm:p-16 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#154a84] rounded-full blur-3xl opacity-50 pointer-events-none" />
          <QuestionMarkCircleIcon className="w-16 h-16 mx-auto text-gold-400 mb-6 relative z-10" />
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 relative z-10">How can we help?</h1>
          <p className="text-primary-100 text-lg sm:text-xl relative z-10">
            Find answers to common questions or reach out directly to the team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* FAQ Accordion */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <LightBulbIcon className="w-6 h-6 text-gold-500" />
              Quick FAQs
            </h2>
            <div className="space-y-4">
              {FAQs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className={`border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 ${openFaq === idx ? 'bg-primary-50 border-primary-200' : 'bg-white hover:bg-gray-50'}`}
                >
                  <button 
                    className="w-full text-left px-5 py-4 font-semibold text-gray-900 flex justify-between items-center focus:outline-none"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    {faq.q}
                    <span className="text-gray-400 font-normal ml-2">{openFaq === idx ? '−' : '+'}</span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed font-medium animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-[#153448] rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none" />
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 relative z-10">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-gold-400" />
              Contact Support
            </h2>
            <p className="text-gray-300 mb-8 relative z-10 leading-relaxed">
              If an issue persists or you possess special administrative requests, please contact our lead developer. 
              We'll aim to analyze the issue and resolve it within 24 working hours.
            </p>

            <a 
              href="mailto:osmanmalende@gmail.com" 
              className="inline-flex items-center gap-3 bg-white text-[#153448] font-bold px-6 py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-lg active:scale-95 group relative z-10 w-full justify-center"
            >
              <EnvelopeIcon className="w-5 h-5 text-gray-400 group-hover:text-[#153448] transition-colors" />
              osmanmalende@gmail.com
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
