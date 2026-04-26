import { Purchases } from '@revenuecat/purchases-js';

const API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY;

export const initRevenueCat = async (appUserId) => {
  try {
    const purchases = Purchases.configure(API_KEY, appUserId);
    console.log('✅ RevenueCat Initialized for user:', appUserId);
    return purchases;
  } catch (error) {
    console.error('❌ RevenueCat init error:', error);
  }
};

export const getOfferings = async () => {
  try {
    const offerings = await Purchases.getSharedInstance().getOfferings();
    return offerings;
  } catch (error) {
    console.error('❌ RevenueCat fetch offerings error:', error);
    return null;
  }
};

export const getCustomerInfo = async () => {
  try {
    const customerInfo = await Purchases.getSharedInstance().getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('❌ RevenueCat fetch customer info error:', error);
    return null;
  }
};

export const purchasePackage = async (rcPackage) => {
  try {
    const { customerInfo } = await Purchases.getSharedInstance().purchasePackage(rcPackage);
    return customerInfo;
  } catch (error) {
    if (error.userCancelled) {
      console.log('User cancelled the purchase');
    } else {
      console.error('❌ RevenueCat purchase error:', error);
    }
    throw error;
  }
};

export const purchaseProduct = async (productIdentifier) => {
  try {
    // For consumables or non-subscription products
    const { customerInfo } = await Purchases.getSharedInstance().purchaseProduct(productIdentifier);
    return customerInfo;
  } catch (error) {
    console.error('❌ RevenueCat product purchase error:', error);
    throw error;
  }
};
