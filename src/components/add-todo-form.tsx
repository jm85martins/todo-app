"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CreateTodoInput, Priority } from "@/types/todo";

interface AddTodoFormProps {
  onAdd: (input: CreateTodoInput) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const priorityOptions: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function AddTodoForm({ onAdd, inputRef }: AddTodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [isExpanded, setIsExpanded] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title,
      description: description || undefined,
      priority,
      dueDate: dueDate || undefined,
      label: label || undefined,
      category: category || undefined,
    });
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setLabel("");
    setCategory("");
    setIsExpanded(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          placeholder="Add a new todo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          aria-label="Todo title"
          className="flex-1 rounded-full border-2 focus:border-primary transition-colors h-12 px-5"
        />
        <Button type="submit" disabled={!title.trim()} aria-label="Add" className="rounded-full">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-3 glass-card rounded-2xl p-4 animate-scale-in">
          <div className="space-y-1">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="priority">Priority</Label>
            <div id="priority" className="flex gap-2" role="group" aria-label="Priority">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-all",
                    priority === opt.value
                      ? "ring-2 ring-offset-1"
                      : "opacity-60 hover:opacity-100"
                  )}
                  aria-pressed={priority === opt.value}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: `hsl(var(--priority-${opt.value}))` }}
                  />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="due-date">Due date</Label>
            <input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label="Due date"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              placeholder="Label (optional)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="Category (optional)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!title.trim()}
              className="gradient-primary text-white border-0 rounded-xl"
            >
              Add Todo
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
