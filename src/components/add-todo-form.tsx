"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { CreateTodoInput, Priority } from "@/types/todo";

interface AddTodoFormProps {
  onAdd: (input: CreateTodoInput) => void;
}

const priorityOptions: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({ title, description: description || undefined, priority });
    setTitle("");
    setDescription("");
    setPriority("medium");
    setIsExpanded(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Add a new todo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          aria-label="Todo title"
          className="flex-1"
        />
        <Button type="submit" disabled={!title.trim()} aria-label="Add">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-3 rounded-md border bg-card p-4">
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
                  className={[
                    "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                    priority === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "border bg-background hover:bg-accent",
                  ].join(" ")}
                  aria-pressed={priority === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
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
            <Button type="submit" size="sm" disabled={!title.trim()}>
              Add Todo
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
