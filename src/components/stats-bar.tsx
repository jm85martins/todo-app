"use client";

import { Clock, CheckCircle2, LayoutList } from "lucide-react";
import { ProgressRing } from "@/components/progress-ring";

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
  ring?: number;
}

function StatCard({ label, value, icon: Icon, colorClass, gradientClass, ring }: StatCardProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl p-4 ${gradientClass} shadow-card flex items-center gap-4`}
    >
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClass}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      {ring !== undefined && <ProgressRing value={ring} size={56} strokeWidth={5} />}
    </div>
  );
}

export function StatsBar({ pendingCount, completedCount, totalCount }: StatsBarProps) {
  const completionRing =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6 py-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
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
        ring={completionRing}
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
