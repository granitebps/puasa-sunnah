# Dark Mode Design

## Goal

Add accessible light and dark themes to the calendar UI. First-time visitors follow their operating-system preference. A manual toggle persists an explicit light or dark choice across visits.

## User Experience

- Place a sun/moon theme toggle in the calendar toolbar beside **Add to calendar**.
- On first visit, use `prefers-color-scheme`.
- When the user toggles the theme, apply it immediately and save `light` or `dark` in `localStorage`.
- A saved choice overrides the operating-system preference.
- While no saved choice exists, respond to operating-system theme changes without requiring a reload.
- The toggle exposes an accessible name describing its action, such as **Switch to light mode**.

## Visual Direction

Use the approved charcoal palette:

- Neutral near-black page and calendar surfaces.
- Slightly lighter toolbar, control, hover, and popup surfaces.
- High-contrast light text and muted secondary text.
- Subtle gray borders between calendar cells.
- Muted dark-red weekend cells, preserving the existing weekend cue.
- Existing API-provided event background and text colors remain unchanged.
- Modal, form controls, status text, focus states, and react-big-calendar popup receive matching dark styles.

Exact color values will be centralized as CSS custom properties. Light-mode values preserve the current appearance where practical.

## Architecture

### Theme State

Create a small theme module containing:

- `Theme` type: `light | dark`.
- Safe reading and writing of the persisted preference.
- System-preference resolution.
- Theme application to `document.documentElement.dataset.theme` and `color-scheme`.

`App` owns the active theme and system media-query subscription. The toolbar receives the theme and toggle callback as explicit props.

Storage access is wrapped because browser privacy settings can make `localStorage` throw. Missing, invalid, or inaccessible stored values fall back to the current system preference.

### First Paint

Add a small inline bootstrap in `index.html` that resolves stored/system preference before React and styles load. This avoids a light flash when dark mode should be active. Bootstrap logic mirrors the theme module's simple validation and failure fallback.

### Styling

Add an app-wide stylesheet imported from `main.tsx`. Define semantic CSS variables for surfaces, text, borders, controls, weekends, and status colors under light and dark theme selectors.

Override react-big-calendar selectors using those variables. Update modal CSS to consume the same tokens instead of fixed light colors. Keep API-provided event colors inline so theme rules do not override them.

## Data Flow

1. Inline bootstrap resolves and applies theme before first paint.
2. `App` initializes from the applied document theme.
3. With no saved preference, a `matchMedia` listener updates the theme when the system changes.
4. User activates the toggle.
5. `App` flips light/dark, applies the new theme, and persists it.
6. Once persisted, system changes no longer override the user's choice.

## Failure Handling

- Invalid stored value: ignore and use system preference.
- `localStorage` read/write failure: theme still changes for the current session; system preference remains fallback after reload.
- Missing `matchMedia`: default to light mode.
- Event colors with poor contrast are outside this change because they come from API data; existing event presentation remains unchanged.

## Verification

- Unit-test pure theme preference parsing and resolution without browser/network dependencies.
- Manually verify first load under light and dark system preferences.
- Verify saved override survives reload and wins over system preference.
- Verify toggle label, keyboard activation, focus visibility, calendar navigation, event selection, popup, and export modal in both themes.
- Run `npm test`, `npm run lint`, and `npm run build`.

## Scope

Included: app shell, calendar, toolbar toggle, calendar popup, export modal, persistence, system preference behavior, and first-paint handling.

Excluded: three-way theme selector, server-side preference storage, new dependencies, API event-color transformations, unrelated UI refactors.
