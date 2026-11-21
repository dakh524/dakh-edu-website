// src/utils/dateUtils.js
// Utility functions for UTC‑based YYYY‑MM‑DD arithmetic.
// Supports both ISO "YYYY-MM-DD" and legacy "DD MMM YYYY" date strings.

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/**
 * Parse either ISO (YYYY-MM-DD) or legacy (DD MMM YYYY) strings.
 * Returns a Date at UTC midnight.
 * Throws a descriptive error on invalid format — never returns Invalid Date.
 */
export const parseYMD = (str) => {
  if (!str || typeof str !== 'string') {
    throw new Error(`parseYMD: expected a non-empty string, got ${JSON.stringify(str)}`);
  }
  const s = str.trim();

  // 1. ISO format: YYYY-MM-DD
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (isoMatch) {
    const [, y, m, d] = isoMatch.map(Number);
    if (m < 1 || m > 12 || d < 1 || d > 31) {
      throw new Error(`parseYMD: out-of-range values in ISO date "${str}"`);
    }
    return new Date(Date.UTC(y, m - 1, d));
  }

  // 2. Legacy format: DD MMM YYYY  (e.g. "27 Nov 2026")
  const legacyMatch = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/.exec(s);
  if (legacyMatch) {
    const [, dayStr, monStr, yearStr] = legacyMatch;
    const day  = Number(dayStr);
    const year = Number(yearStr);
    const monthIdx = MONTH_NAMES.findIndex(mn => mn.toLowerCase() === monStr.toLowerCase());
    if (monthIdx === -1) {
      throw new Error(`parseYMD: unrecognised month "${monStr}" in date "${str}"`);
    }
    if (day < 1 || day > 31) {
      throw new Error(`parseYMD: out-of-range day "${day}" in date "${str}"`);
    }
    return new Date(Date.UTC(year, monthIdx, day));
  }

  throw new Error(`parseYMD: unrecognised date format "${str}" (expected YYYY-MM-DD or DD MMM YYYY)`);
};

/**
 * Parse a duration string like "30 Days" (case-insensitive).
 * Returns integer number of days.
 * Throws on invalid format.
 */
export const parseDuration = (dur) => {
  if (!dur || typeof dur !== 'string') {
    throw new Error(`parseDuration: expected a non-empty string, got ${JSON.stringify(dur)}`);
  }
  const m = /^\s*(\d+)\s*days?\s*$/i.exec(dur.trim());
  if (!m) {
    throw new Error(`parseDuration: unrecognised format "${dur}" (expected e.g. "30 Days")`);
  }
  const n = Number(m[1]);
  if (n <= 0) throw new Error(`parseDuration: duration must be positive, got ${n}`);
  return n;
};

/**
 * Add inclusive days to a UTC Date.
 * end = start + (days - 1)
 */
export const addDaysInclusive = (startDate, days) => {
  const date = new Date(startDate);
  date.setUTCDate(date.getUTCDate() + days - 1);
  return date;
};

/**
 * Format a UTC Date back to YYYY-MM-DD.
 */
export const formatYMD = (date) => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Compute the inclusive end date string (YYYY-MM-DD) from a start string and
 * a duration string.  Accepts both ISO and legacy start-date formats.
 * Throws if either argument cannot be parsed.
 */
export const computeInclusiveEnd = (startStr, durationStr) => {
  const startDate = parseYMD(startStr);       // throws on bad format
  const days      = parseDuration(durationStr); // throws on bad format
  const endDate   = addDaysInclusive(startDate, days);
  return formatYMD(endDate);
};
