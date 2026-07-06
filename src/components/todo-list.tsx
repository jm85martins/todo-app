"use client";

import { Button } from "@/components/ui/button";
import { TodoItem } from "@/components/todo-item";
import type { Todo, UpdateTodoInput } from "@/types/todo";

export type FilterType = "all" | "active" | "completed";
export type SortBy = "priority" | "dueDate" | "createdAt";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, input: UpdateTodoInput) => void;
  onClearCompleted: () => void;
  completedCount: number;
  pendingCount: number;
  activeFilter: FilterType;
  sortBy: SortBy;
  onSortChange: (s: SortBy) => void;
  searchQuery: string;
}

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export function TodoList({
  todos,
  onToggle,
  onDelete,
  onEdit,
  onClearCompleted,
  completedCount,
  pendingCount,
  activeFilter,
  sortBy,
  onSortChange,
  searchQuery,
}: TodoListProps) {
  const filtered = todos
    .filter((t) =>
      activeFilter === "active"
        ? !t.completed
        : activeFilter === "completed"
        ? t.completed
        : true
    )
    .filter(
      (t) =>
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "priority") {
      return (
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
        b.createdAt.getTime() - a.createdAt.getTime()
      );
    }
    if (sortBy === "dueDate") {
      if (!a.dueDate && !b.dueDate) return b.createdAt.getTime() - a.createdAt.getTime();
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div className="space-y-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {pendingCount} {pendingCount === 1 ? "item" : "items"} left
        </p>

        <select
          aria-label="Sort tasks"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortBy)}
          className="text-xs rounded-md border border-input bg-background px-2 py-1 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="createdAt">Date added</option>
          <option value="priority">Priority</option>
          <option value="dueDate">Due date</option>
        </select>

        {completedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCompleted}
            className="text-muted-foreground"
          >
            Clear completed
          </Button>
        )}
      </div>

      {/* Todo items */}
      {sorted.length > 0 ? (
        <div className="space-y-2" role="list" aria-label="Todo list">
          {sorted.map((todo) => (
            <div key={todo.id} role="listitem">
              <TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
          >
            <rect x="8" y="2" width="8" height="4" rx="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <p className="text-sm font-medium">No tasks here yet</p>
          <p className="text-xs">Add your first task above</p>
        </div>
      )}
    </div>
  );
}
