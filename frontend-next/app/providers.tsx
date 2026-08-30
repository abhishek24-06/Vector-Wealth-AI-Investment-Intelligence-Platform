'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '../providers/ThemeProvider';
import { AnalysisProvider } from '../providers/AnalysisProvider';
import { DiscoverProvider } from '../providers/DiscoverProvider';
import { PortfolioProvider } from '../providers/PortfolioProvider';
import { ChatProvider } from '../providers/ChatProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AnalysisProvider>
        <DiscoverProvider>
          <PortfolioProvider>
            <ChatProvider getPortfolioData={() => []}>
              {children}
            </ChatProvider>
          </PortfolioProvider>
        </DiscoverProvider>
      </AnalysisProvider>
    </ThemeProvider>
  );
}


