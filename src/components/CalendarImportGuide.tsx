import { useEffect, useRef, useState } from 'react';

import { calendarImportGuides } from '../features/calendarImportGuide';

interface CalendarImportGuideProps {
  openByDefault?: boolean;
}

function CalendarImportGuide({ openByDefault = false }: CalendarImportGuideProps) {
  const [selectedGuideId, setSelectedGuideId] = useState(
    calendarImportGuides[0].id,
  );
  const guideRef = useRef<HTMLElement>(null);
  const selectedGuide =
    calendarImportGuides.find((guide) => guide.id === selectedGuideId) ??
    calendarImportGuides[0];

  useEffect(() => {
    if (openByDefault) {
      setSelectedGuideId('native');
      guideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [openByDefault]);

  return (
    <section
      className={`calendar-import-guide${openByDefault ? ' calendar-import-guide-ready' : ''}`}
      aria-labelledby='calendar-import-guide-title'
      ref={guideRef}
    >
      <div className='calendar-import-guide-header'>
        <span>Step 2</span>
        <h3 id='calendar-import-guide-title'>Import into your calendar</h3>
        <p>
          {openByDefault
            ? 'Your file is ready. Choose your calendar provider below.'
            : 'Download the schedule, then follow the steps for your calendar.'}
        </p>
      </div>

      <div aria-label='Calendar provider' className='calendar-import-tabs' role='tablist'>
        {calendarImportGuides.map((guide) => (
          <button
            aria-controls={`calendar-import-panel-${guide.id}`}
            aria-selected={selectedGuideId === guide.id}
            className={selectedGuideId === guide.id ? 'calendar-import-tab-active' : ''}
            id={`calendar-import-tab-${guide.id}`}
            key={guide.id}
            onClick={() => setSelectedGuideId(guide.id)}
            role='tab'
            type='button'
          >
            {guide.title}
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`calendar-import-tab-${selectedGuide.id}`}
        className='calendar-import-panel'
        id={`calendar-import-panel-${selectedGuide.id}`}
        role='tabpanel'
        tabIndex={0}
      >
        <p>{selectedGuide.description}</p>
        <ol>
          {selectedGuide.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {selectedGuide.note && (
          <p className='calendar-import-note'>{selectedGuide.note}</p>
        )}
        <div className='calendar-import-links'>
          {selectedGuide.action && (
            <a href={selectedGuide.action.href} rel='noreferrer' target='_blank'>
              {selectedGuide.action.label}
            </a>
          )}
          <a href={selectedGuide.helpHref} rel='noreferrer' target='_blank'>
            Official instructions
          </a>
        </div>
      </div>
    </section>
  );
}

export default CalendarImportGuide;
