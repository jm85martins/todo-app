"use client";

import { AddTodoForm } from "@/components/add-todo-form";
import { TodoList } from "@/components/todo-list";
import { useTodos } from "@/hooks/use-todos";

export default function HomePage() {
  const {
    todos,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    completedCount,
    pendingCount,
  } = useTodos();

  return (
    <main className="min-h-screen bg-background flex items-start justify-center p-6 pt-16 sm:pt-20">
      <div className="w-full max-w-xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight">My Tasks</h1>
          <span className="text-xs text-muted-foreground">
            {pendingCount} remaining · {completedCount} done
          </span>
        </div>
        <AddTodoForm onAdd={addTodo} />
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onEdit={updateTodo}
          onClearCompleted={clearCompleted}
          completedCount={completedCount}
          pendingCount={pendingCount}
        />
      </div>
    </main>
  );
}
