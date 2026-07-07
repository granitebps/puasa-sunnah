# Calendar Export Design

## Goal

Let users export Puasa Sunnah schedules from the web calendar into an installed calendar provider using a standards-compliant iCalendar (`.ics`) file.

## User Flow

An **Add to calendar** button above the calendar opens an accessible modal. The user chooses:

- current month, a specific month within the current year, or the current year;
- all fasting types or any combination of available types;
- calendar-provider default alerts (default) or an explicit alert at 9:00 AM one day before.

The app fetches all 12 months of the current year in parallel against the existing monthly fasting endpoint. Available type filters come from `/api/v1/types`; schedule records are filtered to the selected export period. Export remains disabled while loading, when no type is selected, or when no matching events exist.

## Export Behavior

The app generates one all-day iCalendar event per unique Gregorian date. Fasting types sharing a date are merged into its title and description. Each event contains:

- title `Puasa Sunnah: <type names>`;
- merged type descriptions;
- date-only start and exclusive date-only end;
- stable UID derived from the Gregorian date;
- generation timestamp;
- optional `VALARM` at 9:00 AM one day before an all-day event.

Each event includes `TRANSP:TRANSPARENT`. Text values are escaped and lines are folded at 75 UTF-8 octets. Date-only values prevent timezone shifts. The calendar provider may still apply its configured default alert when no `VALARM` is included.

After generation, the app downloads exactly one UTF-8 `.ics` file containing one `VCALENDAR` and all selected dates. Calendar-provider import and final confirmation remain controlled by the user.

The export modal uses a two-step flow: configure and download the schedule, then import it. Step 2 provides accessible tabs for Native Calendar, Google Calendar, and Outlook. Each tab contains focused steps, provider limitations, official documentation, and direct Google/Outlook calendar actions. After download, the modal remains open, shows the downloaded filename, resets Step 2 to Native Calendar, and scrolls the guide into view.

## Components

- `src/features/calendarExport.ts`: event filtering and merging, descriptive filename creation, iCalendar serialization, and download delivery.
- `src/components/AddToCalendarModal.tsx`: scope, date, type, reminder, loading, validation, error, and retry UI.
- `src/components/CalendarImportGuide.tsx`: accessible provider tabs and import instructions.
- `src/components/AddToCalendarModal.css`: modal and form presentation.
- `src/features/calendarImportGuide.ts`: provider guide content.
- `src/api/fastingApi.ts`: fasting schedule and fasting-type requests.
- `src/App.tsx`: current-year API requests, calendar-toolbar trigger, and export orchestration.
- `src/types.ts`: shared API and export types.

## Failure Handling

Any failed monthly request blocks the complete export and shows a retryable error. Partial schedules are never generated silently. Empty results and download failures show specific messages.

## Verification

Validation covers current-month, specific-month, and current-year scopes; type combinations; merged same-date events; both reminder modes; escaping; UTF-8 line folding; date boundaries; empty data; failed requests; download behavior; lint; and production build. No test dependency is added because this repository currently has no test framework and repository rules prohibit new dependencies.
