import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuickAddModal } from "@/components/quick-add-modal";

describe("QuickAddModal", () => {
  it("does not render when closed", () => {
    render(<QuickAddModal onAdd={vi.fn()} />);
    expect(screen.queryByTestId("quick-add-modal")).not.toBeInTheDocument();
  });

  it("renders on Shift+N when body is focused", async () => {
    const user = userEvent.setup();
    render(<QuickAddModal onAdd={vi.fn()} />);

    // Ensure body is focused
    document.body.focus();
    await user.keyboard("{Shift>}N{/Shift}");

    expect(screen.getByTestId("quick-add-modal")).toBeInTheDocument();
  });

  it("closes on Escape keydown", async () => {
    const user = userEvent.setup();
    render(<QuickAddModal onAdd={vi.fn()} />);

    document.body.focus();
    await user.keyboard("{Shift>}N{/Shift}");
    expect(screen.getByTestId("quick-add-modal")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByTestId("quick-add-modal")).not.toBeInTheDocument();
  });

  it("calls onAdd with title and medium priority on submit", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<QuickAddModal onAdd={onAdd} />);

    document.body.focus();
    await user.keyboard("{Shift>}N{/Shift}");

    const input = screen.getByTestId("quick-add-title-input");
    await user.type(input, "Quick task");
    await user.click(screen.getByRole("button", { name: "Add Task" }));

    expect(onAdd).toHaveBeenCalledWith({ title: "Quick task", priority: "medium" });
  });

  it("does not call onAdd when title is empty", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<QuickAddModal onAdd={onAdd} />);

    document.body.focus();
    await user.keyboard("{Shift>}N{/Shift}");

    const submitBtn = screen.getByRole("button", { name: "Add Task" });
    expect(submitBtn).toBeDisabled();
    expect(onAdd).not.toHaveBeenCalled();
  });
});
