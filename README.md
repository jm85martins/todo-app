# Todo App

A modern todo application built with **Next.js 15**, **TypeScript**, and **shadcn/ui**.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| UI Components | [shadcn/ui](https://ui.shadcn.com) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Icons | [Lucide React](https://lucide.dev) |
| Testing | [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/react) |
| Linting | [ESLint](https://eslint.org) (Next.js config) |

## Project Structure

```
todo-app/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global CSS + Tailwind + CSS variables
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives (Button, Input, Card, …)
│   │   ├── add-todo-form.tsx  # Form component for creating todos
│   │   ├── todo-item.tsx      # Single todo row with toggle & delete
│   │   └── todo-list.tsx      # Filtered list with stats
│   ├── hooks/
│   │   └── use-todos.ts       # Client-side state management hook
│   ├── lib/
│   │   └── utils.ts           # `cn()` helper (clsx + tailwind-merge)
│   └── types/
│       └── todo.ts            # Todo, CreateTodoInput, UpdateTodoInput types
├── __tests__/
│   ├── components/            # Component unit tests
│   └── hooks/                 # Hook unit tests
├── components.json            # shadcn/ui configuration
├── tailwind.config.ts
├── vitest.config.ts
└── vitest.setup.ts
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (or pnpm / yarn)

### Installation

```bash
npm install
```

### Development

Start the Next.js development server with hot-module replacement:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Create an optimised production build:

```bash
npm run build
```

### Run Production Server

Serve the production build locally:

```bash
npm start
```

## Testing

### Run Tests (single pass)

```bash
npm test
```

### Watch Mode

Re-runs affected tests on every file save — great for TDD:

```bash
npm run test:watch
```

### Coverage Report

Generates a coverage report in `coverage/`:

```bash
npm run test:coverage
```

Open `coverage/index.html` to browse the HTML report.

## Linting

```bash
npm run lint
```

## Adding shadcn/ui Components

Add new components from the shadcn registry using the CLI:

```bash
npx shadcn@latest add <component-name>
# e.g.
npx shadcn@latest add dialog
npx shadcn@latest add select
```

Components are written directly into `src/components/ui/` so you own the code and can customise it freely.

## Features

- ✅ Add todos with title, optional description, and priority (low / medium / high)
- ✅ Toggle completion state
- ✅ Delete todos
- ✅ Filter by All / Active / Completed
- ✅ Clear all completed todos at once
- ✅ Live pending / completed counters
- ✅ Accessible (ARIA labels, keyboard navigation)

## Environment Variables

Copy `.env.example` to `.env.local` (when one is provided) and fill in the required values. The boilerplate currently requires no environment variables.
