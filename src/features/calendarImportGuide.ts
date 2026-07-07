export interface CalendarImportGuide {
  id: 'native' | 'google' | 'outlook';
  title: string;
  description: string;
  steps: string[];
  note?: string;
  helpHref: string;
  action?: {
    label: string;
    href: string;
  };
}

export const calendarImportGuides: CalendarImportGuide[] = [
  {
    id: 'native',
    title: 'Native Calendar',
    description: 'Best for Apple Calendar and other installed calendar apps.',
    steps: [
      'Open the downloaded .ics file from Downloads or Files.',
      'Choose your calendar app and destination calendar.',
      'Review the events, then confirm the import.',
    ],
    note: 'On Mac, you can also use Calendar → File → Import.',
    helpHref: 'https://support.apple.com/guide/calendar/import-or-export-calendars-icl1023/mac',
  },
  {
    id: 'google',
    title: 'Google Calendar',
    description: 'Google Calendar imports .ics files from its desktop website.',
    steps: [
      'Open Google Calendar on a computer, then open Settings.',
      'Select Import & export and choose the downloaded .ics file.',
      'Choose the destination calendar, then select Import.',
    ],
    note: 'Imported events are a snapshot and will not update automatically.',
    helpHref: 'https://support.google.com/calendar/answer/37118',
    action: {
      label: 'Open Google Calendar Import',
      href: 'https://calendar.google.com/calendar/u/0/r/settings/export',
    },
  },
  {
    id: 'outlook',
    title: 'Outlook',
    description: 'Import into Outlook on the web or the new Outlook app.',
    steps: [
      'Open Calendar and select Add calendar.',
      'Choose Upload from file and select the downloaded .ics file.',
      'Choose the destination calendar, then select Import.',
    ],
    note: 'Classic Outlook: File → Open & Export → Import/Export.',
    helpHref: 'https://support.microsoft.com/outlook/import-or-subscribe-to-a-calendar-in-outlook-com-or-outlook-on-the-web-cff1429c-5af6-41ec-a5b4-74f2c278e98c',
    action: {
      label: 'Open Outlook Calendar',
      href: 'https://outlook.live.com/calendar/0/view/month',
    },
  },
];
