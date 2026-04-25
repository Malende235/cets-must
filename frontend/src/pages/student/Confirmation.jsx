import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircleIcon, ArrowDownTrayIcon, TicketIcon } from '@heroicons/react/24/outline';

export default function Confirmation() {
  const { state } = useLocation();
  const booking = state?.booking;

  if (!booking) return <Navigate to="/dashboard" replace />;

  const handleDownload = () => {
    window.location.href = `http://localhost:5000/api/tickets/${booking.ticket.ticketID}/pdf`;
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8 animate-slide-up">
      <div className="text-center">
         <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-green-50">
           <CheckCircleIcon className="w-12 h-12 text-green-500" />
         </div>
         <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Booking Confirmed!</h1>
         <p className="text-gray-500 text-lg">Your ticket has been sent to your email.</p>
      </div>

      <div className="card shadow-2xl rounded-2xl overflow-hidden border border-gray-100 bg-white transform transition-all">
        <div className="bg-[#003366] text-white p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#154a84] to-[#003366] opacity-60 pointer-events-none"></div>
          <div className="relative z-10 space-y-2">
            <h2 className="text-3xl font-bold font-mono tracking-widest text-[#FFB800] drop-shadow-md">
              {booking.bookingRef}
            </h2>
            <p className="text-primary-200 text-sm font-medium uppercase tracking-widest">Booking Reference</p>
          </div>
        </div>

        <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6 w-full">
            <div className="flex bg-gray-50 p-4 rounded-xl items-center gap-4 border border-gray-100">
               <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-primary-500 shrink-0">
                  <TicketIcon className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-0.5">Quantity</p>
                 <p className="font-bold text-gray-900">{booking.ticket.quantity} Ticket(s)</p>
               </div>
            </div>
            
            <button onClick={handleDownload} className="btn-primary w-full py-4 text-base shadow-lg shadow-primary-900/20 active:translate-y-1 rounded-xl">
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Download Ticket (PDF)
            </button>
            <Link to="/dashboard" className="btn-outline w-full py-3.5 border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl">
              Back to Dashboard
            </Link>
          </div>
          
          <div className="shrink-0 flex flex-col items-center p-6 bg-white rounded-2xl shadow-inner border border-gray-100">
            <img src={booking.qrCode} alt="Ticket QR" className="w-48 h-48 mix-blend-multiply" />
            <p className="text-xs font-medium text-gray-400 mt-4 uppercase tracking-widest">Scan at entrance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
