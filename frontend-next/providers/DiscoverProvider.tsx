'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { getOpportunities, triggerScan, getScannerStatus } from '@/lib/api/endpoints';
import type { Opportunity, OpportunitiesResponse, ScannerStatus, DiscoverState } from '@/lib/types/opportunity';

interface DiscoverContextType extends DiscoverState {
  fetchOpportunities: () => Promise<void>;
  fetchStatus: () => Promise<void>;
  triggerScan: () => Promise<void>;
  refresh: () => Promise<void>;
}

const DiscoverContext = createContext<DiscoverContextType | undefined>(undefined);

export function DiscoverProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DiscoverState>({
    isLoading: false,
    isScanning: false,
    error: null,
    opportunities: [],
    isMarketHours: false,
    status: null,
  });

  const fetchOpportunitiesAction = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await getOpportunities();
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        opportunities: result.opportunities,
        isMarketHours: result.isMarketHours,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch opportunities';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
    }
  }, []);

  const fetchStatusAction = useCallback(async () => {
    try {
      const status = await getScannerStatus();
      setState(prev => ({ ...prev, status, isMarketHours: status.isMarketHours }));
    } catch {
      // Silent fail for status
    }
  }, []);

  const triggerScanAction = useCallback(async () => {
    setState(prev => ({ ...prev, isScanning: true, error: null }));
    try {
      await triggerScan();
      await fetchOpportunitiesAction();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to scan';
      setState(prev => ({ ...prev, isScanning: false, error: message }));
    } finally {
      setState(prev => ({ ...prev, isScanning: false }));
    }
  }, [fetchOpportunitiesAction]);

  const refreshAction = useCallback(async () => {
    await Promise.all([fetchOpportunitiesAction(), fetchStatusAction()]);
  }, [fetchOpportunitiesAction, fetchStatusAction]);

  return (
    <DiscoverContext.Provider value={{ ...state, fetchOpportunities: fetchOpportunitiesAction, fetchStatus: fetchStatusAction, triggerScan: triggerScanAction, refresh: refreshAction }}>
      {children}
    </DiscoverContext.Provider>
  );
}

export function useDiscover() {
  const context = useContext(DiscoverContext);
  if (!context) {
    throw new Error('useDiscover must be used within a DiscoverProvider');
  }
  return context;
}