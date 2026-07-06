import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardHeader } from "@/components/dashboard-header";

// Mock ThemeToggle since it depends on useTheme hook
vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <button aria-label="Switch to dark mode">Toggle</button>,
}));

describe("DashboardHeader", () => {
  it("renders today date in Weekday Month Day format", () => {
    render(<DashboardHeader pendingCount={3} />);
    const today = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(new Date());
    expect(screen.getByText(new RegExp(today))).toBeInTheDocument();
  });

  it("renders pending count in subtitle", () => {
    render(<DashboardHeader pendingCount={5} />);
    expect(screen.getByText(/5 tasks remaining/i)).toBeInTheDocument();
  });

  it("renders a greeting containing morning, afternoon, or evening", () => {
    render(<DashboardHeader pendingCount={0} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toMatch(/morning|afternoon|evening/i);
  });
});
