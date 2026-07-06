"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AddTodoForm } from "@/components/add-todo-form";
import { TodoList, type FilterType, type SortBy } from "@/components/todo-list";
import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { StatsBar } from "@/components/stats-bar";
import { CommandPalette } from "@/components/command-palette";
import { useTodos } from "@/hooks/use-todos";

export default function HomePage() {
  const {
    todos,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    completedCount,
    pendingCount,
  } = useTodos();

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        pendingCount={pendingCount}
        completedCount={completedCount}
      />

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute left-0 top-0 bottom-0 w-64"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              activeFilter={activeFilter}
              onFilterChange={(f) => {
                setActiveFilter(f);
                setMobileNavOpen(false);
              }}
              pendingCount={pendingCount}
              completedCount={completedCount}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <DashboardHeader pendingCount={pendingCount} />
        <StatsBar
          pendingCount={pendingCount}
          completedCount={completedCount}
          totalCount={todos.length}
        />

        <section className="p-6 space-y-6">
          {/* Search */}
          <input
            type="search"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search tasks"
            className="w-full rounded-full border border-input bg-background px-5 h-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          <AddTodoForm onAdd={addTodo} />

          <TodoList
            todos={todos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={updateTodo}
            onClearCompleted={clearCompleted}
            completedCount={completedCount}
            pendingCount={pendingCount}
            activeFilter={activeFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            searchQuery={searchQuery}
          />
        </section>
      </main>

      {/* Command palette */}
      <CommandPalette
        todos={todos}
        onAdd={addTodo}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
      />

      {/* Mobile FAB */}
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setMobileNavOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Menu className="h-6 w-6" />
      </button>
    </div>
  );
}
