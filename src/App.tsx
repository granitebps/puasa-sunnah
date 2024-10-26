import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, DateHeaderProps, Event } from 'react-big-calendar';
import { isWeekend } from 'date-fns/isWeekend';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { getYear } from 'date-fns/getYear';
import { enUS } from 'date-fns/locale/en-US';
import axios from 'axios';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import { formatMonth, getDateColor, getMiddleDate } from './utils';
import { NOW, WEEKEND_BG_COLOR } from './constants';
import { Fasting } from './interface';

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

function App() {
  const [monthNow, setMonthNow] = useState(formatMonth(NOW));
  const [yearNow, setYearNow] = useState(getYear(NOW));
  const [fastings, setFastings] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/fastings?month=${monthNow}&year=${yearNow}`,
          {
            headers: {
              'Cache-Control': 'no-cache',
            },
          }
        );

        if (data.data) {
          const formatFasting = data.data.map((f: Fasting) => ({
            id: f.id,
            title: f.type.name,
            allDay: true,
            start: new Date(f.date),
            end: new Date(f.date),
            resource: f,
          }));
          setFastings(formatFasting);
        }
      } catch (error) {
        console.log(error);
      }
    };
    loadData();
  }, [monthNow, yearNow]);

  // Fasting type style
  const eventPropGetter = useCallback((event: Event) => {
    return {
      style: {
        backgroundColor: event.resource.type.background_color,
        color: event.resource.type.text_color,
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

  const onSelectEvent = useCallback((e: Event) => {
    alert(e.title);
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

  const { components } = useMemo(
    () => ({
      components: {
        month: {
          dateHeader: HeaderCellContent,
        },
      },
    }),
    []
  );

  return (
    <Calendar
      localizer={localizer}
      defaultDate={defaultDate}
      events={fastings}
      defaultView='month'
      style={{ height: '100vh' }}
      popup
      views={['month']}
      dayPropGetter={dayPropGetter}
      eventPropGetter={eventPropGetter}
      onRangeChange={onRangeChange}
      onSelectEvent={onSelectEvent}
      components={components}
    />
  );
}

export default App;
