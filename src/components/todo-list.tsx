"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TodoItem } from "@/components/todo-item";
import { cn } from "@/lib/utils";
import type { Todo, UpdateTodoInput } from "@/types/todo";

type FilterType = "all" | "active" | "completed";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, input: UpdateTodoInput) => void;
  onClearCompleted: () => void;
  completedCount: number;
  pendingCount: number;
}

export function TodoList({
  todos,
  onToggle,
  onDelete,
  onEdit,
  onClearCompleted,
  completedCount,
  pendingCount,
}: TodoListProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const filterButtons: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
  ];

  if (todos.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
        <CheckCircle2 className="h-8 w-8 opacity-30" />
        <p className="text-sm">No todos yet. Add one above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {pendingCount} {pendingCount === 1 ? "item" : "items"} left
        </p>

        <div className="flex rounded-lg bg-muted p-0.5 gap-0.5" role="group" aria-label="Filter todos">
          {filterButtons.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                filter === value
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

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
      <div className="space-y-1" role="list" aria-label="Todo list">
        {filteredTodos.length > 0 ? (
          filteredTodos.map((todo) => (
            <div key={todo.id} role="listitem">
              <TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No {filter} todos.
          </p>
        )}
      </div>
    </div>
  );
}
