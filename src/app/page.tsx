"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddTodoForm } from "@/components/add-todo-form";
import { TodoList } from "@/components/todo-list";
import { useTodos } from "@/hooks/use-todos";

export default function HomePage() {
  const {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    completedCount,
    pendingCount,
  } = useTodos();

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Todo App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <AddTodoForm onAdd={addTodo} />
            <TodoList
              todos={todos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onClearCompleted={clearCompleted}
              completedCount={completedCount}
              pendingCount={pendingCount}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
