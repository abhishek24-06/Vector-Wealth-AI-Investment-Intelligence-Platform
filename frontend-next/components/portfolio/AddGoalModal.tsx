'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import type { Goal } from '@/lib/types/portfolio';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: Omit<Goal, 'id' | 'holdings' | 'recommendedStocks'>) => void;
}

export function AddGoalModal({ isOpen, onClose, onSubmit }: AddGoalModalProps) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [year, setYear] = useState('');
  const [risk, setRisk] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const isDark = document.documentElement.classList.contains('dark');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseFloat(amount);
    const targetYear = year;
    
    if (!name.trim() || isNaN(targetAmount) || targetAmount <= 0 || targetYear.length !== 4) {
      return;
    }

    onSubmit({
      name: name.trim(),
      targetAmount,
      targetDate: `${targetYear}-01-01`,
      riskTolerance: risk,
    });
    onClose();
  };

  const riskOptions: { value: 'conservative' | 'moderate' | 'aggressive'; label: string }[] = [
    { value: 'conservative', label: 'Conservative' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'aggressive', label: 'Aggressive' },
  ];

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
          <h3 className="text-lg font-bold">New Financial Goal</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Goal name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Retirement Fund, New Car"
              className="w-full px-4 py-3 rounded-xl text-base"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
              }}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Target amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 10000000"
              className="w-full px-4 py-3 rounded-xl text-base"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Target year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2045"
              min={new Date().getFullYear().toString()}
              max={(new Date().getFullYear() + 50).toString()}
              className="w-full px-4 py-3 rounded-xl text-base"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Risk Tolerance</label>
            <div className="flex gap-2">
              {riskOptions.map((option) => (
                <Chip
                  key={option.value}
                  variant={risk === option.value ? 'filled' : 'outline'}
                  onClick={() => setRisk(option.value)}
                  className="flex-1 justify-center py-2"
                >
                  <span className="text-sm">{option.label}</span>
                </Chip>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Create Goal
          </Button>
        </form>
        
        <div className="h-16" /> {/* Safe area padding */}
      </div>
    </div>
  );
}

