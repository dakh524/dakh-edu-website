// test/api-schedule.test.js
// Tests for the server-side schedule helpers inside api/approve-registration.js
// Extracted inline helpers are replicated here so we can test them in Node directly
// without spinning up a Vercel serverless environment.

// ----- Replicate inline helpers from api/approve-registration.js -----
const MONTH_NAMES_API = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function apiParseDate(str) {
  if (!str || typeof str !== 'string') throw new Error(`Invalid date value: ${JSON.stringify(str)}`);
  const s = str.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) {
    const [, y, m, d] = iso.map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }
  const legacy = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/.exec(s);
  if (legacy) {
    const [, dayStr, monStr, yearStr] = legacy;
    const monthIdx = MONTH_NAMES_API.findIndex(mn => mn.toLowerCase() === monStr.toLowerCase());
    if (monthIdx === -1) throw new Error(`Unrecognised month "${monStr}"`);
    return new Date(Date.UTC(Number(yearStr), monthIdx, Number(dayStr)));
  }
  throw new Error(`Unrecognised date format "${str}"`);
}

function apiParseDuration(dur) {
  const m = /^\s*(\d+)\s*days?\s*$/i.exec((dur || '').trim());
  if (!m) throw new Error(`Unrecognised duration "${dur}"`);
  const n = Number(m[1]);
  if (n <= 0) throw new Error(`Duration must be positive`);
  return n;
}

function apiFormatYMD(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}-${String(date.getUTCDate()).padStart(2,'0')}`;
}

function apiComputeInclusiveEnd(startStr, durationStr) {
  const startDate = apiParseDate(startStr);
  const days = apiParseDuration(durationStr);
  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + days - 1);
  return apiFormatYMD(endDate);
}
// ----------------------------------------------------------------------

let passed = 0, failed = 0;

function assert(desc, cond, detail = '') {
  if (cond) { console.log(`  ✅ ${desc}`); passed++; }
  else { console.error(`  ❌ ${desc}${detail ? ' — ' + detail : ''}`); failed++; }
}
function assertThrows(desc, fn) {
  try { fn(); console.error(`  ❌ ${desc} — expected throw`); failed++; }
  catch (e) { console.log(`  ✅ ${desc} (threw: ${e.message})`); passed++; }
}

console.log('\n── API schedule helpers ──');
assert('30 Days, legacy start → 2026-12-26',
  apiComputeInclusiveEnd('27 Nov 2026', '30 Days') === '2026-12-26');

assert('30 Days, ISO start → 2026-12-26',
  apiComputeInclusiveEnd('2026-11-27', '30 Days') === '2026-12-26');

assert('29 Days, legacy start → 2026-12-25',
  apiComputeInclusiveEnd('27 Nov 2026', '29 Days') === '2026-12-25');

assertThrows('Bad start format throws', () => apiComputeInclusiveEnd('27-11-2026', '30 Days'));
assertThrows('Bad duration throws',     () => apiComputeInclusiveEnd('2026-11-27', '30'));

console.log('\n── Mismatch detection logic ──');
// Simulate what the API does
function simulateApiScheduleCheck(confirmedStartDate, confirmedDuration, confirmedEndDate) {
  if (!confirmedStartDate || !confirmedDuration) return { status: 400, code: 'INVALID_SCHEDULE' };
  let serverComputedEnd;
  try { serverComputedEnd = apiComputeInclusiveEnd(confirmedStartDate, confirmedDuration); }
  catch (e) { return { status: 400, code: 'INVALID_SCHEDULE', error: e.message }; }

  if (confirmedEndDate && confirmedEndDate !== serverComputedEnd) {
    return { status: 400, code: 'SCHEDULE_MISMATCH', calculatedEndDate: serverComputedEnd };
  }
  return { status: 200, computedEnd: serverComputedEnd };
}

const r1 = simulateApiScheduleCheck('27 Nov 2026', '30 Days', '25 Dec 2026');
assert('Mismatch: "25 Dec 2026" vs "2026-12-26" → SCHEDULE_MISMATCH (400)', r1.status === 400 && r1.code === 'SCHEDULE_MISMATCH');
assert('Mismatch: calculatedEndDate = 2026-12-26', r1.calculatedEndDate === '2026-12-26');

const r2 = simulateApiScheduleCheck('27 Nov 2026', '30 Days', '2026-12-26');
assert('Matching ISO end date → 200 OK', r2.status === 200);

const r3 = simulateApiScheduleCheck('2026-11-27', '29 Days', '2026-12-25');
assert('29 Days, ISO start, correct end → 200 OK', r3.status === 200);
assert('29 Days computed end is 2026-12-25', r3.computedEnd === '2026-12-25');

const r4 = simulateApiScheduleCheck('bad-date', '30 Days', '');
assert('Bad start date → 400 INVALID_SCHEDULE', r4.status === 400);

console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
