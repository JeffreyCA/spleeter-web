import * as React from 'react';
import { DateTime } from 'luxon';

const SEC_PER_MIN = 60;
const DAYS_PER_WEEK = 7;

/**
 * Convert ISO date string to custom format (hybrid of relative and absolute date)
 */
export const toRelativeDateSpan = (isoDateString: string): JSX.Element => {
  const dateTime = DateTime.fromISO(isoDateString);
  const longDateTimeStr = dateTime.toLocaleString(DateTime.DATETIME_MED);
  const diffSeconds = -dateTime.diffNow().as('seconds');
  const diffDays = -dateTime.diffNow().as('days');
  let label;

  if (diffSeconds < SEC_PER_MIN) {
    label = 'moments ago';
  } else if (diffDays < DAYS_PER_WEEK) {
    label = dateTime.toRelative();
  } else {
    label = dateTime.toLocaleString(DateTime.DATE_MED);
  }
  return <span title={longDateTimeStr ?? undefined}>{label}</span>;
};

// Credit to @kenfehling/react-designable-audio-player
export const zeroPadNumber = (number: number): string => {
  return number < 10 ? '0' + number : number.toString();
};

export const formatTime = (seconds: number): string => {
  if (typeof seconds === 'number' && seconds > 0) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds - m * 60);
    return zeroPadNumber(m) + ':' + zeroPadNumber(s);
  } else {
    return '00:00';
  }
};
