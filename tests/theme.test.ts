import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { parseTheme, resolveTheme } from '../src/features/theme.ts';

test('parses only supported persisted themes', () => {
  assert.equal(parseTheme('light'), 'light');
  assert.equal(parseTheme('dark'), 'dark');
  assert.equal(parseTheme('system'), null);
  assert.equal(parseTheme(null), null);
});

test('saved theme overrides system preference', () => {
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
});

test('system preference applies without a saved theme', () => {
  assert.equal(resolveTheme(null, true), 'dark');
  assert.equal(resolveTheme(null, false), 'light');
});

test('keeps calendar content inset from the viewport edge', () => {
  const themeCss = readFileSync(
    new URL('../src/theme.css', import.meta.url),
    'utf8',
  );

  assert.match(themeCss, /body\s*\{[^}]*margin: 8px;/s);
});
