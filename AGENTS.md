# Repository Guidelines

## Project Structure & Module Organization

This repository contains a Vite-powered React and TypeScript single-page application. Application code lives in `src/`: `main.tsx` initializes providers, `App.tsx` coordinates the calendar, `components/` contains UI, `api/` owns HTTP requests, and `features/` contains calendar-export logic. Shared domain types and helpers live in `types.ts`, `constants.ts`, and `utils.ts`. Static files belong in `public/`; Vite serves them unchanged. Production output is generated in `dist/` and must not be committed.

## Build, Test, and Development Commands

- `npm ci` installs the exact dependency versions from `package-lock.json`.
- `npm run dev` starts the Vite development server with hot reload.
- `npm run build` runs TypeScript project checks, then creates the production bundle in `dist/`.
- `npm run lint` checks all TypeScript and React source with ESLint.
- `npm run preview` serves the built application locally for final verification.

No automated test command is currently configured. Treat successful lint and build runs as the minimum validation for every change.

## Coding Style & Naming Conventions

Use TypeScript with strict typing and React function components. Follow existing formatting: two-space indentation, semicolons, single-quoted strings, and trailing commas in multiline objects. Name components and interfaces with PascalCase (`App`, `Fasting`), functions and variables with camelCase (`formatMonth`), and constants with uppercase snake case (`WEEKEND_BG_COLOR`). Keep reusable helpers outside components. Do not suppress ESLint rules without a narrow, documented reason.

## Testing Guidelines

For UI or data-loading changes, manually verify initial calendar rendering, month navigation, API error behavior, and event selection. If introducing tests, place them beside source files as `*.test.ts` or `*.test.tsx`, add a documented `npm test` script, and avoid network-dependent tests by mocking Axios responses.

## Commit & Pull Request Guidelines

History generally follows Conventional Commit prefixes: `feat:`, `fix:`, `docs:`, and `chore:`. Use an imperative, specific subject, for example `fix: handle empty fasting response`. Pull requests should explain behavior changes, list verification commands, link relevant issues, and include screenshots for visible UI changes. Keep each PR focused; separate refactors from functional changes.

## Security & Configuration

Configure runtime values through uncommitted Vite environment files. Expected variables include `VITE_API_URL`, `VITE_POSTHOG_KEY`, and `VITE_POSTHOG_HOST`. Never commit credentials, production secrets, or user data.
