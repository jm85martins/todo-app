export const meta = {
  name: 'sdlc-loop',
  description: 'Loop engineering SDLC — pick task from GitHub Projects, discover, build, review, QA',
  phases: [
    { title: 'Pick Task', detail: 'Find next Todo item on the kanban board' },
    { title: 'Discovery', detail: 'Research task and write technical spec' },
    { title: 'Build', detail: 'Implement code from spec and open PR' },
    { title: 'Review', detail: 'Code review against spec and conventions' },
    { title: 'QA', detail: 'Validate implementation and acceptance criteria' },
  ],
}

// Args: { projectNumber, owner, repo, specFieldId, statusFieldId, statusOptions }
// statusOptions: { todo, discovery, readyToBuild, inProgress, review, qa, done }
const { projectNumber, owner, repo, specFieldId, statusFieldId, statusOptions } = args

// ── Helpers ─────────────────────────────────────────────────────────────────

const TASK_SCHEMA = {
  type: 'object',
  properties: {
    itemId: { type: 'string', description: 'GitHub Projects item node ID' },
    issueNumber: { type: 'number' },
    issueTitle: { type: 'string' },
    issueBody: { type: 'string' },
    issueUrl: { type: 'string' },
    found: { type: 'boolean', description: 'false if no Todo items exist' },
  },
  required: ['found'],
}

const DISCOVERY_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string', description: 'One paragraph plain-English summary of the change' },
    technicalSpec: { type: 'string', description: 'Detailed implementation plan in markdown' },
    filesToModify: { type: 'array', items: { type: 'string' }, description: 'Relative file paths' },
    acceptanceCriteria: { type: 'array', items: { type: 'string' } },
    risks: { type: 'string', description: 'Known risks or unknowns' },
  },
  required: ['summary', 'technicalSpec', 'acceptanceCriteria', 'filesToModify'],
}

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    approved: { type: 'boolean' },
    findings: { type: 'array', items: { type: 'string' }, description: 'Specific issues found' },
    verdict: { type: 'string', description: 'Short summary of decision' },
  },
  required: ['approved', 'verdict', 'findings'],
}

const QA_SCHEMA = {
  type: 'object',
  properties: {
    passed: { type: 'boolean' },
    testsRun: { type: 'array', items: { type: 'string' } },
    failures: { type: 'array', items: { type: 'string' } },
    verdict: { type: 'string' },
  },
  required: ['passed', 'verdict'],
}

const moveItem = (itemId, statusOptionId, label) =>
  agent(
    `Move GitHub Projects item to a new status column.

    Run this command exactly:
    gh project item-edit \\
      --id "${itemId}" \\
      --project-id ${projectNumber} \\
      --field-id "${statusFieldId}" \\
      --single-select-option-id "${statusOptionId}"

    Confirm the command succeeded. If it errors, report the error output.`,
    { label, phase: 'Pick Task' }
  )

// ── Phase 1: Pick Task ───────────────────────────────────────────────────────
phase('Pick Task')
log('Checking GitHub Projects board for next Todo item...')

const task = await agent(
  `Find the next task to work on from a GitHub Projects board.

  Run:
    gh project item-list ${projectNumber} --owner ${owner} --format json --limit 100

  The JSON output has an "items" array. Each item has:
  - "id": the item node ID
  - "status": the column/status name
  - "content": contains "number", "title", "body", "url" for linked issues

  Find the FIRST item where status is exactly "Todo".

  If found, return: found=true, itemId, issueNumber, issueTitle, issueBody, issueUrl.
  If none found, return: found=false.`,
  { label: 'pick-task', phase: 'Pick Task', schema: TASK_SCHEMA }
)

if (!task || !task.found) {
  log('No Todo items found — board is clear.')
  return { status: 'idle', message: 'No tasks in Todo column' }
}

log(`Picked: #${task.issueNumber} — ${task.issueTitle}`)

await moveItem(task.itemId, statusOptions.discovery, 'move-to-discovery')

// ── Phase 2: Discovery ───────────────────────────────────────────────────────
phase('Discovery')
log(`Running discovery for issue #${task.issueNumber}...`)

const spec = await agent(
  `You are a discovery and research agent for a software project.

  Your task is to deeply research this issue and produce a concrete technical spec
  that a builder agent can implement without needing additional context.

  Issue #${task.issueNumber}: ${task.issueTitle}
  Description:
  ${task.issueBody || '(no description provided)'}

  Repo: ${owner}/${repo}

  Steps:
  1. Read the relevant parts of the codebase — check src/, __tests__/, package.json, CLAUDE.md
  2. Use grep/find to locate related code patterns and conventions
  3. Identify exactly which files need to change and how
  4. If external library docs are needed, search the web
  5. Write acceptance criteria that are specific and testable
  6. Note any risks or ambiguities

  Be as specific as possible. Include code snippets in the technicalSpec where helpful.
  The builder agent sees ONLY your output — leave nothing ambiguous.`,
  { label: 'discovery', phase: 'Discovery', schema: DISCOVERY_SCHEMA }
)

log(`Discovery done. Files: ${spec.filesToModify.join(', ')}`)

// Write spec to the GitHub Projects custom field
await agent(
  `Write a technical spec to a custom field on a GitHub Projects item.

  Run:
    gh project item-edit \\
      --id "${task.itemId}" \\
      --project-id ${projectNumber} \\
      --field-id "${specFieldId}" \\
      --text "SPEC_CONTENT"

  Replace SPEC_CONTENT with the following (escape double quotes as needed):

  ## ${task.issueTitle}

  **Summary:** ${spec.summary}

  ### Technical Spec
  ${spec.technicalSpec}

  ### Files to Modify
  ${spec.filesToModify.map(f => `- ${f}`).join('\n')}

  ### Acceptance Criteria
  ${spec.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

  ### Risks
  ${spec.risks || 'None identified'}`,
  { label: 'write-spec-field', phase: 'Discovery' }
)

// Also post spec as an issue comment for visibility
await agent(
  `Post a comment on GitHub issue #${task.issueNumber} in repo ${owner}/${repo}.

  Use:
    gh issue comment ${task.issueNumber} --repo ${owner}/${repo} --body "BODY"

  The body should be this markdown (escape quotes as needed):

  ## Discovery Spec

  **Summary:** ${spec.summary}

  ### Technical Plan
  ${spec.technicalSpec}

  ### Files to Modify
  ${spec.filesToModify.map(f => `- \`${f}\``).join('\n')}

  ### Acceptance Criteria
  ${spec.acceptanceCriteria.map((c, i) => `- [ ] ${c}`).join('\n')}

  ### Risks
  ${spec.risks || 'None identified'}

  ---
  _Written by the SDLC Discovery Agent_`,
  { label: 'post-spec-comment', phase: 'Discovery' }
)

await moveItem(task.itemId, statusOptions.readyToBuild, 'move-to-ready')

// ── Phase 3: Build ───────────────────────────────────────────────────────────
phase('Build')
log('Builder agent starting implementation...')

await moveItem(task.itemId, statusOptions.inProgress, 'move-to-in-progress')

const branchName = `feature/issue-${task.issueNumber}`

const buildOutput = await agent(
  `You are a builder agent. Implement the following GitHub issue as production-ready code.

  Issue #${task.issueNumber}: ${task.issueTitle}
  Branch to create: ${branchName}
  Repo: ${owner}/${repo}

  === TECHNICAL SPEC ===
  ${spec.technicalSpec}

  === FILES TO MODIFY ===
  ${spec.filesToModify.join('\n')}

  === ACCEPTANCE CRITERIA ===
  ${spec.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

  Steps:
  1. Create branch: git checkout -b ${branchName}
  2. Read and understand each file listed before editing
  3. Implement the changes exactly per the spec — no extra features
  4. Follow existing code conventions (check nearby files for patterns)
  5. Run the test suite to verify nothing breaks: npm test
  6. Fix any test failures before continuing
  7. Commit all changes with a descriptive message referencing #${task.issueNumber}
  8. Push: git push -u origin ${branchName}
  9. Open PR:
     gh pr create \\
       --repo ${owner}/${repo} \\
       --title "${task.issueTitle}" \\
       --body "## What\n\nImplementation of #${task.issueNumber}\n\nCloses #${task.issueNumber}\n\n## Acceptance Criteria\n\n${spec.acceptanceCriteria.map(c => `- [ ] ${c}`).join('\n')}"
  10. Output the PR URL at the end

  Do not skip tests. Do not add unrelated changes.`,
  { label: 'build', phase: 'Build', isolation: 'worktree' }
)

const prUrl = await agent(
  `Extract the GitHub PR URL from this text. Return only the URL (starting with https://github.com), nothing else.

  Text:
  ${buildOutput}`,
  { label: 'extract-pr-url', phase: 'Build' }
)

log(`PR opened: ${prUrl}`)
await moveItem(task.itemId, statusOptions.review, 'move-to-review')

// ── Phase 4: Review ──────────────────────────────────────────────────────────
phase('Review')
log(`Reviewing ${prUrl}...`)

const review = await agent(
  `You are a code review agent. Review this pull request rigorously.

  PR: ${prUrl}
  Issue: #${task.issueNumber} — ${task.issueTitle}

  Acceptance Criteria (all must be met to approve):
  ${spec.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

  Steps:
  1. Read the full diff: gh pr diff --repo ${owner}/${repo} $(gh pr view "${prUrl}" --json number -q .number)
  2. Read each modified file in full for context
  3. Check each acceptance criterion — mark pass/fail
  4. Look for: logic bugs, missing error handling, security issues, test coverage gaps, style violations
  5. Post specific inline comments for each finding:
     gh pr review PR_NUMBER --repo ${owner}/${repo} --comment -b "COMMENT"
  6. If all criteria pass and no blocking issues: approve with gh pr review --approve
  7. If any criterion fails or blocking issue found: request changes with gh pr review --request-changes

  Be thorough. A finding with a file and line reference is more useful than a vague note.`,
  { label: 'review', phase: 'Review', schema: REVIEW_SCHEMA }
)

log(`Review verdict: ${review.verdict}`)

if (!review.approved) {
  log(`Changes requested. Bouncing #${task.issueNumber} back to Todo.`)
  await agent(
    `Post a comment on PR ${prUrl} summarizing why it was bounced back:

    Findings:
    ${review.findings.map(f => `- ${f}`).join('\n')}

    Use: gh pr comment PR_NUMBER --repo ${owner}/${repo} --body "BODY"`,
    { label: 'review-bounce-comment', phase: 'Review' }
  )
  await moveItem(task.itemId, statusOptions.todo, 'bounce-to-todo')
  return {
    status: 'changes-requested',
    issue: task.issueNumber,
    pr: prUrl,
    findings: review.findings,
  }
}

log('Review approved. Moving to QA...')

// ── Phase 5: QA ──────────────────────────────────────────────────────────────
phase('QA')
await moveItem(task.itemId, statusOptions.qa, 'move-to-qa')

const qa = await agent(
  `You are a QA agent. Validate this implementation end-to-end.

  PR: ${prUrl}
  Issue: #${task.issueNumber} — ${task.issueTitle}

  Acceptance Criteria:
  ${spec.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

  Steps:
  1. Check out the PR branch locally:
     gh pr checkout $(gh pr view "${prUrl}" --json number -q .number) --repo ${owner}/${repo}
  2. Install dependencies if needed: npm install
  3. Run the full test suite: npm test — note pass/fail
  4. Start the dev server and manually verify the golden path for this feature
  5. Verify EACH acceptance criterion passes — test it directly, don't assume
  6. Check for regressions: does existing functionality still work?
  7. Post a QA report as a PR comment

  Report what you tested, what passed, and what failed with specifics.`,
  { label: 'qa', phase: 'QA', schema: QA_SCHEMA }
)

log(`QA verdict: ${qa.verdict}`)

if (!qa.passed) {
  log(`QA failed. Bouncing #${task.issueNumber} back to In Progress.`)
  await agent(
    `Post a QA failure report on PR ${prUrl}.

    Failures:
    ${(qa.failures || []).map(f => `- ${f}`).join('\n')}

    Use: gh pr comment PR_NUMBER --repo ${owner}/${repo} --body "## QA Report — FAILED\n\nFAILURES"`,
    { label: 'qa-fail-comment', phase: 'QA' }
  )
  await moveItem(task.itemId, statusOptions.inProgress, 'bounce-to-in-progress')
  return {
    status: 'qa-failed',
    issue: task.issueNumber,
    pr: prUrl,
    failures: qa.failures,
  }
}

// Merge and close
await agent(
  `Merge the PR and mark the task done.

  1. Merge: gh pr merge --squash --auto --repo ${owner}/${repo} $(gh pr view "${prUrl}" --json number -q .number)
  2. Post a closing comment on issue #${task.issueNumber}:
     gh issue comment ${task.issueNumber} --repo ${owner}/${repo} --body "Implemented and merged via ${prUrl}. All acceptance criteria verified by QA."`,
  { label: 'merge-and-close', phase: 'QA' }
)

await moveItem(task.itemId, statusOptions.done, 'move-to-done')

log(`Issue #${task.issueNumber} complete!`)
return {
  status: 'done',
  issue: task.issueNumber,
  pr: prUrl,
  testsRun: qa.testsRun,
}
