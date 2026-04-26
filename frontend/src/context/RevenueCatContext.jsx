import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Purchases } from '@revenuecat/purchases-js';
import { useAuth } from './AuthContext';

const RevenueCatContext = createContext(null);

export const RevenueCatProvider = ({ children }) => {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [offerings, setOfferings] = useState(null);
  const [loadingRC, setLoadingRC] = useState(true);

  const fetchCustomerInfo = useCallback(async () => {
    try {
      const info = await Purchases.getSharedInstance().getCustomerInfo();
      setCustomerInfo(info);
      
      const activeEntitlements = info.entitlements.active;
      const hasCetsPro = !!activeEntitlements['cets Pro'];
      const hasPro = !!activeEntitlements['pro'];
      
      setIsPro(hasCetsPro || hasPro);
      return info;
    } catch (e) {
      console.error('RevenueCat Error:', e);
      return null;
    }
  }, []);

  const init = useCallback(async () => {
    if (!user) {
      setIsPro(false);
      setCustomerInfo(null);
      setLoadingRC(false);
      return;
    }

    try {
      const key = import.meta.env.VITE_REVENUECAT_API_KEY;
      console.log('💎 RC: Configuring with key:', key?.substring(0, 8) + '...');
      await Purchases.configure(key, String(user.userID));
      
      const info = await fetchCustomerInfo();
      console.log('💎 RC: Customer Info loaded:', info);
      
      const offs = await Purchases.getSharedInstance().getOfferings();
      console.log('💎 RC: Offerings fetched:', offs);
      setOfferings(offs);
    } catch (err) {
      console.error('RevenueCat Init Failed:', err);
    } finally {
      setLoadingRC(false);
    }
  }, [user, fetchCustomerInfo]);

  useEffect(() => {
    init();
  }, [init]);

  const purchase = async (pkg) => {
    try {
      const result = await Purchases.getSharedInstance().purchasePackage(pkg);
      const info = result.customerInfo;
      setCustomerInfo(info);
      
      const active = info.entitlements.active;
      setIsPro(!!active['cets Pro'] || !!active['pro']);
      
      return { success: true, info };
    } catch (error) {
      return { success: false, error };
    }
  };

  const contextValue = useMemo(() => ({
    isPro,
    customerInfo,
    offerings,
    loadingRC,
    purchase,
    restore: fetchCustomerInfo
  }), [isPro, customerInfo, offerings, loadingRC, fetchCustomerInfo]);

  return (
    <RevenueCatContext.Provider value={contextValue}>
      {children}
    </RevenueCatContext.Provider>
  );
};

export const useRevenueCat = () => {
  const ctx = useContext(RevenueCatContext);
  if (!ctx) throw new Error('useRevenueCat must be used within RevenueCatProvider');
  return ctx;
};
