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
  projectNumber: YOUR_PROJECT_NUMBER,
  owner: 'jm85martins',
  repo: 'todo-app',
  specFieldId: 'SPEC_FIELD_ID',
  statusFieldId: 'STATUS_FIELD_ID',
  statusOptions: {
    todo: 'TODO_OPTION_ID',
    discovery: 'DISCOVERY_OPTION_ID',
    readyToBuild: 'READY_OPTION_ID',
    inProgress: 'IN_PROGRESS_OPTION_ID',
    review: 'REVIEW_OPTION_ID',
    qa: 'QA_OPTION_ID',
    done: 'DONE_OPTION_ID',
  }
}})
```

Get IDs with:
```
gh project list --owner jm85martins
gh project field-list PROJECT_NUMBER --owner jm85martins --format json
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
