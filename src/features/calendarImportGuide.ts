export interface CalendarImportGuide {
  title: string;
  steps: string[];
}

export const calendarImportGuides: CalendarImportGuide[] = [
  {
    title: 'Apple Calendar',
    steps: [
      'Open the downloaded .ics file from Downloads.',
      'Choose the destination calendar, then confirm the import.',
    ],
  },
  {
    title: 'Google Calendar',
    steps: [
      'Open Google Calendar on a computer and go to Settings.',
      'Select Import and export, then choose the downloaded .ics file.',
      'Choose a destination calendar and select Import.',
    ],
  },
  {
    title: 'Outlook',
    steps: [
      'Open Calendar and select Add calendar.',
      'Choose Upload from file, select the downloaded .ics file, and import it.',
    ],
  },
  {
    title: 'Mobile',
    steps: [
      'Open the downloaded .ics file from your browser downloads.',
      'Choose your calendar app and confirm the events to import.',
    ],
  },
];
