export const meta = {
  name: 'sdlc-loop',
  description: 'Loop engineering SDLC — pick task from GitHub Projects, discover, build, review, QA',
  phases: [
    { title: 'Pick Task',  detail: 'Find next Todo item on the kanban board' },
    { title: 'Discovery',  detail: 'Research task and write technical spec' },
    { title: 'Build',      detail: 'Implement code from spec and open PR' },
    { title: 'Review',     detail: 'Code review against spec and conventions' },
    { title: 'QA',         detail: 'Validate implementation and acceptance criteria' },
  ],
}

// Config — hardcoded defaults for this repo; pass args to override any value
const cfg = args || {}
const projectNumber  = cfg.projectNumber  || 1
const owner          = cfg.owner          || 'jm85martins'
const repo           = cfg.repo           || 'todo-app'
const specFieldId    = cfg.specFieldId    || 'PVTF_lAHOAIQdQ84BcYfJzhXB1vg'
const statusFieldId  = cfg.statusFieldId  || 'PVTSSF_lAHOAIQdQ84BcYfJzhXBvtY'
const statusOptions  = cfg.statusOptions  || {
  todo:         '61e4505c',
  discovery:    'b2945f80',
  readyToBuild: '47fc9ee4',
  inProgress:   'df73e18b',
  review:       '98236657',
  qa:           'a19c13b3',
  done:         '189078dd',
}

const MAX_ITERATIONS = 3

// ── Schemas ───────────────────────────────────────────────────────────────────

const TASK_SCHEMA = {
  type: 'object',
  properties: {
    itemId:      { type: 'string', description: 'GitHub Projects item node ID' },
    issueNumber: { type: 'number' },
    issueTitle:  { type: 'string' },
    issueBody:   { type: 'string' },
    issueUrl:    { type: 'string' },
    found:       { type: 'boolean', description: 'false if no Todo items exist' },
  },
  required: ['found'],
}

const DISCOVERY_SCHEMA = {
  type: 'object',
  properties: {
    summary:            { type: 'string' },
    technicalSpec:      { type: 'string' },
    filesToModify:      { type: 'array', items: { type: 'string' } },
    acceptanceCriteria: { type: 'array', items: { type: 'string' } },
    risks:              { type: 'string' },
  },
  required: ['summary', 'technicalSpec', 'acceptanceCriteria', 'filesToModify'],
}

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    approved: { type: 'boolean' },
    findings: { type: 'array', items: { type: 'string' } },
    verdict:  { type: 'string' },
  },
  required: ['approved', 'verdict', 'findings'],
}

const QA_SCHEMA = {
  type: 'object',
  properties: {
    passed:   { type: 'boolean' },
    testsRun: { type: 'array', items: { type: 'string' } },
    failures: { type: 'array', items: { type: 'string' } },
    verdict:  { type: 'string' },
  },
  required: ['passed', 'verdict'],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Move the kanban card — called directly from the orchestrator so moves happen
// immediately and deterministically, not buried inside agent instructions.
const moveCard = (itemId, statusOptionId, label, phaseName) =>
  agent(
    `Run this exact shell command and confirm it succeeds (exit 0):
gh project item-edit --id "${itemId}" --project-id ${projectNumber} --field-id "${statusFieldId}" --single-select-option-id "${statusOptionId}"`,
    { label, phase: phaseName }
  )

// Fire-and-forget — comments are informational and must not block phase work.
const postComment = (issueNumber, body) => {
  agent(
    `Post this comment on GitHub issue #${issueNumber} in repo ${owner}/${repo}.
    Write the body to a temp file to avoid escaping issues, then post:

    cat > /tmp/sdlc-comment.md << 'ENDOFBODY'
${body}
ENDOFBODY
    gh issue comment ${issueNumber} --repo ${owner}/${repo} --body-file /tmp/sdlc-comment.md`,
    { label: 'comment-' + issueNumber, phase: 'Pick Task' }
  )
}

// ── Phase 1: Pick Task ────────────────────────────────────────────────────────
phase('Pick Task')
log('Checking GitHub Projects board for next Todo item...')

const task = await agent(
  `Find the next task from a GitHub Projects board.

  Run:
    gh project item-list ${projectNumber} --owner ${owner} --format json --limit 100

  Parse the JSON. Find the FIRST item where "status" is exactly "Todo".

  If found, return: found=true, itemId (the "id" field), issueNumber (content.number),
  issueTitle (content.title), issueBody (content.body), issueUrl (content.url).
  If none found, return: found=false.`,
  { label: 'pick-task', phase: 'Pick Task', schema: TASK_SCHEMA }
)

if (!task || !task.found) {
  log('No Todo items found — board is clear.')
  return { status: 'idle', message: 'No tasks in Todo column' }
}

log(`Picked: #${task.issueNumber} — ${task.issueTitle}`)

// ── Phase 2: Discovery ────────────────────────────────────────────────────────
phase('Discovery')
log(`Running discovery for issue #${task.issueNumber}...`)

// Move to Discovery now, before spawning the agent.
await moveCard(task.itemId, statusOptions.discovery, 'move-to-discovery', 'Discovery')

const spec = await agent(
  `You are a discovery and research agent for a software project.

  Analyze this GitHub issue and produce a concrete technical spec that a builder
  agent can implement without needing additional context.

  Issue #${task.issueNumber}: ${task.issueTitle}
  Description: ${task.issueBody || '(no description provided)'}
  Repo: ${owner}/${repo} (local path: /Users/jorgemartins/devs/todo-app)

  Steps:
  1. Read the codebase: src/, __tests__/, package.json, CLAUDE.md
  2. Understand existing patterns — components, state management, data flow
  3. Identify exactly which files need to change and how
  4. Write acceptance criteria that are specific and testable
  5. Note any risks or ambiguities
  6. Write the spec to the project Spec field:
       gh project item-edit --id "${task.itemId}" --project-id ${projectNumber} --field-id "${specFieldId}" --text "SPEC_CONTENT"

  Be as specific as possible — include exact function names, component structures,
  prop types (TypeScript), and test cases to add. The builder sees ONLY your output.`,
  { label: 'discovery', phase: 'Discovery', schema: DISCOVERY_SCHEMA }
)

log(`Discovery done. Files: ${spec.filesToModify.join(', ')}`)

// Move to Ready to Build after discovery completes.
await moveCard(task.itemId, statusOptions.readyToBuild, 'move-to-ready', 'Discovery')

postComment(task.issueNumber,
  `## Discovery complete

**Summary:** ${spec.summary}

### Technical Plan
${spec.technicalSpec}

### Files to Modify
${spec.filesToModify.map(f => '- \`' + f + '\`').join('\n')}

### Acceptance Criteria
${spec.acceptanceCriteria.map(c => '- [ ] ' + c).join('\n')}

### Risks
${spec.risks || 'None identified'}

---
_Discovery Agent_`
)

// ── Phase 3–5: Build → Review → QA loop ──────────────────────────────────────
phase('Build')

const branchName = 'feature/issue-' + task.issueNumber
let prUrl = null
let previousFindings = []
let iteration = 0

while (iteration < MAX_ITERATIONS) {
  iteration++
  log('Build/Review/QA — iteration ' + iteration + '/' + MAX_ITERATIONS)

  // ── Build ──────────────────────────────────────────────────────────────────
  phase('Build')

  // Move to In Progress before the build agent starts.
  await moveCard(task.itemId, statusOptions.inProgress, 'move-to-inprogress-' + iteration, 'Build')

  const fixContext = previousFindings.length > 0
    ? '\n\n=== ISSUES TO FIX FROM PREVIOUS REVIEW ===\n' +
      previousFindings.map((f, i) => (i + 1) + '. ' + f).join('\n')
    : ''

  const buildOutput = await agent(
    `You are a builder agent. Implement this GitHub issue as production-ready code.

    Issue #${task.issueNumber}: ${task.issueTitle}
    Branch: ${branchName}
    Local repo: /Users/jorgemartins/devs/todo-app

    === TECHNICAL SPEC ===
    ${spec.technicalSpec}

    === FILES TO MODIFY ===
    ${spec.filesToModify.join('\n')}

    === ACCEPTANCE CRITERIA ===
    ${spec.acceptanceCriteria.map((c, i) => (i + 1) + '. ' + c).join('\n')}
    ${fixContext}

    Steps:
    1. cd /Users/jorgemartins/devs/todo-app
    ${iteration === 1
      ? '2. git checkout main && git pull\n    3. git checkout -b ' + branchName
      : '2. git checkout ' + branchName}
    4. Read each file before editing it
    5. Implement all changes — fix every issue in ISSUES TO FIX if present
    6. Follow existing code conventions exactly
    7. Run: npm test — fix any failures before continuing
    8. git add <only the changed files>
    9. git commit -m "${iteration === 1 ? 'feat' : 'fix'}: ${task.issueTitle} (closes #${task.issueNumber})"
    10. git push -u origin ${branchName}
    ${prUrl === null
      ? '11. gh pr create --repo ' + owner + '/' + repo + ' --title "' + task.issueTitle + '" --body "Closes #' + task.issueNumber + '\n\n## Acceptance Criteria\n\n' + spec.acceptanceCriteria.map(c => '- [ ] ' + c).join('\\n') + '"\n    12. Print the PR URL'
      : '11. PR already exists at ' + prUrl + ' — push fixes to the existing branch, no new PR needed.'}

    Do not skip tests. Do not add changes beyond the spec.`,
    { label: 'build-iter-' + iteration, phase: 'Build', isolation: 'worktree' }
  )

  if (prUrl === null) {
    prUrl = await agent(
      `Extract the GitHub PR URL from this text. Return ONLY the URL (https://github.com/...), nothing else.
      Text: ${buildOutput}`,
      { label: 'extract-pr-url', phase: 'Build' }
    )
    log('PR opened: ' + prUrl)
  }

  postComment(task.issueNumber,
    iteration === 1
      ? `## Build complete

PR: ${prUrl}

Implementation done — moving to code review.

---
_Builder Agent_`
      : `## Build updated (iteration ${iteration})

Fixed issues from previous review:
${previousFindings.map(f => '- ' + f).join('\n')}

PR updated: ${prUrl}

---
_Builder Agent_`
  )

  // ── Review ─────────────────────────────────────────────────────────────────
  phase('Review')
  log('Reviewing ' + prUrl + ' (iteration ' + iteration + ')...')

  // Move to Review before the review agent starts.
  await moveCard(task.itemId, statusOptions.review, 'move-to-review-' + iteration, 'Review')

  const review = await agent(
    `You are a code review agent. Review this pull request rigorously.

    PR: ${prUrl}
    Issue: #${task.issueNumber} — ${task.issueTitle}
    Repo: ${owner}/${repo}
    Iteration: ${iteration}

    Acceptance Criteria (ALL must be met to approve):
    ${spec.acceptanceCriteria.map((c, i) => (i + 1) + '. ' + c).join('\n')}

    Steps:
    1. Get PR number: gh pr view "${prUrl}" --json number -q .number
    2. Read the full diff: gh pr diff PR_NUMBER --repo ${owner}/${repo}
    3. Read each modified file in full for context
    4. Check each acceptance criterion — pass or fail with specifics
    5. Look for: logic bugs, missing error handling, security issues, missing tests, style violations
    6. Post your review:
         gh pr review PR_NUMBER --repo ${owner}/${repo} --approve -b "COMMENT"
         or
         gh pr review PR_NUMBER --repo ${owner}/${repo} --request-changes -b "COMMENT"

    Approve only when ALL criteria pass and there are no blocking issues.`,
    { label: 'review-iter-' + iteration, phase: 'Review', schema: REVIEW_SCHEMA }
  )

  log('Review verdict (iter ' + iteration + '): ' + review.verdict)

  postComment(task.issueNumber,
    review.approved
      ? `## Code review passed (iteration ${iteration})

${review.verdict}

All acceptance criteria met. Moving to QA.

---
_Review Agent_`
      : `## Code review — changes requested (iteration ${iteration})

${review.verdict}

### Issues to fix
${review.findings.map(f => '- ' + f).join('\n')}

---
_Review Agent_`
  )

  if (!review.approved) {
    previousFindings = review.findings
    if (iteration < MAX_ITERATIONS) {
      log('Changes requested. Retrying build (iteration ' + (iteration + 1) + ')...')
      continue
    }
    postComment(task.issueNumber,
      `## Escalated to manual after ${MAX_ITERATIONS} iterations

The automated loop could not resolve all review findings within ${MAX_ITERATIONS} attempts.
Manual intervention required.

### Outstanding issues
${review.findings.map(f => '- ' + f).join('\n')}

---
_SDLC Orchestrator_`
    )
    await moveCard(task.itemId, statusOptions.todo, 'escalate-to-todo', 'Review')
    return { status: 'escalated', issue: task.issueNumber, pr: prUrl, findings: review.findings }
  }

  // ── QA ─────────────────────────────────────────────────────────────────────
  phase('QA')

  // Move to QA before the QA agent starts.
  await moveCard(task.itemId, statusOptions.qa, 'move-to-qa-' + iteration, 'QA')

  const qa = await agent(
    `You are a QA agent. Validate this implementation end-to-end.

    PR: ${prUrl}
    Issue: #${task.issueNumber} — ${task.issueTitle}
    Local repo: /Users/jorgemartins/devs/todo-app

    Acceptance Criteria:
    ${spec.acceptanceCriteria.map((c, i) => (i + 1) + '. ' + c).join('\n')}

    Steps:
    1. Get PR number: gh pr view "${prUrl}" --json number -q .number
    2. Check out the branch: gh pr checkout PR_NUMBER --repo ${owner}/${repo}
    3. npm install
    4. Run the full test suite: npm test — note exact pass/fail counts
    5. Start the dev server: npm run dev (port 3000)
    6. Verify EACH acceptance criterion explicitly — test it directly, don't assume
    7. Check for regressions in existing features
    8. Post QA report as a PR comment:
         gh pr comment PR_NUMBER --repo ${owner}/${repo} --body-file /tmp/qa-report.md

    For each criterion state exactly how you verified it and whether it passed.`,
    { label: 'qa-iter-' + iteration, phase: 'QA', schema: QA_SCHEMA }
  )

  log('QA verdict (iter ' + iteration + '): ' + qa.verdict)

  postComment(task.issueNumber,
    qa.passed
      ? `## QA passed (iteration ${iteration})

${qa.verdict}

### Tests run
${(qa.testsRun || []).map(t => '- ' + t).join('\n')}

All acceptance criteria verified. Merging.

---
_QA Agent_`
      : `## QA failed (iteration ${iteration})

${qa.verdict}

### Failures
${(qa.failures || []).map(f => '- ' + f).join('\n')}

---
_QA Agent_`
  )

  if (!qa.passed) {
    previousFindings = qa.failures || []
    if (iteration < MAX_ITERATIONS) {
      log('QA failed. Retrying build (iteration ' + (iteration + 1) + ')...')
      continue
    }
    await moveCard(task.itemId, statusOptions.todo, 'escalate-qa-to-todo', 'QA')
    return { status: 'escalated', issue: task.issueNumber, pr: prUrl, failures: qa.failures }
  }

  // ── Done ───────────────────────────────────────────────────────────────────

  // Move to Done before the merge agent, so the board reflects completion even
  // if the merge command itself takes time or partially fails.
  await moveCard(task.itemId, statusOptions.done, 'move-to-done', 'QA')

  await agent(
    `Merge the PR and close the issue.

    1. Get PR number: gh pr view "${prUrl}" --json number -q .number
    2. Squash-merge: gh pr merge PR_NUMBER --squash --repo ${owner}/${repo}
    3. Post closing comment:
         gh issue comment ${task.issueNumber} --repo ${owner}/${repo} --body "Implemented in ${prUrl} and merged after ${iteration} iteration(s). All ${spec.acceptanceCriteria.length} acceptance criteria verified by QA."`,
    { label: 'merge-and-close', phase: 'QA' }
  )

  log('Issue #' + task.issueNumber + ' complete in ' + iteration + ' iteration(s)!')
  return {
    status: 'done',
    issue: task.issueNumber,
    pr: prUrl,
    iterations: iteration,
    testsRun: qa.testsRun,
  }
}
