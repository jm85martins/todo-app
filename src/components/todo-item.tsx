"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Todo, Priority, UpdateTodoInput } from "@/types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, input: UpdateTodoInput) => void;
}

const BADGE_VARIANTS = ["default", "secondary", "outline", "secondary", "default"] as const;

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description ?? "");
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority);
  const [editDueDate, setEditDueDate] = useState(todo.dueDate ?? "");
  const [editLabel, setEditLabel] = useState(todo.label ?? "");
  const [editCategory, setEditCategory] = useState(todo.category ?? "");
  const [isPopping, setIsPopping] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
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
    setEditDueDate(todo.dueDate ?? "");
    setEditLabel(todo.label ?? "");
    setEditCategory(todo.category ?? "");
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onEdit(todo.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      priority: editPriority,
      dueDate: editDueDate || undefined,
      label: editLabel || undefined,
      category: editCategory || undefined,
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

  const handleToggle = () => {
    onToggle(todo.id);
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 250);
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 400);
  };

  const labelBadgeVariant = todo.label
    ? BADGE_VARIANTS[todo.label.charCodeAt(0) % 5]
    : "default";

  const formattedDueDate = todo.dueDate
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
        new Date(todo.dueDate + "T00:00:00")
      )
    : null;

  const isOverdue =
    !todo.completed &&
    !!todo.dueDate &&
    todo.dueDate < new Date().toISOString().slice(0, 10);

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-xl bg-card shadow-card hover:shadow-card-md transition-all duration-200 pl-5 pr-4 py-4",
        todo.completed && !isEditing && "opacity-60 bg-muted/30",
        isFlashing && "bg-emerald-500/10"
      )}
      data-testid={isOverdue ? "todo-item-overdue" : "todo-item"}
    >
      {/* Priority bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: `hsl(var(--priority-${todo.priority}))` }}
      />

      {isEditing ? (
        <div className="min-w-0 flex-1 space-y-3 animate-scale-in">
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
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-all",
                  editPriority === p
                    ? "ring-2 ring-offset-1"
                    : "opacity-60 hover:opacity-100"
                )}
                aria-pressed={editPriority === p}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `hsl(var(--priority-${p}))` }}
                />
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <div className="space-y-1">
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              aria-label="Due date"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <Input
              placeholder="Label (optional)"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Input
              id="edit-category-input"
              placeholder="Category (optional)"
              aria-label="Edit category"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
            />
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
          {/* Drag handle */}
          <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-100 mt-0.5 text-muted-foreground shrink-0" />

          <Checkbox
            id={`todo-${todo.id}`}
            checked={todo.completed}
            onCheckedChange={handleToggle}
            className={cn("mt-0.5", isPopping && "animate-check-pop")}
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

            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: `hsl(var(--priority-${todo.priority}))` }}
                aria-label={`Priority: ${todo.priority}`}
                role="img"
              />
              <span className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                }).format(todo.createdAt)}
              </span>
              {formattedDueDate && (
                <span className={cn("text-xs", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                  Due {formattedDueDate}
                </span>
              )}
              {todo.label && (
                <Badge variant={labelBadgeVariant}>{todo.label}</Badge>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground opacity-50 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
            onClick={handleEditStart}
            aria-label={`Edit "${todo.title}"`}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground opacity-50 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
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
