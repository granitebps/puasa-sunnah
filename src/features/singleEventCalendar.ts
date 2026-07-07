export interface SingleCalendarEvent {
  date: string;
  title: string;
  description: string;
}

export const buildGoogleCalendarUrl = (event: SingleCalendarEvent): string => {
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', event.title);
  url.searchParams.set(
    'dates',
    `${formatIcsDate(event.date)}/${formatIcsDate(addOneDay(event.date))}`,
  );
  url.searchParams.set('details', event.description);

  return url.toString();
};

export const buildOutlookCalendarUrl = (event: SingleCalendarEvent): string => {
  const url = new URL('https://outlook.live.com/calendar/deeplink/compose');
  url.searchParams.set('path', '/calendar/action/compose');
  url.searchParams.set('rru', 'addevent');
  url.searchParams.set('subject', event.title);
  url.searchParams.set('startdt', event.date);
  url.searchParams.set('enddt', addOneDay(event.date));
  url.searchParams.set('allday', 'true');
  url.searchParams.set('body', event.description);

  return url.toString();
};

export const createSingleEventFilename = (
  date: string,
  typeName: string,
): string => {
  const slug = typeName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return `puasa-sunnah-${date}-${slug || 'event'}.ics`;
};
import { addOneDay, formatIcsDate } from './calendarExport.ts';
