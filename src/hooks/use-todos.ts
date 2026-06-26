"use client";

import { useState, useCallback } from "react";
import type { Todo, CreateTodoInput, UpdateTodoInput } from "@/types/todo";

function generateId(): string {
  return crypto.randomUUID();
}

export function useTodos(initialTodos: Todo[] = []) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);

  const addTodo = useCallback((input: CreateTodoInput): Todo => {
    const now = new Date();
    const todo: Todo = {
      id: generateId(),
      title: input.title.trim(),
      description: input.description?.trim(),
      completed: false,
      priority: input.priority ?? "medium",
      createdAt: now,
      updatedAt: now,
    };
    setTodos((prev) => [todo, ...prev]);
    return todo;
  }, []);

  const updateTodo = useCallback(
    (id: string, input: UpdateTodoInput): void => {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id
            ? { ...todo, ...input, updatedAt: new Date() }
            : todo
        )
      );
    },
    []
  );

  const deleteTodo = useCallback((id: string): void => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const toggleTodo = useCallback((id: string): void => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
          : todo
      )
    );
  }, []);

  const clearCompleted = useCallback((): void => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  }, []);

  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = todos.filter((t) => !t.completed).length;

  return {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    completedCount,
    pendingCount,
  };
}
