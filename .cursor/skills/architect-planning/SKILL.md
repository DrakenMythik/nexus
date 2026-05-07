# Architect Planning Skill

## Context & Inputs
1. Read the GitHub Issue description to understand the required feature.
2. Use the Supabase MCP to query the current local database state.

## Phase 1: Planning
1. Generate a Mermaid ER diagram showing how the new feature connects to existing tables.
2. Save this diagram to the `docs/` folder.
3. Wait for the user to explicitly say "Approved".

## Phase 2: Execution
1. Once approved, run the CLI command:
   ```bash
   supabase migration new <descriptive_name>
    ```

2. Write the required SQL into the newly generated migration file.

3. Run the CLI command:
    ```bash
    supabase db lint
    ```

## Phase 3: Handoff
1. Check the agent:architect box in the issue's Agentic Pipeline checklist.
2. Update the issue's Current Skill: line to read .cursor/skills/react-coder/SKILL.md.
3. Remove the agent:architect label and add the agent:coder label.