"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TodoItem } from "@/components/todo-item";
import type { Todo } from "@/types/todo";

type FilterType = "all" | "active" | "completed";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClearCompleted: () => void;
  completedCount: number;
  pendingCount: number;
}

export function TodoList({
  todos,
  onToggle,
  onDelete,
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
      <div className="py-12 text-center text-muted-foreground">
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

        <div className="flex gap-1" role="group" aria-label="Filter todos">
          {filterButtons.map(({ value, label }) => (
            <Button
              key={value}
              variant={filter === value ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
            >
              {label}
            </Button>
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
      <div className="space-y-2" role="list" aria-label="Todo list">
        {filteredTodos.length > 0 ? (
          filteredTodos.map((todo) => (
            <div key={todo.id} role="listitem">
              <TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />
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
