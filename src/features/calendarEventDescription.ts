const PROMOTIONAL_FOOTER = [
  'Jadwal dari Puasa Sunnah Calendar.',
  'Lihat jadwal puasa sunnah lainnya: https://puasa-sunnah.granitebps.com',
].join('\n');

export const buildCalendarEventDescription = (description = ''): string => {
  const content = description.trim();
  return content ? `${content}\n\n${PROMOTIONAL_FOOTER}` : PROMOTIONAL_FOOTER;
};
