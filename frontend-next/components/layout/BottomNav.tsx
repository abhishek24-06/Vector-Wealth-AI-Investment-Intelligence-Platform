'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/providers/ThemeProvider';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils/cn';

const TABS = [
  { href: '/analyze', label: 'Analyze', icon: AnalyzeIcon },
  { href: '/discover', label: 'Discover', icon: DiscoverIcon },
  { href: '/portfolio', label: 'Portfolio', icon: PortfolioIcon },
  { href: '/chat', label: 'Chat', icon: ChatIcon },
] as const;

function AnalyzeIcon({ selected }: { selected: boolean }) {
  return (
    <svg className="w-6 h-6" fill={selected ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function DiscoverIcon({ selected }: { selected: boolean }) {
  return (
    <svg className="w-6 h-6" fill={selected ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function PortfolioIcon({ selected }: { selected: boolean }) {
  return (
    <svg className="w-6 h-6" fill={selected ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function ChatIcon({ selected }: { selected: boolean }) {
  return (
    <svg className="w-6 h-6" fill={selected ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)',
      backdropFilter: 'blur(24px)',
      borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,200,212,0.4)',
    }}>
      <div className="flex items-center justify-around h-16 px-4 safe-area-bottom">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 transition-all duration-200',
                'rounded-xl min-w-[72px]',
                isActive 
                  ? 'text-[var(--accent)] bg-[var(--accent)]/15' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-[var(--accent)]/5'
              )}
              aria-label={tab.label}
            >
              <tab.icon selected={isActive} />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
        <ThemeToggle className="ml-2 p-1.5" />
      </div>
    </nav>
  );
}

