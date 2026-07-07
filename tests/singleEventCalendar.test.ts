import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
  createSingleEventFilename,
} from '../src/features/singleEventCalendar.ts';

const event = {
  date: '2026-07-10',
  title: 'Puasa Sunnah: Senin & Ayyamul Bidh',
  description: 'Puasa, sunnah; pilihan\nBaris kedua',
};

test('builds a prefilled Google Calendar all-day event URL', () => {
  const url = new URL(buildGoogleCalendarUrl(event));

  assert.equal(url.origin, 'https://calendar.google.com');
  assert.equal(url.pathname, '/calendar/render');
  assert.equal(url.searchParams.get('action'), 'TEMPLATE');
  assert.equal(url.searchParams.get('text'), event.title);
  assert.equal(url.searchParams.get('dates'), '20260710/20260711');
  assert.equal(url.searchParams.get('details'), event.description);
});

test('builds a prefilled Outlook all-day event URL', () => {
  const url = new URL(buildOutlookCalendarUrl(event));

  assert.equal(url.origin, 'https://outlook.live.com');
  assert.equal(url.pathname, '/calendar/deeplink/compose');
  assert.equal(url.searchParams.get('subject'), event.title);
  assert.equal(url.searchParams.get('startdt'), '2026-07-10');
  assert.equal(url.searchParams.get('enddt'), '2026-07-11');
  assert.equal(url.searchParams.get('allday'), 'true');
  assert.equal(url.searchParams.get('body'), event.description);
});

test('creates a descriptive single-event filename', () => {
  assert.equal(
    createSingleEventFilename('2026-07-10', 'Puasa Senin Kamis'),
    'puasa-sunnah-2026-07-10-puasa-senin-kamis.ics',
  );
});
