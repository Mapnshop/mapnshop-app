import React, { createContext, useContext, useEffect, useState } from 'react';
import { Business } from '@/types';
import { businessApi } from '@/lib/api';
import { useAuth } from './AuthContext';

interface BusinessContextType {
  business: Business | null;
  loading: boolean;
  setBusiness: (business: Business) => void;
  refreshBusiness: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshBusiness = async () => {
    console.log('REFRESH BUS START', { userId: user?.id, loadedUserId });
    setLoading(true);
    if (!user) {
      console.log('No user. Clearing.');
      setBusiness(null);
      setLoadedUserId(null);
      setLoading(false);
      return;
    }

    try {
      // 1. Try to find business owned by user
      console.log('Fetching owned business...');
      const ownedBusiness = await businessApi.getByOwnerId(user.id);
      let foundBusiness: Business | null = null;

      if (ownedBusiness) {
        console.log('Found owned:', ownedBusiness.id);
        foundBusiness = ownedBusiness;
      } else {
        // 2. Check if user is a staff member
        console.log('Checking membership...');
        const memberBusiness = await businessApi.checkMembership(user.id, user.email || '');
        if (memberBusiness) {
          console.log('Found membership:', memberBusiness.id);
          foundBusiness = memberBusiness;
        } else {
          console.log('No business found.');
        }
      }

      setBusiness(foundBusiness);
      setLoadedUserId(user.id);
      console.log('Refresh COMPLETE');
    } catch (error) {
      console.log('Error refreshing business:', error);
      setBusiness(null);
      setLoadedUserId(user.id);
    } finally {
      console.log('Loading OFF');
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBusiness();
  }, [user]);

  // Derived loading state to prevent race conditions
  const effectiveLoading = loading || (!!user && user.id !== loadedUserId);

  return (
    <BusinessContext.Provider value={{ business, loading: effectiveLoading, setBusiness, refreshBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}