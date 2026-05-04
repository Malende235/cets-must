import { useRevenueCat } from '../../context/RevenueCatContext';
import { toast } from 'react-hot-toast';
import { CheckBadgeIcon, RocketLaunchIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

const features = [
  {
    title: "Early Access",
    desc: "Get first dibs on popular campus events before they open to the general public.",
    icon: RocketLaunchIcon,
    color: "bg-blue-500"
  },
  {
    title: "Zero Fees",
    desc: "Pay exactly the ticket price. No processing or convenience fees on any booking.",
    icon: ShieldCheckIcon,
    color: "bg-green-500"
  },
  {
    title: "Exclusive Perks",
    desc: "Access VIP sections, shorter queues, and special member-only events.",
    icon: SparklesIcon,
    color: "bg-gold-500"
  },
  {
    title: "Pro Badge",
    desc: "Stand out with a premium badge on your profile and event attendee lists.",
    icon: CheckBadgeIcon,
    color: "bg-indigo-500"
  }
];

export default function Pro() {
  const { offerings, purchase, isPro } = useRevenueCat();

  const handlePurchase = async (pkg) => {
    toast.loading('Processing upgrade...', { id: 'purchase' });
    const { success, error } = await purchase(pkg);
    if (success) {
      toast.success('Welcome to CETS Pro!', { id: 'purchase' });
    } else if (!error?.userCancelled) {
      toast.error(error?.message || 'Purchase failed', { id: 'purchase' });
    } else {
      toast.dismiss('purchase');
    }
  };

  const mainOffering = offerings?.current || (offerings?.all ? Object.values(offerings.all)[0] : null);
  const packages = mainOffering?.availablePackages || [];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-bold animate-bounce">
          <SparklesIcon className="w-4 h-4" />
          <span>PREMIUM EXPERIENCE</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
          Unlock the Full Power of <span className="text-primary-600">CETS</span>
        </h1>
        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto">
          Upgrade to CETS Pro and get exclusive access to the best campus events with premium perks and zero fees.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <div key={i} className="card p-6 border-0 shadow-lg hover:shadow-xl transition-shadow group">
            <div className={`w-12 h-12 ${f.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Pricing Section */}
      <div className="relative mt-20">
        <div className="absolute inset-0 bg-primary-900 rounded-3xl -rotate-1 scale-[1.02] opacity-10" />
        <div className="relative bg-white border border-gray-100 rounded-3xl shadow-2xl p-8 md:p-12 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            
            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Choose your plan</h2>
              <p className="text-gray-500">
                Join thousands of students enhancing their campus life. Cancel anytime with a single click.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center">✓</div>
                  <span>Instant activation</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center">✓</div>
                  <span>Secure Stripe payments</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.identifier} className={`relative p-8 rounded-2xl border-2 transition-all ${pkg.packageType === 'ANNUAL' ? 'border-primary-500 bg-primary-50/30' : 'border-gray-100 bg-gray-50/50'}`}>
                  {pkg.packageType === 'ANNUAL' && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg">
                      Recommended
                    </span>
                  )}
                  <div className="text-center space-y-4">
                    <h4 className="text-gray-500 font-bold text-xs uppercase tracking-widest">{pkg.packageType} PLAN</h4>
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-black text-gray-900">{pkg.product.priceString}</span>
                      <span className="text-gray-400 text-sm mt-1">per {pkg.packageType.toLowerCase()}</span>
                    </div>
                    <button
                      onClick={() => handlePurchase(pkg)}
                      disabled={isPro}
                      className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all ${
                        isPro ? 'bg-gray-400' : 'bg-primary-900 hover:bg-primary-800 active:scale-95'
                      }`}
                    >
                      {isPro ? 'Already Pro' : 'Upgrade Now'}
                    </button>
                  </div>
                </div>
              ))}
              {!packages.length && (
                <div className="col-span-2 py-12 text-center text-gray-400 italic">
                  Connecting to secure payment gateway...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-center text-gray-400 text-xs">
        * No hidden costs. Billing handled securely via RevenueCat. 
        Subscription automatically renews unless cancelled.
      </p>
    </div>
  );
}
