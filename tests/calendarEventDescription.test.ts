import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCalendarEventDescription } from '../src/features/calendarEventDescription.ts';

const promo = [
  'Jadwal dari Puasa Sunnah Calendar.',
  'Lihat jadwal puasa sunnah lainnya: https://puasa-sunnah.granitebps.com',
].join('\n');

test('adds promotional footer after an existing description', () => {
  assert.equal(
    buildCalendarEventDescription('Puasa sunnah setiap hari Senin.'),
    `Puasa sunnah setiap hari Senin.\n\n${promo}`,
  );
});

test('uses promotional wording without leading blank lines', () => {
  assert.equal(buildCalendarEventDescription(''), promo);
});
