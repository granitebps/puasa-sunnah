import { calendarImportGuides } from '../features/calendarImportGuide';

interface CalendarImportGuideProps {
  openByDefault?: boolean;
}

function CalendarImportGuide({ openByDefault = false }: CalendarImportGuideProps) {
  return (
    <details className='calendar-import-guide' open={openByDefault}>
      <summary>How to import the .ics file</summary>
      <div className='calendar-import-guide-content'>
        {calendarImportGuides.map((guide) => (
          <section key={guide.title}>
            <h3>{guide.title}</h3>
            <ol>
              {guide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </details>
  );
}

export default CalendarImportGuide;
