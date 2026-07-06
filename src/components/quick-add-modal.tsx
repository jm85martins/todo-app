"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CreateTodoInput, Priority } from "@/types/todo";

interface QuickAddModalProps {
  onAdd: (input: CreateTodoInput) => void;
}

const PRIORITY_OPTIONS: Priority[] = ["low", "medium", "high"];

export function QuickAddModal({ onAdd }: QuickAddModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName;

      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        return;
      }

      if (
        e.key === "N" &&
        e.shiftKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey &&
        !isOpen
      ) {
        const active = document.activeElement;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        if (active !== document.body && active !== null) return;
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Focus input after the current event loop to prevent the N key being typed
      const raf = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), priority });
    setTitle("");
    setPriority("medium");
    setIsOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="quick-add-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick add task"
        className="animate-scale-in w-full max-w-md rounded-2xl bg-background p-6 shadow-card-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">Quick Add Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={inputRef}
            placeholder="What needs to be done?"
            aria-label="Quick add task title"
            data-testid="quick-add-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex gap-2" role="group" aria-label="Priority">
            {PRIORITY_OPTIONS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                aria-pressed={priority === p}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-all",
                  priority === p
                    ? "ring-2 ring-offset-1"
                    : "opacity-60 hover:opacity-100"
                )}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `hsl(var(--priority-${p}))` }}
                />
                {p}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!title.trim()}>
              Add Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
