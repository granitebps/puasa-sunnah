# Calendar Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add filtered Puasa Sunnah schedule export as one downloadable iCalendar file.

**Architecture:** Keep provider-independent export in a pure TypeScript module, render export choices in a focused modal component, and let `App.tsx` coordinate monthly API requests. Use Node's built-in test runner for serializer coverage so no dependency is added.

**Tech Stack:** React 18, TypeScript 5.6, Vite 5, Axios, Node 22 test runner, iCalendar text format.

---

### Task 1: Build and test iCalendar serialization

**Files:**
- Create: `src/features/calendarExport.ts`
- Create: `tests/calendarExport.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Add failing serializer tests**

Create tests using `node:test` and `node:assert/strict`. Cover calendar headers, merged same-date records, date-only `DTSTART`/exclusive `DTEND`, stable date UIDs, transparency, escaped commas/semicolons/newlines, UTF-8 folding, and optional `VALARM` with `TRIGGER:-PT15H`. Import from `../src/features/calendarExport.ts`.

- [ ] **Step 2: Add test command and confirm failure**

Add `"test": "node --experimental-strip-types --test tests/*.test.ts"` to `package.json` scripts.

Run: `npm test`

Expected: FAIL because `src/features/calendarExport.ts` does not exist.

- [ ] **Step 3: Implement pure calendar generation**

Create these exported contracts:

```ts
export interface CalendarExportEvent {
  id: number;
  date: string;
  typeName: string;
  description?: string;
}

export type ReminderOption = 'none' | 'one-day-before';
```

Implement `buildPuasaSunnahIcs(events, options, generatedAt = new Date()): string`. Merge records by date, use `VALUE=DATE`, add one day for exclusive `DTEND`, normalize `DTSTAMP` to UTC, fold lines at 75 octets, escape text, add transparency, and create UID `puasa-sunnah-<date>@puasa-sunnah.granitebps.com`.

Implement `downloadIcs(filename, contents): void`. Create one UTF-8 calendar blob, trigger one browser download, and revoke its object URL.

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: all calendar export tests PASS.

### Task 2: Create export modal

**Files:**
- Create: `src/components/AddToCalendarModal.tsx`
- Create: `src/components/AddToCalendarModal.css`
- Modify: `src/types.ts`

- [ ] **Step 1: Add shared selection types**

Add:

```ts
export type ExportScope = 'current-month' | 'specific-month' | 'current-year';

export interface ExportRequest {
  scope: ExportScope;
  month: number;
  year: number;
  typeIds: number[];
  reminder: 'none' | 'one-day-before';
}
```

Also add optional `background_color` and `text_color` fields to `Type`, matching current runtime use.

- [ ] **Step 2: Implement controlled modal**

Use props for `open`, current month/year, fetched fasting records, loading/error state, close, retry, scope change, and export submission. Render:

- dialog title and close button;
- scope radios;
- a month selector only for specific month; year stays fixed to current year;
- “All types” plus individual type checkboxes derived by `type.id`;
- notification selector with “Use calendar default” and “1 day before at 9:00 AM” options;
- loading, empty, validation, and request-error messages;
- retry and export buttons.

Reset selections when opening. Select all available types by default after data loads. Disable export during loading, with no data, or with zero selected types. Close on Escape; use `role="dialog"`, `aria-modal="true"`, labelled controls, and initial focus on heading/close control.

- [ ] **Step 3: Add scoped styling**

Create backdrop, centered responsive panel, field groups, checkbox grid, status text, and action-row styles. Keep controls usable at 320px width and preserve existing full-height calendar.

- [ ] **Step 4: Compile modal in isolation through project build**

Run: `npm run build`

Expected: PASS with no TypeScript errors.

### Task 3: Integrate fetching and delivery

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add calendar-toolbar trigger**

Keep `monthNow`/`yearNow` for calendar navigation. Add `Add to calendar` inside a custom calendar toolbar and render `AddToCalendarModal`.

- [ ] **Step 2: Implement current-year fetching**

Fetch months 1–12 for the current year through `/api/v1/fastings` and fetch type options through `/api/v1/types` using `Promise.all`. Flatten schedule results only after every request succeeds, then filter by current month, specific month, or current year during export. Use a request sequence or cancellation flag so stale responses cannot replace newer results. Expose retry without changing selection.

- [ ] **Step 3: Filter and export**

Filter loaded records by selected `typeIds`, map them to `CalendarExportEvent`, call `buildPuasaSunnahIcs`, then `downloadIcs`. Use filename `puasa-sunnah-<scope>-<period>-<types>.ics`; collapse more than two selected type names to `multiple-types`. Keep modal open and show download success or error text.

- [ ] **Step 4: Verify behavior manually**

Run: `npm run dev`

Verify current month, specific month, and current year; all and multiple types; merged same-date events; both notification options; retry after failed API request; one-file download; Escape and keyboard navigation.

### Task 4: Final verification

**Files:**
- Modify only files above if verification exposes defects.

- [ ] **Step 1: Run automated checks**

Run:

```bash
npm test
npm run lint
npm run build
git diff --check
```

Expected: tests, ESLint, TypeScript, Vite build, and whitespace check all exit 0. Existing Vite warnings about `VITE_UMAMI_WEBSITE_ID` or chunk size may remain; no new warnings should be introduced.

- [ ] **Step 2: Review diff scope**

Run: `git status --short` and `git diff -- src tests package.json package-lock.json`

Expected: only calendar-export implementation files changed. Do not stage `.serena/`, `AGENTS.md`, generated `*.tsbuildinfo`, or unrelated user files.
