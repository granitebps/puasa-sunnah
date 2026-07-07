import assert from 'node:assert/strict';
import test from 'node:test';

import { calendarImportGuides } from '../src/features/calendarImportGuide.ts';

test('provides import instructions for supported calendar flows', () => {
  assert.deepEqual(
    calendarImportGuides.map((guide) => guide.title),
    ['Native Calendar', 'Google Calendar', 'Outlook'],
  );
  assert.ok(calendarImportGuides.every((guide) => guide.steps.length > 1));
  assert.ok(
    calendarImportGuides.every((guide) => guide.helpHref.startsWith('https://')),
  );
  assert.deepEqual(
    calendarImportGuides.map((guide) => guide.id),
    ['native', 'google', 'outlook'],
  );
  const googleGuide = calendarImportGuides.find(
    (guide) => guide.id === 'google',
  );
  assert.match(googleGuide?.steps.join(' ') ?? '', /Import & export/i);
  assert.match(googleGuide?.action?.href ?? '', /calendar\.google\.com/);
  const outlookGuide = calendarImportGuides.find(
    (guide) => guide.id === 'outlook',
  );
  assert.match(outlookGuide?.action?.href ?? '', /outlook\.live\.com/);
});
