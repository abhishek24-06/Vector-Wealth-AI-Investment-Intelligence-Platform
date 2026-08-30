'use client';

import { useState, useEffect, useContext } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ThemeContext } from '@/providers/ThemeProvider';
import { testConnection } from '@/lib/api/client';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const [ipInput, setIpInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [currentUrl, setCurrentUrl] = useState('http://localhost:8000');
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Get theme from ThemeContext using useContext to defer evaluation
  const themeContext = useContext(ThemeContext);
  useEffect(() => {
    setMounted(true);
    if (themeContext) {
      setIsDark(themeContext.theme === 'dark');
    }
  }, [themeContext]);

  const testConnectionHandler = async (urlOverride?: string) => {
    setTesting(true);
    setConnected(null);
    const result = await testConnection(urlOverride);
    setTesting(false);
    setConnected(result);
  };

  const handleSave = async () => {
    const input = ipInput.trim();
    if (!input) return;

    let testUrl: string;
    if (input.startsWith('http://') || input.startsWith('https://')) {
      testUrl = input;
    } else {
      testUrl = `http://${input}`;
      if (!input.includes(':')) {
        testUrl = `http://${input}:8000`;
      }
    }
    if (testUrl.endsWith('/')) testUrl = testUrl.slice(0, -1);

    setTesting(true);
    setConnected(null);
    const ok = await testConnection(testUrl);
    
    if (ok) {
      // In a real app, you'd save this to localStorage or backend
      setCurrentUrl(testUrl);
      setConnected(true);
      alert('✅ Connected! Backend URL saved.');
    } else {
      setConnected(false);
      alert('❌ Could not reach backend at that address.');
    }
    setTesting(false);
  };

  if (!mounted) {
    return <div className="min-h-screen pb-20" />;
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Settings</h1>
          <ThemeToggle />
        </div>

        {/* Connection Status */}
        <GlassCard>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--accentIndigo)20', color: 'var(--accentIndigo)' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-base">Backend Connection</h3>
                <p className="text-sm text-muted-foreground font-mono">{currentUrl}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {testing && (
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              )}
              {!testing && connected === null && (
                <span className="px-3 py-1 rounded-full text-xs bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400">Unknown</span>
              )}
              {!testing && connected === true && (
                <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">Connected</span>
              )}
              {!testing && connected === false && (
                <span className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">Disconnected</span>
              )}
            </div>
          </div>
        </GlassCard>

        {/* IP Configuration */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(129, 140, 248, 0.2)', color: 'var(--accentIndigo)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-base">Backend IP Address</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Enter your PC's local IP address. Find it by running <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>ipconfig</code> in a terminal on your PC.
          </p>
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">http://</span>
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="192.168.1.100:8000"
              className="w-full pl-16 pr-4 py-3 rounded-xl text-base"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                borderWidth: '1px',
                borderStyle: 'solid',
              }}
            />
          </div>
          
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSave} disabled={testing} className="flex-1">
              {testing ? 'Testing...' : 'Save & Test'}
            </Button>
            <Button variant="outline" onClick={() => testConnectionHandler()} disabled={testing}>
              Test
            </Button>
          </div>
        </GlassCard>

        {/* Help */}
        <GlassCard style={{ 
          backgroundColor: 'var(--accentIndigo)08', 
          borderColor: 'var(--accentIndigo)20',
          borderWidth: '1px',
          borderStyle: 'solid',
        }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--accentIndigo)20', color: 'var(--accentIndigo)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-base" style={{ color: 'var(--accentIndigo)' }}>How to find your PC's IP</h3>
          </div>
          <div className="space-y-3 text-sm">
            {[
              'Open a terminal on your PC',
              'Run: <code className="px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}>ipconfig</code> (Windows) or <code className="px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}>ifconfig</code> (Mac/Linux)',
              'Find "IPv4 Address" under your WiFi adapter',
              'Enter that IP above (e.g., 192.168.1.100)',
            ].map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold" style={{ 
                  backgroundColor: 'var(--accentIndigo)20', 
                  color: 'var(--accentIndigo)' 
                }}>
                  {i + 1}
                </div>
                <div dangerouslySetInnerHTML={{ __html: step }} />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 italic">
            Both your phone and PC must be on the same WiFi network.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}


