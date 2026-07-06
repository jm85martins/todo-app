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
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getByText("Write tests")).toBeInTheDocument();
  });

  it("renders the todo description when provided", () => {
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(
      screen.getByText("Add unit tests for the components")
    ).toBeInTheDocument();
  });

  it("renders the priority badge", () => {
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getByLabelText("Priority: high")).toBeInTheDocument();
  });

  it("edit and delete buttons are visible without hover", () => {
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    const deleteBtn = screen.getByRole("button", { name: /delete/i });
    expect(deleteBtn).not.toHaveClass("opacity-0");
  });

  it("shows the checkbox as unchecked when todo is not completed", () => {
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("shows the checkbox as checked when todo is completed", () => {
    const completedTodo: Todo = { ...baseTodo, completed: true };
    render(
      <TodoItem todo={completedTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("calls onToggle with the todo id when checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<TodoItem todo={baseTodo} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />);

    await user.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledOnce();
    expect(onToggle).toHaveBeenCalledWith("1");
  });

  it("calls onDelete with the todo id when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith("1");
  });

  describe("edit mode", () => {
    it("renders an edit button with accessible label", () => {
      render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
      expect(screen.getByRole("button", { name: /edit "write tests"/i })).toBeInTheDocument();
    });

    it("switches to edit mode when edit button is clicked", async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
      await user.click(screen.getByRole("button", { name: /edit/i }));
      expect(screen.getByTestId("edit-title-input")).toBeInTheDocument();
    });

    it("pre-populates edit fields with the current todo values", async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
      await user.click(screen.getByRole("button", { name: /edit/i }));
      expect(screen.getByTestId("edit-title-input")).toHaveValue("Write tests");
      expect(screen.getByTestId("edit-description-input")).toHaveValue("Add unit tests for the components");
      // "High" priority button should be pressed
      expect(screen.getByRole("button", { name: "High" })).toHaveAttribute("aria-pressed", "true");
    });

    it("calls onEdit with updated values when Save is clicked", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);
      await user.click(screen.getByRole("button", { name: /edit/i }));
      await user.clear(screen.getByTestId("edit-title-input"));
      await user.type(screen.getByTestId("edit-title-input"), "Updated title");
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(onEdit).toHaveBeenCalledOnce();
      expect(onEdit).toHaveBeenCalledWith("1", expect.objectContaining({ title: "Updated title" }));
    });

    it("does not call onEdit when Save is clicked with an empty title", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);
      await user.click(screen.getByRole("button", { name: /edit/i }));
      await user.clear(screen.getByTestId("edit-title-input"));
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
      expect(onEdit).not.toHaveBeenCalled();
    });

    it("exits edit mode after saving", async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
      await user.click(screen.getByRole("button", { name: /edit/i }));
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(screen.queryByTestId("edit-title-input")).not.toBeInTheDocument();
    });

    it("exits edit mode without calling onEdit when Cancel is clicked", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);
      await user.click(screen.getByRole("button", { name: /edit/i }));
      await user.click(screen.getByRole("button", { name: "Cancel" }));
      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.queryByTestId("edit-title-input")).not.toBeInTheDocument();
    });

    it("exits edit mode without saving when Escape is pressed", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);
      await user.click(screen.getByRole("button", { name: /edit/i }));
      await user.keyboard("{Escape}");
      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.queryByTestId("edit-title-input")).not.toBeInTheDocument();
    });

    it("saves when Enter is pressed in the title input", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);
      await user.click(screen.getByRole("button", { name: /edit/i }));
      await user.clear(screen.getByTestId("edit-title-input"));
      await user.type(screen.getByTestId("edit-title-input"), "Keyboard save{Enter}");
      expect(onEdit).toHaveBeenCalledOnce();
    });

    it("allows changing priority in edit mode", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);
      await user.click(screen.getByRole("button", { name: /edit/i }));
      await user.click(screen.getByRole("button", { name: "Low" }));
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(onEdit).toHaveBeenCalledWith("1", expect.objectContaining({ priority: "low" }));
    });
  });
});
