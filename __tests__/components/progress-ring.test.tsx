import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressRing } from "@/components/progress-ring";

describe("ProgressRing", () => {
  it("renders with correct aria-label for value 75", () => {
    render(<ProgressRing value={75} />);
    expect(screen.getByRole("img", { name: "75% complete" })).toBeInTheDocument();
  });

  it("renders with correct aria-label for value 0", () => {
    render(<ProgressRing value={0} />);
    expect(screen.getByRole("img", { name: "0% complete" })).toBeInTheDocument();
  });
});
