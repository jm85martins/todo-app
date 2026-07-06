"use client";

import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardHeaderProps {
  pendingCount: number;
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

export function DashboardHeader({ pendingCount }: DashboardHeaderProps) {
  const greeting = getGreeting();
  const date = getFormattedDate();

  return (
    <div className="animate-fade-up flex items-center justify-between px-6 py-5 border-b border-border">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{greeting}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {date} &mdash; {pendingCount} {pendingCount === 1 ? "task" : "tasks"} remaining
        </p>
      </div>
      <ThemeToggle />
    </div>
  );
}
