// test/date-utils.test.js
// Tests for src/utils/dateUtils.js
// Run with: node test/date-utils.test.js

import {
  parseYMD,
  parseDuration,
  addDaysInclusive,
  formatYMD,
  computeInclusiveEnd,
} from '../src/utils/dateUtils.js';

let passed = 0;
let failed = 0;

function assert(description, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${description}`);
    passed++;
  } else {
    console.error(`  ❌ ${description}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

function assertThrows(description, fn) {
  try {
    fn();
    console.error(`  ❌ ${description} — expected an error but none was thrown`);
    failed++;
  } catch (e) {
    console.log(`  ✅ ${description} (threw: ${e.message})`);
    passed++;
  }
}

// ---------------------------------------------------------------------------
console.log('\n── parseYMD ──');
assert('ISO: 2026-11-27 → UTC midnight',
  parseYMD('2026-11-27').toISOString() === '2026-11-27T00:00:00.000Z');

assert('Legacy: "27 Nov 2026" → UTC midnight',
  parseYMD('27 Nov 2026').toISOString() === '2026-11-27T00:00:00.000Z');

assert('Legacy lowercase month: "27 nov 2026"',
  parseYMD('27 nov 2026').toISOString() === '2026-11-27T00:00:00.000Z');

assert('Legacy single-digit day: "1 Jan 2026"',
  parseYMD('1 Jan 2026').toISOString() === '2026-01-01T00:00:00.000Z');

assertThrows('Slash format "2026/11/27" throws',       () => parseYMD('2026/11/27'));
assertThrows('Partial "Nov 2026" throws',              () => parseYMD('Nov 2026'));
assertThrows('Empty string throws',                    () => parseYMD(''));
assertThrows('null throws',                            () => parseYMD(null));
assertThrows('Invalid month "27 Xyz 2026" throws',     () => parseYMD('27 Xyz 2026'));

// ---------------------------------------------------------------------------
console.log('\n── parseDuration ──');
assert('"30 Days" → 30', parseDuration('30 Days') === 30);
assert('"29 days" → 29', parseDuration('29 days') === 29);
assert('"  1 Day  " → 1', parseDuration('  1 Day  ') === 1);
assertThrows('"30" (no "days") throws', () => parseDuration('30'));
assertThrows('Empty string throws', () => parseDuration(''));

// ---------------------------------------------------------------------------
console.log('\n── computeInclusiveEnd ──');
assert('30 Days from "27 Nov 2026" → "2026-12-26"',
  computeInclusiveEnd('27 Nov 2026', '30 Days') === '2026-12-26');

assert('30 Days from "2026-11-27" (ISO) → "2026-12-26"',
  computeInclusiveEnd('2026-11-27', '30 Days') === '2026-12-26');

assert('29 Days from "27 Nov 2026" → "2026-12-25"',
  computeInclusiveEnd('27 Nov 2026', '29 Days') === '2026-12-25');

assert('1 Day from "2026-01-01" → same day',
  computeInclusiveEnd('2026-01-01', '1 Day') === '2026-01-01');

assert('Leap year: 29 Days from "2024-02-01" → "2024-02-29"',
  computeInclusiveEnd('2024-02-01', '29 Days') === '2024-02-29');

assert('Year boundary: 10 Days from "2026-12-28" → "2027-01-06"',
  computeInclusiveEnd('2026-12-28', '10 Days') === '2027-01-06');

assertThrows('Bad start format throws', () => computeInclusiveEnd('27-11-2026', '30 Days'));
assertThrows('Bad duration throws',     () => computeInclusiveEnd('2026-11-27', '30'));

// ---------------------------------------------------------------------------
console.log('\n── addDaysInclusive / formatYMD ──');
{
  const start = parseYMD('2026-11-27');
  const end   = addDaysInclusive(start, 30);
  assert('addDaysInclusive(2026-11-27, 30) → 2026-12-26', formatYMD(end) === '2026-12-26');
}

// ---------------------------------------------------------------------------
console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
