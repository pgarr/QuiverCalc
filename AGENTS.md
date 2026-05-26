# AI Agents Instructions (simple-notepad)

## Quick Safety Checklist (do not break invariants)

- Avoid direct SQL edits outside `lib/database.ts`. (Writing SQL outside this file bypassed migration versioning in the past.)

## Git Workflow (every change, no exceptions)

Every change — no matter how small — must follow this exact sequence:

0. **Pull the latest `master`** (`git checkout master && git pull`) before creating any branch — this ensures the version bump targets the correct base and avoids version conflicts in CI.
1. **Create a new branch** off `master` (never commit directly to `master`)
2. **Make your changes** and commit them to the branch
3. **Bump the version** (`npm run bump:patch/minor/major`) and commit the version files
4. **Push** the branch to remote
5. **Open a pull request** targeting `master`

Direct pushes to `master` are blocked by branch protection. CI enforces the version bump — a PR with the same version as `master` will fail.

**Agent rules:**

- **"Implement X" means make the code changes only.** Stop there and wait. Do not branch, commit, bump the version, push, or open a PR unless the developer explicitly says to (e.g. "commit this", "open a PR", "do the full workflow").
- **Before opening a PR, ask** whether the new work should go into an existing open branch/PR or a new one. Never assume a new branch.
- **Do not push** until the developer has tested the changes locally on a dev device and confirmed they are ready.

Choose the bump type based on the nature of the changes:

- **patch** (`npm run bump:patch`) — bug fixes, small tweaks, copy changes
- **minor** (`npm run bump:minor`) — new user-visible features, non-breaking additions
- **major** (`npm run bump:major`) — breaking changes, major UX overhauls

## When implementing a feature (agent playbook)

1. **Locate the route** to change/add under `app/`.
2. If the feature needs persistence, identify/extend the correct helper(s) in `lib/database.ts`.
3. For UI:
   - reuse existing components in `components/`
   - use Tailwind/NW class names (via `className`)

## SQLite Database Model (most important invariants)

### Schema and versioning

@lib/database.ts

## Repo Layout (where things live)

Routes under `app/`, reusable UI under `components/`, non-UI logic under `lib/`.

@README.md

## Tech Stack (what to assume)

Expo ~55, Expo Router, NativeWind v4, expo-sqlite, TypeScript strict — see @package.json for exact versions.

## Routing / Screen patterns (Expo Router)

Each screen is a single `.tsx` file at `app/<name>.tsx`. Use Expo Router's file-based routing — no nested navigators yet.

## UI + UX conventions

Style with NativeWind v4 `className` props. Use `cva` (class-variance-authority) for variant components. Reuse components from `components/`; icons via `lucide-react-native`.

## Code Style / Quality Bar

- Run `npx prettier --write .` before committing (single quotes, `printWidth: 100`, Tailwind plugin — see `@.prettierrc`). **Not CI-gated** but required; reviewers will flag it.

## Testing

- Framework: jest-expo (see `jest.config.js`).
- Tests live in `lib/__tests__/` alongside the modules they test; filename pattern `*.test.ts`.
- Run locally: `npm run test-watch`. CI gate: `npm run test-ci` (runs on every PR via `.github/workflows/test.yml`).

## Running the app (for humans/agents)

@README.md

Last scanned: 2026-05-26
