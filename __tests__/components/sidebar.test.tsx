import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "@/components/sidebar";

describe("Sidebar", () => {
  const defaultProps = {
    activeFilter: "all" as const,
    onFilterChange: vi.fn(),
    pendingCount: 3,
    completedCount: 2,
  };

  it("renders All Tasks, Active, Completed nav items", () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText("All Tasks")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("marks active filter item with aria-current='page'", () => {
    render(<Sidebar {...defaultProps} activeFilter="active" />);
    const activeButton = screen.getByRole("button", { name: /Active/i });
    expect(activeButton).toHaveAttribute("aria-current", "page");

    const allButton = screen.getByRole("button", { name: /All Tasks/i });
    expect(allButton).not.toHaveAttribute("aria-current", "page");
  });

  it("calls onFilterChange when nav item is clicked", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(<Sidebar {...defaultProps} onFilterChange={onFilterChange} />);

    await user.click(screen.getByRole("button", { name: /Completed/i }));
    expect(onFilterChange).toHaveBeenCalledWith("completed");
  });
});
