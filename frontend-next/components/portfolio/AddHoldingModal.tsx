'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import type { Holding } from '@/lib/types/portfolio';

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (holding: Holding) => void;
}

export function AddHoldingModal({ isOpen, onClose, onSubmit }: AddHoldingModalProps) {
  if (!isOpen) return null;

  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const isDark = document.documentElement.classList.contains('dark');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const buyPrice = parseFloat(price);
    
    if (!ticker.trim() || isNaN(qty) || qty <= 0 || isNaN(buyPrice) || buyPrice <= 0) {
      return;
    }

    onSubmit({
      ticker: ticker.trim().toUpperCase(),
      quantity: qty,
      buyPrice,
      buyDate: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-h-[90vh] overflow-y-auto" style={{
        backgroundColor: isDark ? '#0F1322' : '#F5F4FB',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
      }}>
        <div className="mx-auto mt-3 w-10 h-1 rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }} />
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <h3 className="text-lg font-bold">Add Holding</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Stock ticker</label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="e.g. TCS, RELIANCE, INFY"
              className="w-full px-4 py-3 rounded-xl text-base text-uppercase"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
              }}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 50"
                min="1"
                step="1"
                className="w-full px-4 py-3 rounded-xl text-base"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                }}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Buy price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 3200"
                min="0.01"
                step="0.01"
                className="w-full px-4 py-3 rounded-xl text-base"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                }}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Add Holding
          </Button>
        </form>
        
        <div className="h-16" />
      </div>
    </div>
  );
}

