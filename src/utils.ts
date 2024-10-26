import { isWeekend } from 'date-fns';
import { getMonth } from 'date-fns/getMonth';
import { DateHeaderProps } from 'react-big-calendar';
import { DATE_OFF_RANGE_COLOR, WEEKEND_COLOR } from './constants';

export const formatMonth = (date: Date): number => {
  return getMonth(date) + 1;
};

export const getMiddleDate = (start: Date, end: Date): Date => {
  return new Date((start.getTime() + end.getTime()) / 2);
};

export const getDateColor = (props: DateHeaderProps) => {
  if (isWeekend(props.date)) {
    return WEEKEND_COLOR;
  }
  if (props.isOffRange) {
    return DATE_OFF_RANGE_COLOR;
  }
};
