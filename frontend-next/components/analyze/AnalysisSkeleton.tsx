'use client';

import { SkeletonCard } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

interface AnalysisSkeletonProps {
  className?: string;
}

export function AnalysisSkeleton({ className }: AnalysisSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <SkeletonCard height={140} />
      <SkeletonCard height={100} />
      <SkeletonCard height={180} />
      <SkeletonCard height={140} />
      <SkeletonCard height={120} />
    </div>
  );
}

