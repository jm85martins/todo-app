# Todo App — Claude Code Instructions

## Project

Next.js 15 todo app (TypeScript, shadcn/ui, Vitest).

## Commands

- `npm run dev` — start dev server (port 3000)
- `npm test` — run Vitest test suite
- `npm run build` — production build
- `npm run lint` — ESLint

## SDLC Agent Behavior

This project uses an automated loop engineering SDLC. The workflow is in `.claude/workflows/sdlc-loop.js`.

### Running the loop

```
Workflow({ name: 'sdlc-loop', args: {
  projectNumber: 1,
  owner: 'jm85martins',
  repo: 'todo-app',
  specFieldId: 'PVTF_lAHOAIQdQ84BcYfJzhXB1vg',
  statusFieldId: 'PVTSSF_lAHOAIQdQ84BcYfJzhXBvtY',
  statusOptions: {
    todo:         '61e4505c',
    discovery:    'b2945f80',
    readyToBuild: '47fc9ee4',
    inProgress:   'df73e18b',
    review:       '98236657',
    qa:           'a19c13b3',
    done:         '189078dd',
  }
}})
```

### Discovery Agent

- Always read existing similar code before writing the spec — never assume structure
- Check `src/`, `__tests__/`, `package.json` as starting points
- Acceptance criteria must be specific and testable (not "it works")
- Leave nothing ambiguous — the builder sees only your output

### Builder Agent

- Follow existing code conventions — read nearby files before editing
- Branch naming: `feature/issue-{N}`
- One logical commit per change; reference the issue number in the message
- Run `npm test` before pushing — fix failures before opening the PR
- Do not add features or changes beyond the spec

### Review Agent

- Reject (request changes) if any acceptance criterion is unmet
- Post specific line-level comments, not vague summaries
- Check for: logic bugs, missing error handling, security issues, test coverage gaps
- Approve only when all criteria are verifiably met

### QA Agent

- Must start the dev server and test the golden path manually — tests alone are not enough
- Verify each acceptance criterion explicitly — do not assume
- Check for regressions in unrelated features
- Merge only after all criteria pass
