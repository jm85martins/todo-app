"use client";

import { useEffect } from "react";
import { ListTodo, Circle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterType = "all" | "active" | "completed";

interface SidebarProps {
  activeFilter: FilterType;
  onFilterChange: (f: FilterType) => void;
  pendingCount: number;
  completedCount: number;
}

const navItems: {
  value: FilterType;
  label: string;
  shortcut: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "all", label: "All Tasks", shortcut: "1", Icon: ListTodo },
  { value: "active", label: "Active", shortcut: "2", Icon: Circle },
  { value: "completed", label: "Completed", shortcut: "3", Icon: CheckCircle2 },
];

export function Sidebar({
  activeFilter,
  onFilterChange,
  pendingCount,
  completedCount,
}: SidebarProps) {
  const getCount = (value: FilterType) => {
    if (value === "active") return pendingCount;
    if (value === "completed") return completedCount;
    return pendingCount + completedCount;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
      const active = document.activeElement;
      if (active !== document.body && active !== null) return;
      if (e.key === "1") onFilterChange("all");
      else if (e.key === "2") onFilterChange("active");
      else if (e.key === "3") onFilterChange("completed");
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onFilterChange]);

  return (
    <nav
      aria-label="Main navigation"
      className="hidden md:flex flex-col shrink-0 md:w-16 lg:w-64 h-full"
      style={{ backgroundColor: "hsl(var(--sidebar-bg))", color: "hsl(var(--sidebar-fg))" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 lg:px-6">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-blue-400 flex items-center justify-center shrink-0">
          <ListTodo className="h-4 w-4 text-white" />
        </div>
        <span className="hidden lg:block text-lg font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
          Tasks
        </span>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-2 lg:px-3 space-y-1">
        {navItems.map(({ value, label, shortcut, Icon }) => {
          const isActive = activeFilter === value;
          const count = getCount(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onFilterChange(value)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/80"
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-indigo-400"
                  aria-hidden="true"
                />
              )}
              <Icon className="h-5 w-5 shrink-0" />
              <span className="hidden lg:block flex-1 text-left">{label}</span>
              <span
                className={cn(
                  "hidden lg:inline-flex items-center justify-center min-w-5 h-5 rounded-full text-xs font-medium px-1",
                  isActive ? "bg-indigo-500 text-white" : "bg-white/10 text-white/60"
                )}
              >
                {count}
              </span>
              <span className="hidden lg:block text-xs text-white/30">[{shortcut}]</span>
            </button>
          );
        })}
      </div>

      {/* Sticky bottom */}
      <div className="px-4 py-4 lg:px-6 flex items-center justify-between">
        <span className="text-xs text-white/30">v0.1</span>
        <span className="text-xs text-white/30">&#8984;K</span>
      </div>
    </nav>
  );
}
