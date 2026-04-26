import React from 'react';
import { useRevenueCat } from '../context/RevenueCatContext';
import { toast } from 'react-hot-toast';

export default function Paywall({ isOpen, onClose }) {
  const { offerings, purchase, isPro } = useRevenueCat();

  if (!isOpen) return null;

  const handlePurchase = async (pkg) => {
    toast.loading('Processing...', { id: 'purchase' });
    const { success, error } = await purchase(pkg);
    if (success) {
      toast.success('Upgrade Successful! Welcome to CETS Pro.', { id: 'purchase' });
      onClose();
    } else {
      if (!error?.userCancelled) {
        toast.error(error?.message || 'Purchase failed', { id: 'purchase' });
      } else {
        toast.dismiss('purchase');
      }
    }
  };

  // Try current offering first, then fall back to any available offering
  const mainOffering = offerings?.current || (offerings?.all ? Object.values(offerings.all)[0] : null);
  const packages = mainOffering?.availablePackages || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header Decor */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-600 to-indigo-700" />
        
        <div className="relative p-6 pt-12 text-center sm:p-10 sm:pt-16">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-white mb-2">Elevate Your Experience</h2>
            <p className="text-blue-100 text-lg">Join 2,000+ students and organizers using CETS Pro</p>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2">
            {/* Main Pro Offering */}
            {packages.map((pkg) => (
              <div 
                key={pkg.identifier}
                className="relative flex flex-col p-6 transition-all border-2 rounded-2xl hover:border-blue-500 hover:shadow-lg bg-gray-50 border-gray-100"
              >
                {pkg.packageType === 'ANNUAL' && (
                  <span className="absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white uppercase transform translate-x-2 -translate-y-2 bg-yellow-500 rounded-full">
                    Best Value
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-900">{pkg.product.title}</h3>
                <div className="flex items-baseline my-4">
                  <span className="text-4xl font-extrabold text-gray-900">{pkg.product.priceString}</span>
                  <span className="ml-1 text-gray-500">/{pkg.packageType.toLowerCase()}</span>
                </div>
                
                <ul className="flex-1 mb-8 space-y-3 text-sm text-left text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Early Access to Tickets
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Zero Processing Fees
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Exclusive Event Badges
                  </li>
                </ul>

                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={isPro}
                  className={`w-full py-3 font-bold text-white transition-all rounded-xl shadow-md ${
                    isPro ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200'
                  }`}
                >
                  {isPro ? 'Subscribed' : 'Choose Plan'}
                </button>
              </div>
            ))}

            {/* If no packages, show placeholder */}
            {!packages.length && (
              <div className="col-span-2 py-8 text-gray-500 italic">
                Loading fresh offers...
              </div>
            )}
          </div>

          <p className="mt-8 text-xs text-gray-400">
            Secure payments via Stripe. Cancel anytime. 
            By subscribing, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
