import { useEffect, useMemo, useRef, useState } from 'react';

import { buildPuasaSunnahIcs, downloadIcs } from '../features/calendarExport';
import { buildCalendarEventDescription } from '../features/calendarEventDescription';
import { calendarImportGuides } from '../features/calendarImportGuide';
import {
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
  createSingleEventFilename,
} from '../features/singleEventCalendar';
import { Fasting } from '../types';
import './AddToCalendarModal.css';
import './SingleEventExportModal.css';

interface SingleEventExportModalProps {
  fasting: Fasting | null;
  onClose: () => void;
}

type ProviderId = 'native' | 'google' | 'outlook';
type ReminderOption = 'none' | 'one-day-before';

const getEventTitle = (typeName: string): string => {
  return `Puasa Sunnah: ${typeName.replace(/^Puasa\s+/i, '').trim()}`;
};

function SingleEventExportModal({ fasting, onClose }: SingleEventExportModalProps) {
  const [provider, setProvider] = useState<ProviderId>('native');
  const [reminder, setReminder] = useState<ReminderOption>('none');
  const [downloadedFilename, setDownloadedFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!fasting) {
      return;
    }

    setProvider('native');
    setReminder('none');
    setDownloadedFilename(null);
    setError(null);
    closeButtonRef.current?.focus();
  }, [fasting]);

  useEffect(() => {
    if (!fasting) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [fasting, onClose]);

  const providerEvent = useMemo(() => {
    if (!fasting) {
      return null;
    }

    return {
      date: fasting.date,
      title: getEventTitle(fasting.type.name),
      description: buildCalendarEventDescription(fasting.type.description),
    };
  }, [fasting]);

  if (!fasting || !providerEvent) {
    return null;
  }

  const downloadNativeEvent = () => {
    setError(null);
    const filename = createSingleEventFilename(fasting.date, fasting.type.name);
    const calendar = buildPuasaSunnahIcs(
      [
        {
          id: fasting.id,
          typeId: fasting.type.id,
          date: fasting.date,
          typeName: fasting.type.name,
          description: fasting.type.description,
        },
      ],
      { withReminder: reminder === 'one-day-before' },
    );

    try {
      downloadIcs(filename, calendar);
      setDownloadedFilename(filename);
    } catch {
      setError('Unable to download the calendar file.');
    }
  };

  const providerUrl =
    provider === 'google'
      ? buildGoogleCalendarUrl(providerEvent)
      : provider === 'outlook'
        ? buildOutlookCalendarUrl(providerEvent)
        : null;

  return (
    <div className='calendar-export-backdrop' onMouseDown={onClose}>
      <section
        aria-labelledby='single-event-export-title'
        aria-modal='true'
        className='calendar-export-modal single-event-export-modal'
        onMouseDown={(event) => event.stopPropagation()}
        role='dialog'
      >
        <div className='calendar-export-header'>
          <h2 id='single-event-export-title'>Add fasting to calendar</h2>
          <button
            aria-label='Close add fasting to calendar'
            className='calendar-export-close'
            onClick={onClose}
            ref={closeButtonRef}
            type='button'
          >
            ×
          </button>
        </div>

        <div className='single-event-details'>
          <strong>{providerEvent.title}</strong>
          <time dateTime={fasting.date}>{fasting.human_date || fasting.date}</time>
          {fasting.type.description && <p>{fasting.type.description}</p>}
        </div>

        <div aria-label='Calendar provider' className='calendar-import-tabs' role='tablist'>
          {calendarImportGuides.map((guide) => (
            <button
              aria-controls={`single-event-panel-${guide.id}`}
              aria-selected={provider === guide.id}
              className={provider === guide.id ? 'calendar-import-tab-active' : ''}
              id={`single-event-tab-${guide.id}`}
              key={guide.id}
              onClick={() => setProvider(guide.id)}
              role='tab'
              type='button'
            >
              {guide.title}
            </button>
          ))}
        </div>

        <div
          aria-labelledby={`single-event-tab-${provider}`}
          className='calendar-import-panel single-event-provider-panel'
          id={`single-event-panel-${provider}`}
          role='tabpanel'
        >
          {provider === 'native' ? (
            <>
              <p>
                Download one event, then open the .ics file with your installed calendar app.
              </p>
              <label className='calendar-export-reminder'>
                Notification
                <select
                  onChange={(event) => setReminder(event.target.value as ReminderOption)}
                  value={reminder}
                >
                  <option value='none'>Export without reminder</option>
                  <option value='one-day-before'>
                    Export with reminder 1 day before at 9:00 AM
                  </option>
                </select>
              </label>
              <small className='calendar-export-help'>
                Your calendar app may still apply its own default notifications.
              </small>
              <button
                className='calendar-export-primary single-event-provider-button'
                onClick={downloadNativeEvent}
                type='button'
              >
                Download .ics file
              </button>
            </>
          ) : (
            <>
              <p>
                This opens a prefilled all-day event. Review it, then select Save in{' '}
                {provider === 'google' ? 'Google Calendar' : 'Outlook'}.
              </p>
              <p className='calendar-import-note'>
                Your calendar provider controls the default notification. You can adjust it before saving.
              </p>
              <a
                className='single-event-provider-action'
                href={providerUrl ?? undefined}
                rel='noreferrer'
                target='_blank'
              >
                Open in {provider === 'google' ? 'Google Calendar' : 'Outlook'}
              </a>
            </>
          )}

          <div aria-live='polite' className='single-event-status'>
            {downloadedFilename && <p>Downloaded {downloadedFilename}.</p>}
            {error && <p className='calendar-export-error'>{error}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

export default SingleEventExportModal;
