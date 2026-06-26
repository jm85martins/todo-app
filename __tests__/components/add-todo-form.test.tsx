import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddTodoForm } from "@/components/add-todo-form";

describe("AddTodoForm", () => {
  it("renders the title input and submit button", () => {
    render(<AddTodoForm onAdd={vi.fn()} />);
    expect(screen.getByPlaceholderText("Add a new todo...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("calls onAdd with the entered title when the form is submitted", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddTodoForm onAdd={onAdd} />);

    await user.type(screen.getByPlaceholderText("Add a new todo..."), "Buy groceries");
    // After typing the panel expands; click the explicit "Add Todo" button inside it
    await user.click(screen.getByRole("button", { name: "Add Todo" }));

    expect(onAdd).toHaveBeenCalledOnce();
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Buy groceries", priority: "medium" })
    );
  });

  it("does not call onAdd when title is empty", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddTodoForm onAdd={onAdd} />);

    // The icon button is disabled when title is blank
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("clears the input after a successful submission", async () => {
    const user = userEvent.setup();
    render(<AddTodoForm onAdd={vi.fn()} />);

    const input = screen.getByPlaceholderText("Add a new todo...");
    await user.type(input, "Walk the dog");
    await user.click(screen.getByRole("button", { name: "Add Todo" }));

    expect(input).toHaveValue("");
  });

  it("expands options panel on input focus", async () => {
    const user = userEvent.setup();
    render(<AddTodoForm onAdd={vi.fn()} />);

    expect(screen.queryByLabelText("Description (optional)")).not.toBeInTheDocument();
    await user.click(screen.getByPlaceholderText("Add a new todo..."));
    expect(screen.getByLabelText("Description (optional)")).toBeInTheDocument();
  });
});
