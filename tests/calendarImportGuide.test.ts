import assert from 'node:assert/strict';
import test from 'node:test';

import { calendarImportGuides } from '../src/features/calendarImportGuide.ts';

test('provides import instructions for supported calendar flows', () => {
  assert.deepEqual(
    calendarImportGuides.map((guide) => guide.title),
    ['Apple Calendar', 'Google Calendar', 'Outlook', 'Mobile'],
  );
  assert.ok(calendarImportGuides.every((guide) => guide.steps.length > 1));
  assert.match(
    calendarImportGuides.find((guide) => guide.title === 'Google Calendar')
      ?.steps.join(' ') ?? '',
    /Import and export/i,
  );
});
