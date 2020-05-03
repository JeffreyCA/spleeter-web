import React from 'react'
import { DateTime } from 'luxon'

const DAYS_PER_WEEK = 7

/**
 * Convert ISO date string to custom format (hybrid of relative and absolute date)
 */
export const toRelativeDateSpan = isoDateString => {
  const dateTime = DateTime.fromISO(isoDateString)
  const longDateTimeStr = dateTime.toLocaleString(DateTime.DATETIME_MED)
  const diffDays = -dateTime.diffNow().as('days')
  var label

  if (diffDays < DAYS_PER_WEEK) {
    label = dateTime.toRelative()
  } else {
    label = dateTime.toLocaleString(DateTime.DATE_MED)
  }
  return <span title={longDateTimeStr}>{label}</span>
}
