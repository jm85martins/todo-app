import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '@/components/theme-toggle';
import { ThemeProvider } from '@/components/theme-provider';

function WrappedThemeToggle() {
  return (
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

describe('ThemeToggle', () => {
  it('renders with accessible label', () => {
    render(<WrappedThemeToggle />);
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });
  it('toggles dark class on documentElement when clicked', async () => {
    const user = userEvent.setup();
    render(<WrappedThemeToggle />);
    await user.click(screen.getByRole('button'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
  it('persists preference to localStorage', async () => {
    const user = userEvent.setup();
    render(<WrappedThemeToggle />);
    await user.click(screen.getByRole('button'));
    expect(localStorage.getItem('todo-theme')).toBe('dark');
  });
});
