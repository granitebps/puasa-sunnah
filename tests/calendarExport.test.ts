import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addOneDay,
  buildPuasaSunnahIcs,
  createCalendarFilename,
  downloadIcs,
  escapeIcsText,
  filterCalendarEvents,
  formatIcsDate,
  formatIcsDateTimeUtc,
} from '../src/features/calendarExport.ts';

const generatedAt = new Date('2026-07-05T10:15:30.000Z');

test('builds one transparent all-day event per unique date', () => {
  const calendar = buildPuasaSunnahIcs(
    [
      {
        id: 11,
        date: '2026-07-06',
        typeName: 'Senin Kamis',
        description: 'Puasa hari Senin',
      },
      {
        id: 12,
        date: '2026-07-06',
        typeName: 'Ayyamul Bidh',
      },
    ],
    { withReminder: false },
    generatedAt,
  );

  assert.match(
    calendar,
    /^BEGIN:VCALENDAR\r\nVERSION:2\.0\r\nPRODID:-\/\/Puasa Sunnah Calendar\/\/puasa-sunnah\.granitebps\.com\/\/EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-CALNAME:Puasa Sunnah Calendar\r\nX-WR-TIMEZONE:Asia\/Jakarta\r\n/,
  );
  assert.equal(calendar.match(/BEGIN:VCALENDAR/g)?.length, 1);
  assert.equal(calendar.match(/END:VCALENDAR/g)?.length, 1);
  assert.equal(calendar.match(/BEGIN:VEVENT/g)?.length, 1);
  assert.match(calendar, /DTSTAMP:20260705T101530Z/);
  assert.match(calendar, /DTSTART;VALUE=DATE:20260706/);
  assert.match(calendar, /DTEND;VALUE=DATE:20260707/);
  assert.match(calendar, /UID:puasa-sunnah-20260706@puasa-sunnah\.granitebps\.com/);
  assert.match(calendar, /SUMMARY:Puasa Sunnah: Senin Kamis & Ayyamul Bidh/);
  assert.match(calendar, /DESCRIPTION:Puasa hari Senin\\nAyyamul Bidh/);
  assert.match(calendar, /TRANSP:TRANSPARENT/);
  const unfoldedCalendar = calendar.replace(/\r\n /g, '');
  assert.equal(
    unfoldedCalendar.match(/Jadwal dari Puasa Sunnah Calendar\./g)?.length,
    1,
  );
  assert.match(
    unfoldedCalendar,
    /Lihat jadwal puasa sunnah lainnya: https:\/\/puasa-sunnah\.granitebps\.com/,
  );
  assert.doesNotMatch(calendar, /BEGIN:VALARM/);
  assert.match(calendar, /END:VCALENDAR\r\n$/);
});

test('escapes text, preserves Indonesian text, and folds at 75 octets', () => {
  const calendar = buildPuasaSunnahIcs(
    [
      {
        id: 20,
        date: '2026-08-01',
        typeName: 'Puasa, Syawal; Istimewa',
        description: `Baris pertama\n${'keterangan panjang '.repeat(10)}`,
      },
    ],
    { withReminder: false },
    generatedAt,
  );

  assert.match(calendar, /SUMMARY:Puasa Sunnah: Puasa\\, Syawal\\; Istimewa/);
  assert.match(calendar, /DESCRIPTION:Baris pertama\\nketerangan panjang/);
  assert.match(calendar, /\r\n /);
  assert.ok(
    calendar
      .split('\r\n')
      .filter(Boolean)
      .every((line) => new TextEncoder().encode(line).length <= 75),
  );
  assert.equal(escapeIcsText('a\\b,c;d\ne'), 'a\\\\b\\,c\\;d\\ne');
});

test('adds one exact display alarm per unique event when selected', () => {
  const calendar = buildPuasaSunnahIcs(
    [
      { id: 30, date: '2026-12-31', typeName: 'Puasa Akhir Tahun' },
      { id: 31, date: '2027-01-01', typeName: 'Puasa Awal Tahun' },
    ],
    { withReminder: true },
    generatedAt,
  );

  assert.equal(calendar.match(/BEGIN:VEVENT/g)?.length, 2);
  assert.equal(calendar.match(/BEGIN:VALARM/g)?.length, 2);
  assert.match(calendar, /DTEND;VALUE=DATE:20270101/);
  assert.match(
    calendar,
    /BEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:Reminder: Puasa Sunnah tomorrow\r\nTRIGGER:-PT15H\r\nEND:VALARM/,
  );
});

test('downloads one UTF-8 iCalendar file', () => {
  let clicked = false;
  let removed = false;
  let revokedUrl = '';
  let mimeType = '';
  const anchor = {
    click: () => {
      clicked = true;
    },
    download: '',
    href: '',
    remove: () => {
      removed = true;
    },
  };

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      body: { append: () => undefined },
      createElement: () => anchor,
    },
  });
  URL.createObjectURL = (blob) => {
    mimeType = blob.type;
    return 'blob:calendar';
  };
  URL.revokeObjectURL = (url) => {
    revokedUrl = url;
  };

  downloadIcs('fasting.ics', 'calendar');

  assert.equal(anchor.download, 'fasting.ics');
  assert.equal(anchor.href, 'blob:calendar');
  assert.equal(clicked, true);
  assert.equal(removed, true);
  assert.equal(revokedUrl, 'blob:calendar');
  assert.equal(mimeType, 'text/calendar;charset=utf-8');
});

test('formats all-day dates without timezone shifts', () => {
  assert.equal(formatIcsDate('2026-07-10'), '20260710');
  assert.equal(addOneDay('2026-01-31'), '2026-02-01');
  assert.equal(addOneDay('2026-12-31'), '2027-01-01');
  assert.equal(addOneDay('2028-02-28'), '2028-02-29');
  assert.equal(formatIcsDateTimeUtc(generatedAt), '20260705T101530Z');
});

test('filters exports to the current year, selected month, and fasting types', () => {
  const events = [
    { id: 1, typeId: 10, date: '2026-07-06', typeName: 'Weekly' },
    { id: 2, typeId: 20, date: '2026-08-01', typeName: 'Monthly' },
    { id: 3, typeId: 10, date: '2025-07-07', typeName: 'Weekly' },
  ];

  assert.deepEqual(
    filterCalendarEvents(events, 'current-month', 7, 2026, [10, 20]),
    [events[0]],
  );
  assert.deepEqual(
    filterCalendarEvents(events, 'current-year', 7, 2026, [10]),
    [events[0]],
  );
});

test('creates descriptive filenames for scope, period, and selected types', () => {
  assert.equal(
    createCalendarFilename('current-month', 7, 2026, ['Puasa Arafah'], false),
    'puasa-sunnah-current-month-2026-07-puasa-arafah.ics',
  );
  assert.equal(
    createCalendarFilename('current-year', 7, 2026, ['Ignored'], true),
    'puasa-sunnah-current-year-2026-all-types.ics',
  );
  assert.equal(
    createCalendarFilename(
      'specific-month',
      9,
      2026,
      ['Puasa Arafah', 'Puasa Syawal', 'Puasa Asyura'],
      false,
    ),
    'puasa-sunnah-specific-month-2026-09-multiple-types.ics',
  );
});
