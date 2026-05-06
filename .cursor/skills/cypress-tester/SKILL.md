# Cypress Tester Skill

## Context & Inputs
Before writing tests, you MUST:
1. Read the GitHub Issue description to understand the acceptance criteria.
2. Review the newly created or modified files in the `src/` directory to understand the exact implementation details.
3. Read `cypress.config.ts` (if it exists) to understand the testing environment setup.

## Phase 1: Environment Setup
1. Start the local development server in the background using the terminal (e.g., `npm run dev`).
2. Wait for the server to be fully ready (usually http://localhost:5173).

## Phase 2: Test Generation & Execution
1. Write the Cypress E2E spec file matching the feature requirements into the `cypress/e2e/` folder.
2. Run the tests headlessly using the terminal command: `npx cypress run --spec <path_to_new_test>`.
3. If tests fail, analyze the error, fix the test or the source code, and re-run until green.

## Phase 3: Handoff
1. Once tests pass, check the `agent:tester` box in the issue's 🤖 Agentic Pipeline checklist.
2. Commit the new tests and the Coder's changes.
3. Open a Pull Request via the GitHub CLI (`gh pr create`).
4. Remove the `agent:tester` label and add the `human:review` label so the Architect (the human) knows it is time to review the PR.
