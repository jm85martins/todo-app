import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItem } from "@/components/todo-item";
import type { Todo } from "@/types/todo";

const baseTodo: Todo = {
  id: "1",
  title: "Write tests",
  description: "Add unit tests for the components",
  completed: false,
  priority: "high",
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-15"),
};

describe("TodoItem", () => {
  it("renders the todo title", () => {
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Write tests")).toBeInTheDocument();
  });

  it("renders the todo description when provided", () => {
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(
      screen.getByText("Add unit tests for the components")
    ).toBeInTheDocument();
  });

  it("renders the priority badge", () => {
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("high")).toBeInTheDocument();
  });

  it("shows the checkbox as unchecked when todo is not completed", () => {
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("shows the checkbox as checked when todo is completed", () => {
    const completedTodo: Todo = { ...baseTodo, completed: true };
    render(
      <TodoItem todo={completedTodo} onToggle={vi.fn()} onDelete={vi.fn()} />
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("calls onToggle with the todo id when checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<TodoItem todo={baseTodo} onToggle={onToggle} onDelete={vi.fn()} />);

    await user.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledOnce();
    expect(onToggle).toHaveBeenCalledWith("1");
  });

  it("calls onDelete with the todo id when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith("1");
  });
});
