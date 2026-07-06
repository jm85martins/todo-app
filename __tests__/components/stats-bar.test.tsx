import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsBar } from "@/components/stats-bar";

describe("StatsBar", () => {
  it("renders pending count", () => {
    render(<StatsBar pendingCount={5} completedCount={2} totalCount={7} />);
    const statuses = screen.getAllByRole("status");
    const pendingCard = statuses.find((el) => el.textContent?.includes("Pending"));
    expect(pendingCard).toHaveTextContent("5");
  });

  it("renders completed count", () => {
    render(<StatsBar pendingCount={5} completedCount={2} totalCount={7} />);
    const statuses = screen.getAllByRole("status");
    const completedCard = statuses.find((el) => el.textContent?.includes("Completed"));
    expect(completedCard).toHaveTextContent("2");
  });

  it("renders total count", () => {
    render(<StatsBar pendingCount={5} completedCount={2} totalCount={7} />);
    const statuses = screen.getAllByRole("status");
    const totalCard = statuses.find((el) => el.textContent?.includes("Total"));
    expect(totalCard).toHaveTextContent("7");
  });
});
