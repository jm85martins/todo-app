"use client";

import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Todo, Priority } from "@/types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const priorityVariant: Record<
  Priority,
  "default" | "secondary" | "destructive" | "outline"
> = {
  low: "outline",
  medium: "secondary",
  high: "destructive",
};

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border bg-card p-4 transition-opacity",
        todo.completed && "opacity-60"
      )}
      data-testid="todo-item"
    >
      <Checkbox
        id={`todo-${todo.id}`}
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        className="mt-0.5"
        aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
      />

      <div className="min-w-0 flex-1">
        <label
          htmlFor={`todo-${todo.id}`}
          className={cn(
            "cursor-pointer text-sm font-medium",
            todo.completed && "line-through text-muted-foreground"
          )}
        >
          {todo.title}
        </label>

        {todo.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {todo.description}
          </p>
        )}

        <div className="mt-1.5 flex items-center gap-2">
          <Badge variant={priorityVariant[todo.priority]} className="text-xs">
            {todo.priority}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
            }).format(todo.createdAt)}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete "${todo.title}"`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
