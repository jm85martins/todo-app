"use client";

import { Plus } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardHeaderProps {
  pendingCount: number;
  todayCompletedCount: number;
  onQuickAdd: () => void;
}

function getGreeting(): string {
  const hours = new Date().getHours();
  if (hours < 12) return "Good morning";
  if (hours < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

export function DashboardHeader({ pendingCount, todayCompletedCount, onQuickAdd }: DashboardHeaderProps) {
  const greeting = getGreeting();
  const date = getFormattedDate();

  return (
    <div className="animate-fade-up flex items-center justify-between px-6 py-5 border-b border-border">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{greeting}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {date} &mdash; {pendingCount} {pendingCount === 1 ? "task" : "tasks"} remaining
        </p>
        <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-1">
          {todayCompletedCount} done today
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="New task"
          onClick={onQuickAdd}
          className="flex items-center gap-1.5 rounded-lg gradient-primary px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
        <ThemeToggle />
      </div>
    </div>
  );
}
