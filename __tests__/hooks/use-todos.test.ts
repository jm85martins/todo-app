import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTodos } from "@/hooks/use-todos";

describe("useTodos", () => {
  it("initialises with an empty list", () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toHaveLength(0);
  });

  it("initialises with provided todos", () => {
    const initial = [
      {
        id: "1",
        title: "Existing",
        completed: false,
        priority: "medium" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const { result } = renderHook(() => useTodos(initial));
    expect(result.current.todos).toHaveLength(1);
  });

  it("addTodo prepends a new todo to the list", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo({ title: "First", priority: "low" });
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].title).toBe("First");
    expect(result.current.todos[0].completed).toBe(false);
    expect(result.current.todos[0].priority).toBe("low");
  });

  it("addTodo defaults to medium priority", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo({ title: "No priority" });
    });

    expect(result.current.todos[0].priority).toBe("medium");
  });

  it("toggleTodo flips the completed state", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo({ title: "Toggle me" });
    });

    const id = result.current.todos[0].id;

    act(() => {
      result.current.toggleTodo(id);
    });
    expect(result.current.todos[0].completed).toBe(true);

    act(() => {
      result.current.toggleTodo(id);
    });
    expect(result.current.todos[0].completed).toBe(false);
  });

  it("deleteTodo removes the todo from the list", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo({ title: "Delete me" });
    });

    const id = result.current.todos[0].id;

    act(() => {
      result.current.deleteTodo(id);
    });

    expect(result.current.todos).toHaveLength(0);
  });

  it("updateTodo modifies the todo fields", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo({ title: "Original" });
    });

    const id = result.current.todos[0].id;

    act(() => {
      result.current.updateTodo(id, { title: "Updated", priority: "high" });
    });

    expect(result.current.todos[0].title).toBe("Updated");
    expect(result.current.todos[0].priority).toBe("high");
  });

  it("clearCompleted removes only completed todos", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo({ title: "Keep" });
      result.current.addTodo({ title: "Remove" });
    });

    const removeId = result.current.todos[0].id;

    act(() => {
      result.current.toggleTodo(removeId);
    });

    act(() => {
      result.current.clearCompleted();
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].title).toBe("Keep");
  });

  it("completedCount and pendingCount are accurate", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo({ title: "One" });
      result.current.addTodo({ title: "Two" });
      result.current.addTodo({ title: "Three" });
    });

    act(() => {
      result.current.toggleTodo(result.current.todos[0].id);
    });

    expect(result.current.completedCount).toBe(1);
    expect(result.current.pendingCount).toBe(2);
  });

  it("toggleTodo sets completedAt to a Date when marking complete", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo({ title: "Complete me" });
    });

    const id = result.current.todos[0].id;

    act(() => {
      result.current.toggleTodo(id);
    });

    expect(result.current.todos[0].completed).toBe(true);
    expect(result.current.todos[0].completedAt).toBeInstanceOf(Date);
  });

  it("toggleTodo clears completedAt when marking incomplete", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo({ title: "Toggle back" });
    });

    const id = result.current.todos[0].id;

    act(() => {
      result.current.toggleTodo(id);
    });

    expect(result.current.todos[0].completedAt).toBeInstanceOf(Date);

    act(() => {
      result.current.toggleTodo(id);
    });

    expect(result.current.todos[0].completed).toBe(false);
    expect(result.current.todos[0].completedAt).toBeUndefined();
  });
});
