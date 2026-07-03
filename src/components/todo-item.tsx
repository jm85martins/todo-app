"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Todo, Priority, UpdateTodoInput } from "@/types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, input: UpdateTodoInput) => void;
}

const priorityVariant: Record<
  Priority,
  "default" | "secondary" | "destructive" | "outline"
> = {
  low: "outline",
  medium: "secondary",
  high: "destructive",
};

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description ?? "");
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      titleInputRef.current?.focus();
    }
  }, [isEditing]);

  const handleEditStart = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description ?? "");
    setEditPriority(todo.priority);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onEdit(todo.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      priority: editPriority,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") handleCancel();
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border bg-card p-4 transition-opacity",
        todo.completed && !isEditing && "opacity-60"
      )}
      data-testid="todo-item"
    >
      {isEditing ? (
        <div className="min-w-0 flex-1 space-y-3">
          <Input
            ref={titleInputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Edit todo title"
            data-testid="edit-title-input"
          />
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            aria-label="Edit todo description"
            data-testid="edit-description-input"
          />
          <div className="flex gap-2" role="group" aria-label="Priority">
            {(["low", "medium", "high"] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setEditPriority(p)}
                className={[
                  "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                  editPriority === p
                    ? "bg-primary text-primary-foreground"
                    : "border bg-background hover:bg-accent",
                ].join(" ")}
                aria-pressed={editPriority === p}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!editTitle.trim()}
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <>
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
            onClick={handleEditStart}
            aria-label={`Edit "${todo.title}"`}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
            onClick={() => onDelete(todo.id)}
            aria-label={`Delete "${todo.title}"`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
