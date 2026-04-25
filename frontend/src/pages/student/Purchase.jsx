import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { PageSpinner } from '../../components/Spinner';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { CheckCircleIcon, CreditCardIcon, DevicePhoneMobileIcon, WalletIcon } from '@heroicons/react/24/outline';

export default function PurchaseTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Step 1: Select
  const [quantity, setQuantity] = useState(1);
  // Step 2: Payment
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(res => setEvent(res.data.event))
      .catch(() => toast.error('Failed to load event'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSpinner />;
  if (!event) return <div>Event not found</div>;

  const isFree = parseFloat(event.ticketPrice) === 0;
  const totalPrice = parseFloat(event.ticketPrice) * quantity;
  const serviceFee = isFree ? 0 : 200 * quantity;
  const grandTotal = totalPrice + serviceFee;

  const handlePayment = async () => {
    if (!paymentMethod && !isFree) return toast.error('Select a payment method');
    setProcessing(true);
    try {
      const { data } = await api.post('/tickets/purchase', {
        eventID: id, quantity, paymentMethod: isFree ? 'Wallet' : paymentMethod
      });
      navigate('/confirmation', { state: { booking: data } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Stepper */}
      <div className="flex items-center mb-8 text-sm font-medium">
        <div className="flex items-center text-primary-600">
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center mr-2 shadow-md">
            <CheckCircleIcon className="w-5 h-5" />
          </div>
          Select
        </div>
        <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
        <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 shadow-sm border-2 ${step >= 2 ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300'}`}>
            2
          </div>
          Payment
        </div>
        <div className={`flex-1 h-0.5 mx-4 bg-gray-200`} />
        <div className={`flex items-center text-gray-400`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 shadow-sm border-2 border-gray-300`}>
            3
          </div>
          Confirm
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Event Card */}
          <div className="card p-6 flex flex-col sm:flex-row items-center gap-6 border-transparent ring-1 ring-gray-200 shadow-lg">
            <div className="w-20 h-20 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
               <span className="text-3xl">🎫</span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h2>
              <p className="text-gray-500 text-sm">
                {format(new Date(event.eventDate), 'EEE dd MMM yyyy')} · {event.eventTime.slice(0,5)} · {event.location}
              </p>
            </div>
            <div className="text-center sm:text-right">
               <p className="text-2xl font-extrabold text-primary-900">{isFree ? 'Free' : `UGX ${parseInt(event.ticketPrice).toLocaleString()}`}</p>
               <p className="text-xs font-semibold text-gray-400 uppercase">per ticket</p>
            </div>
          </div>

          {step === 1 && (
            <div className="card p-6 shadow-md border-transparent ring-1 ring-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Ticket quantity</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center border rounded-lg bg-gray-50 shadow-inner">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-gray-200 rounded-l-lg transition-colors font-bold text-lg text-gray-700">-</button>
                  <span className="px-6 py-2 bg-white font-bold text-lg w-16 text-center border-x">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(5, quantity + 1))} className="px-4 py-2 hover:bg-gray-200 rounded-r-lg transition-colors font-bold text-lg text-gray-700">+</button>
                </div>
                <div className="text-right">
                  <span className="badge-green text-sm px-3 py-1">{event.totalCapacity - event.ticketsSold} seats left</span>
                  <p className="text-xs text-gray-500 mt-2 font-medium">Max 5 tickets per student</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && !isFree && (
            <div className="card p-6 shadow-md border-transparent ring-1 ring-gray-200 animate-fade-in">
              <h3 className="font-bold text-gray-900 mb-4">Payment method</h3>
              <div className="space-y-3">
                {[
                  { id: 'Card', label: 'Debit / Credit card', icon: CreditCardIcon, tag: 'VISA' },
                  { id: 'Mobile Money', label: 'Mobile Money', icon: DevicePhoneMobileIcon, tag: 'MTN / Airtel' },
                  { id: 'Wallet', label: 'Campus Wallet', icon: WalletIcon, tag: 'CETS' },
                ].map(m => (
                  <label key={m.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === m.id ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600 shadow-[inset_0_0_0_1px_rgba(41,113,186,0.2)]' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'}`}>
                    <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500" />
                    <div className="ml-4 flex-1 flex items-center gap-3">
                      <m.icon className={`w-6 h-6 ${paymentMethod === m.id ? 'text-primary-700' : 'text-gray-400'}`} />
                      <span className="font-semibold text-gray-900">{m.label}</span>
                    </div>
                    <span className="badge-blue font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider">{m.tag}</span>
                  </label>
                ))}
              </div>
              
              {paymentMethod === 'Card' && (
                <div className="mt-6 pt-6 border-t space-y-4 animate-fade-in">
                  <div>
                    <label className="label text-xs uppercase tracking-wider font-bold">Card number</label>
                    <input type="text" className="input font-mono shadow-sm" placeholder="4242  4242  4242  4242" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label text-xs uppercase tracking-wider font-bold">Expiry date</label>
                      <input type="text" className="input font-mono shadow-sm" placeholder="MM / YY" />
                    </div>
                    <div>
                      <label className="label text-xs uppercase tracking-wider font-bold">CVV</label>
                      <input type="password" className="input font-mono shadow-sm" placeholder="•••" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-6 sticky top-24 bg-white shadow-xl ring-1 ring-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 pb-4 border-b">Order summary</h3>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between">
                <span className="text-gray-600">{event.title} × {quantity}</span>
                <span className="text-gray-900 font-bold">{isFree ? '0' : (totalPrice).toLocaleString()}</span>
              </div>
              {!isFree && (
                 <div className="flex justify-between text-gray-500">
                   <span>Service fee</span>
                   <span>{serviceFee}</span>
                 </div>
              )}
              <div className="flex justify-between pt-4 border-t border-dashed">
                <span className="font-bold text-lg text-gray-900">Total</span>
                <span className="font-extrabold text-2xl text-primary-900 space-x-1">
                   <span className="text-sm font-bold text-gray-500 align-middle">UGX</span>
                   <span>{grandTotal.toLocaleString()}</span>
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {step === 1 ? (
                <button onClick={() => isFree ? handlePayment() : setStep(2)} className="btn-primary w-full py-3.5 text-base shadow-lg shadow-primary-900/20 active:translate-y-1">
                  {isFree ? 'Confirm & Get Ticket' : 'Proceed to Payment'}
                </button>
              ) : (
                <>
                  <button onClick={handlePayment} disabled={processing} className="btn-primary w-full py-3.5 text-base shadow-lg shadow-primary-900/20 relative overflow-hidden group">
                    {processing ? 'Processing...' : `Confirm & Pay — UGX ${grandTotal.toLocaleString()}`}
                    {processing && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                  </button>
                  <button onClick={() => setStep(1)} disabled={processing} className="btn-outline w-full py-3 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                    Cancel & Go Back
                  </button>
                </>
              )}
            </div>
            <p className="mt-6 text-center text-xs text-gray-500 font-medium flex items-center justify-center gap-1.5">
              <span className="w-4 h-4 text-green-500">🔒</span> Secured by 256-bit SSL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
