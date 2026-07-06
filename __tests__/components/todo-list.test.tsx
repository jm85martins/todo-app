import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoList } from "@/components/todo-list";
import type { Todo } from "@/types/todo";

const makeTodo = (overrides: Partial<Todo> & { id: string; title: string }): Todo => ({
  id: overrides.id,
  title: overrides.title,
  completed: false,
  priority: "medium",
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-15"),
  ...overrides,
});

const highTodo = makeTodo({ id: "1", title: "High priority task", priority: "high", createdAt: new Date("2024-01-10") });
const mediumTodo = makeTodo({ id: "2", title: "Medium priority task", priority: "medium", createdAt: new Date("2024-01-12") });
const lowTodo = makeTodo({ id: "3", title: "Low priority task", priority: "low", createdAt: new Date("2024-01-14") });

const newerTodo = makeTodo({ id: "4", title: "Newer task", priority: "medium", createdAt: new Date("2024-02-01") });
const olderTodo = makeTodo({ id: "5", title: "Older task", priority: "medium", createdAt: new Date("2024-01-01") });

const defaultProps = {
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
  onClearCompleted: vi.fn(),
  completedCount: 0,
  pendingCount: 3,
  activeFilter: "all" as const,
  sortBy: "createdAt" as const,
  onSortChange: vi.fn(),
  searchQuery: "",
};

describe("TodoList", () => {
  it("sorts todos by priority: high before medium before low", () => {
    render(
      <TodoList
        {...defaultProps}
        todos={[lowTodo, mediumTodo, highTodo]}
        sortBy="priority"
      />
    );

    const items = screen.getAllByTestId("todo-item");
    expect(items[0]).toHaveTextContent("High priority task");
    expect(items[1]).toHaveTextContent("Medium priority task");
    expect(items[2]).toHaveTextContent("Low priority task");
  });

  it("sorts todos by createdAt: newest first by default", () => {
    render(
      <TodoList
        {...defaultProps}
        todos={[olderTodo, newerTodo]}
        sortBy="createdAt"
      />
    );

    const items = screen.getAllByTestId("todo-item");
    expect(items[0]).toHaveTextContent("Newer task");
    expect(items[1]).toHaveTextContent("Older task");
  });

  it("filters todos by searchQuery matching title case-insensitively", () => {
    const todos = [
      makeTodo({ id: "1", title: "Buy groceries" }),
      makeTodo({ id: "2", title: "Walk the dog" }),
    ];
    render(
      <TodoList
        {...defaultProps}
        todos={todos}
        searchQuery="GROCER"
      />
    );

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.queryByText("Walk the dog")).not.toBeInTheDocument();
  });

  it("filters todos by searchQuery matching description", () => {
    const todos = [
      makeTodo({ id: "1", title: "Task one", description: "Important meeting notes" }),
      makeTodo({ id: "2", title: "Task two", description: "Grocery list" }),
    ];
    render(
      <TodoList
        {...defaultProps}
        todos={todos}
        searchQuery="meeting"
      />
    );

    expect(screen.getByText("Task one")).toBeInTheDocument();
    expect(screen.queryByText("Task two")).not.toBeInTheDocument();
  });

  it("renders the premium SVG empty state when no todos match filter", () => {
    render(
      <TodoList
        {...defaultProps}
        todos={[]}
        pendingCount={0}
      />
    );

    expect(screen.getByText("No tasks here yet")).toBeInTheDocument();
    expect(screen.getByText("Add your first task above")).toBeInTheDocument();
  });

  it("calls onSortChange when sort select changes value", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(
      <TodoList
        {...defaultProps}
        todos={[mediumTodo]}
        onSortChange={onSortChange}
      />
    );

    await user.click(screen.getByRole("option", { name: "Priority" }));
    expect(onSortChange).toHaveBeenCalledWith("priority");
  });
});
