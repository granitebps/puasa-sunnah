import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Calendar,
  dateFnsLocalizer,
  DateHeaderProps,
  Event,
  Navigate,
  ToolbarProps,
} from 'react-big-calendar';
import { isWeekend } from 'date-fns/isWeekend';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { getYear } from 'date-fns/getYear';
import { enUS } from 'date-fns/locale/en-US';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import { fetchFastings, fetchFastingTypes } from './api/fastingApi';
import AddToCalendarModal from './components/AddToCalendarModal';
import SingleEventExportModal from './components/SingleEventExportModal';
import {
  buildPuasaSunnahIcs,
  createCalendarFilename,
  downloadIcs,
  filterCalendarEvents,
} from './features/calendarExport';
import {
  applyTheme,
  getInitialTheme,
  readStoredTheme,
  THEME_MEDIA_QUERY,
  type Theme,
  writeStoredTheme,
} from './features/theme';
import { formatMonth, getDateColor, getMiddleDate } from './utils';
import { NOW, WEEKEND_BG_COLOR } from './constants';
import { ExportRequest, Fasting, Type } from './types';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const currentMonth = formatMonth(NOW);
const currentYear = getYear(NOW);
const apiBaseUrl =
  import.meta.env.VITE_API_URL || 'https://api.puasa-sunnah.granitebps.com';

interface CalendarToolbarProps extends ToolbarProps {
  buttonRef: RefObject<HTMLButtonElement>;
  onAddToCalendar: () => void;
  onToggleTheme: () => void;
  theme: Theme;
}

function CalendarToolbar({
  buttonRef,
  label,
  localizer: toolbarLocalizer,
  onAddToCalendar,
  onNavigate,
  onToggleTheme,
  theme,
}: CalendarToolbarProps) {
  const { messages } = toolbarLocalizer;

  return (
    <div className='rbc-toolbar'>
      <span className='rbc-btn-group'>
        <button onClick={() => onNavigate(Navigate.TODAY)} type='button'>
          {messages.today}
        </button>
        <button onClick={() => onNavigate(Navigate.PREVIOUS)} type='button'>
          {messages.previous}
        </button>
        <button onClick={() => onNavigate(Navigate.NEXT)} type='button'>
          {messages.next}
        </button>
      </span>
      <span className='rbc-toolbar-label'>{label}</span>
      <span className='rbc-btn-group'>
        <button
          className='calendar-export-toolbar-button'
          onClick={onAddToCalendar}
          ref={buttonRef}
          type='button'
        >
          Add to calendar
        </button>
        <button
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className='theme-toggle'
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          type='button'
        >
          <span aria-hidden='true'>{theme === 'dark' ? '☀' : '☾'}</span>
        </button>
      </span>
    </div>
  );
}

function App() {
  const [monthNow, setMonthNow] = useState(currentMonth);
  const [yearNow, setYearNow] = useState(currentYear);
  const [fastings, setFastings] = useState<Event[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFastings, setExportFastings] = useState<Fasting[]>([]);
  const [exportTypes, setExportTypes] = useState<Type[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportLoadError, setExportLoadError] = useState<string | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [deliverySuccess, setDeliverySuccess] = useState<string | null>(null);
  const [selectedFasting, setSelectedFasting] = useState<Fasting | null>(null);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const exportRequestSequence = useRef(0);
  const exportButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchFastings(apiBaseUrl, monthNow, yearNow);
        const formattedFastings = data.map((fasting) => ({
          id: fasting.id,
          title: fasting.type.name,
          allDay: true,
          start: new Date(fasting.date),
          end: new Date(fasting.date),
          resource: fasting,
        }));
        setFastings(formattedFastings);
      } catch (error) {
        console.log(error);
      }
    };
    loadData();
  }, [monthNow, yearNow]);

  // Fasting type style
  const eventPropGetter = useCallback((event: Event) => {
    const fasting = event.resource as Fasting;
    return {
      style: {
        backgroundColor: fasting.type.background_color,
        color: fasting.type.text_color,
      },
    };
  }, []);

  // Weekend Styling
  const dayPropGetter = useCallback((date: Date) => {
    return {
      ...(isWeekend(date) && {
        style: {
          backgroundColor: WEEKEND_BG_COLOR,
        },
      }),
    };
  }, []);

  // Handling month changes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onRangeChange = useCallback((range: any) => {
    const middleDate = getMiddleDate(range.start, range.end);
    setMonthNow(formatMonth(middleDate));
    setYearNow(getYear(middleDate));
  }, []);

  const onSelectEvent = useCallback((event: Event) => {
    setSelectedFasting(event.resource as Fasting);
  }, []);

  const { defaultDate } = useMemo(
    () => ({
      defaultDate: new Date(),
    }),
    []
  );

  const HeaderCellContent = (props: DateHeaderProps) => {
    return <span style={{ color: getDateColor(props) }}>{props.label}</span>;
  };

  const loadExportFastings = useCallback(
    async () => {
      const sequence = ++exportRequestSequence.current;
      const months = Array.from({ length: 12 }, (_, index) => index + 1);

      setExportLoading(true);
      setExportFastings([]);
      setExportTypes([]);
      setExportLoadError(null);
      setDeliveryError(null);
      setDeliverySuccess(null);

      try {
        const [types, responses] = await Promise.all([
          fetchFastingTypes(apiBaseUrl),
          Promise.all(
            months.map((month) =>
              fetchFastings(apiBaseUrl, month, currentYear),
            ),
          ),
        ]);
        if (sequence === exportRequestSequence.current) {
          setExportTypes(types);
          setExportFastings(responses.flat());
        }
      } catch {
        if (sequence === exportRequestSequence.current) {
          setExportLoadError('Unable to load the complete fasting schedule.');
        }
      } finally {
        if (sequence === exportRequestSequence.current) {
          setExportLoading(false);
        }
      }
    },
    [],
  );

  const closeExportModal = useCallback(() => {
    exportRequestSequence.current += 1;
    setExportOpen(false);
    setDeliverySuccess(null);
    exportButtonRef.current?.focus();
  }, []);

  const openExportModal = useCallback(() => {
    setDeliverySuccess(null);
    setExportOpen(true);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (readStoredTheme() || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(THEME_MEDIA_QUERY);
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      writeStoredTheme(nextTheme);
      return nextTheme;
    });
  }, []);

  const { components } = useMemo(
    () => ({
      components: {
        toolbar: (props: ToolbarProps) => (
          <CalendarToolbar
            {...props}
            buttonRef={exportButtonRef}
            onAddToCalendar={openExportModal}
            onToggleTheme={toggleTheme}
            theme={theme}
          />
        ),
        month: {
          dateHeader: HeaderCellContent,
        },
      },
    }),
    [openExportModal, theme, toggleTheme],
  );

  const exportToCalendar = useCallback(
    (request: ExportRequest) => {
      setDeliveryError(null);
      setDeliverySuccess(null);
      const selectedFastings = filterCalendarEvents(
        exportFastings.map((fasting) => ({
          id: fasting.id,
          typeId: fasting.type.id,
          date: fasting.date,
          typeName: fasting.type.name,
          description: fasting.type.description,
        })),
        request.scope,
        request.month,
        currentYear,
        request.typeIds,
      );
      const calendar = buildPuasaSunnahIcs(
        selectedFastings,
        { withReminder: request.reminder === 'one-day-before' },
      );
      const selectedTypeIds = new Set(request.typeIds);
      const selectedTypeNames = exportTypes
        .filter((type) => selectedTypeIds.has(type.id))
        .map((type) => type.name);
      const filename = createCalendarFilename(
        request.scope,
        request.month,
        currentYear,
        selectedTypeNames,
        selectedTypeNames.length === exportTypes.length,
      );

      try {
        downloadIcs(filename, calendar);
        setDeliverySuccess(`Downloaded ${filename}. Follow the guide below to import it.`);
      } catch {
        setDeliveryError('Unable to download the calendar file.');
      }
    },
    [exportFastings, exportTypes],
  );

  return (
    <div className='app-shell'>
      <Calendar
        localizer={localizer}
        defaultDate={defaultDate}
        events={fastings}
        defaultView='month'
        style={{ flex: 1 }}
        popup
        views={['month']}
        dayPropGetter={dayPropGetter}
        eventPropGetter={eventPropGetter}
        onRangeChange={onRangeChange}
        onSelectEvent={onSelectEvent}
        components={components}
      />
      <AddToCalendarModal
        currentMonth={currentMonth}
        currentYear={currentYear}
        deliveryError={deliveryError}
        deliverySuccess={deliverySuccess}
        fastings={exportFastings}
        isLoading={exportLoading}
        loadError={exportLoadError}
        onClose={closeExportModal}
        onExport={exportToCalendar}
        onLoad={loadExportFastings}
        open={exportOpen}
        types={exportTypes}
      />
      <SingleEventExportModal
        fasting={selectedFasting}
        onClose={() => setSelectedFasting(null)}
      />
    </div>
  );
}

export default App;
