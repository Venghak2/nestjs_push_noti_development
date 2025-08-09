import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import * as timezone from 'dayjs/plugin/timezone';
import { TIME_ZONE_TH, TIME_ZONE_UTC } from '../constants/dayjs.const';
import {} from '../constants/dayjs.const';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

dayjs.tz.setDefault(TIME_ZONE_UTC);

export const dayjsCastTz = (date: Date, timezone: string): dayjs.Dayjs =>
  dayjs(date).tz(timezone);

export const dayjsUTC = (date?: Date) => {
  return date
    ? dayjs.tz(date, TIME_ZONE_UTC).locale('th')
    : dayjs().tz(TIME_ZONE_UTC).locale('th');
};
export const dayjsTz = (date?: Date) =>
  date
    ? dayjs(date).locale('th').tz(TIME_ZONE_TH)
    : dayjs().locale('th').tz(TIME_ZONE_TH);
