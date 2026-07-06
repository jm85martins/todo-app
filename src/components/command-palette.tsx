"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, X, Check } from "lucide-react";
import type { Todo, CreateTodoInput } from "@/types/todo";

interface CommandPaletteProps {
  todos: Todo[];
  onAdd: (input: CreateTodoInput) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CommandPalette({ todos, onAdd, onToggle, onDelete }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        close();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (open) {
      // Small delay to ensure DOM is rendered
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const filteredTodos = todos.filter((t) =>
    !query || t.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      close();
    }
  };

  const handleClearCompleted = () => {
    const completed = todos.filter((t) => t.completed);
    completed.forEach((t) => onDelete(t.id));
    close();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-200"
      data-testid="command-palette"
      onClick={handleOverlayClick}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="mx-auto max-w-lg mt-[15vh] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search todos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="command-palette-input"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={close}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close command palette"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Todo list */}
        <div className="max-h-64 overflow-y-auto">
          {filteredTodos.length > 0 ? (
            filteredTodos.map((todo) => (
              <button
                key={todo.id}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                onClick={() => onToggle(todo.id)}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: `hsl(var(--priority-${todo.priority}))` }}
                />
                <span className={`flex-1 text-sm ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                  {todo.title}
                </span>
                <span
                  className="h-4 w-4 rounded-sm border border-primary flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  {todo.completed && <Check className="h-3 w-3" />}
                </span>
              </button>
            ))
          ) : (
            <p className="px-4 py-6 text-sm text-center text-muted-foreground">
              {query ? "No matching todos" : "No todos yet"}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
          <button
            type="button"
            onClick={() => {
              close();
              // Focus the main add input after closing
              setTimeout(() => {
                const input = document.querySelector<HTMLInputElement>('input[placeholder="Add a new todo..."]');
                input?.focus();
              }, 100);
            }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New Task
          </button>
          {todos.some((t) => t.completed) && (
            <button
              type="button"
              onClick={handleClearCompleted}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto"
            >
              Clear Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
