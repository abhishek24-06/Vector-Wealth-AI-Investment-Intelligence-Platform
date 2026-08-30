'use client';

import { useState, useEffect } from 'react';
import { ReactNode } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';

export default function TabsLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}


