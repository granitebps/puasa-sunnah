export interface CalendarExportEvent {
  id: number;
  typeId?: number;
  date: string;
  typeName: string;
  description?: string;
}

export type CalendarExportScope =
  | 'current-month'
  | 'specific-month'
  | 'current-year';

export const createCalendarFilename = (
  scope: CalendarExportScope,
  month: number,
  year: number,
  selectedTypeNames: string[],
  allTypesSelected: boolean,
): string => {
  const period =
    scope === 'current-year'
      ? String(year)
      : `${year}-${String(month).padStart(2, '0')}`;
  const types = allTypesSelected
    ? 'all-types'
    : selectedTypeNames.length > 2
      ? 'multiple-types'
      : selectedTypeNames.map(slugify).join('-') || 'no-types';

  return `puasa-sunnah-${scope}-${period}-${types}.ics`;
};

export const filterCalendarEvents = (
  events: CalendarExportEvent[],
  scope: CalendarExportScope,
  month: number,
  year: number,
  typeIds: number[],
): CalendarExportEvent[] => {
  const selectedTypes = new Set(typeIds);
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}-`;

  return events.filter((event) => {
    const inSelectedYear = event.date.startsWith(`${year}-`);
    const inSelectedPeriod =
      scope === 'current-year' || event.date.startsWith(monthPrefix);

    return (
      event.typeId !== undefined &&
      selectedTypes.has(event.typeId) &&
      inSelectedYear &&
      inSelectedPeriod
    );
  });
};

const CALENDAR_DOMAIN = 'puasa-sunnah.granitebps.com';
const encoder = new TextEncoder();

export const escapeIcsText = (value = ''): string => {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
};

export const foldIcsLine = (line: string): string => {
  const folded: string[] = [];
  let current = '';
  let limit = 75;

  for (const character of line) {
    const next = `${current}${character}`;
    if (encoder.encode(next).length > limit && current) {
      folded.push(current);
      current = character;
      limit = 74;
    } else {
      current = next;
    }
  }

  folded.push(current);
  return folded.join('\r\n ');
};

export const formatIcsDate = (date: string): string => {
  return date.replace(/-/g, '');
};

export const addOneDay = (date: string): string => {
  const [year, month, day] = date.split('-').map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day + 1));

  return [
    nextDate.getUTCFullYear(),
    String(nextDate.getUTCMonth() + 1).padStart(2, '0'),
    String(nextDate.getUTCDate()).padStart(2, '0'),
  ].join('-');
};

export const formatIcsDateTimeUtc = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
};

const slugify = (value: string): string => {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'fasting';
};

interface MergedCalendarEvent {
  date: string;
  typeNames: string[];
  descriptions: string[];
}

const getDisplayTypeName = (typeName: string): string => {
  return typeName.replace(/^Puasa\s+/i, '').trim();
};

const mergeEventsByDate = (
  events: CalendarExportEvent[],
): MergedCalendarEvent[] => {
  const eventsByDate = new Map<string, MergedCalendarEvent>();

  for (const event of events) {
    const merged = eventsByDate.get(event.date) ?? {
      date: event.date,
      typeNames: [],
      descriptions: [],
    };
    const displayName = getDisplayTypeName(event.typeName);

    if (!merged.typeNames.includes(displayName)) {
      merged.typeNames.push(displayName);
      merged.descriptions.push(event.description?.trim() || displayName);
    }
    eventsByDate.set(event.date, merged);
  }

  return [...eventsByDate.values()].sort((left, right) =>
    left.date.localeCompare(right.date),
  );
};

export const buildPuasaSunnahIcs = (
  events: CalendarExportEvent[],
  options: { withReminder: boolean },
  generatedAt = new Date(),
): string => {
  const timestamp = formatIcsDateTimeUtc(generatedAt);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Puasa Sunnah Calendar//puasa-sunnah.granitebps.com//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Puasa Sunnah Calendar',
    'X-WR-TIMEZONE:Asia/Jakarta',
  ];

  for (const event of mergeEventsByDate(events)) {
    const start = formatIcsDate(event.date);
    const end = formatIcsDate(addOneDay(event.date));
    const summary = `Puasa Sunnah: ${event.typeNames.join(' & ')}`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:puasa-sunnah-${start}@${CALENDAR_DOMAIN}`,
      `DTSTAMP:${timestamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(buildCalendarEventDescription(event.descriptions.join('\n')))}`,
      'TRANSP:TRANSPARENT',
    );

    if (options.withReminder) {
      lines.push(
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'DESCRIPTION:Reminder: Puasa Sunnah tomorrow',
        'TRIGGER:-PT15H',
        'END:VALARM',
      );
    }

    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
};

export const downloadIcs = (filename: string, contents: string): void => {
  const blob = new Blob([contents], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
import { buildCalendarEventDescription } from './calendarEventDescription.ts';
