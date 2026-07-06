"use client";

import { Clock, CheckCircle2, LayoutList } from "lucide-react";

interface StatsBarProps {
  pendingCount: number;
  completedCount: number;
  totalCount: number;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  gradientClass: string;
}

function StatCard({ label, value, icon: Icon, colorClass, gradientClass }: StatCardProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl p-4 ${gradientClass} flex items-center gap-4`}
    >
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClass}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function StatsBar({ pendingCount, completedCount, totalCount }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
      <StatCard
        label="Pending"
        value={pendingCount}
        icon={Clock}
        colorClass="bg-amber-500"
        gradientClass="bg-amber-50 dark:bg-amber-950/30"
      />
      <StatCard
        label="Completed"
        value={completedCount}
        icon={CheckCircle2}
        colorClass="bg-emerald-500"
        gradientClass="bg-emerald-50 dark:bg-emerald-950/30"
      />
      <StatCard
        label="Total"
        value={totalCount}
        icon={LayoutList}
        colorClass="bg-indigo-500"
        gradientClass="bg-indigo-50 dark:bg-indigo-950/30"
      />
    </div>
  );
}
