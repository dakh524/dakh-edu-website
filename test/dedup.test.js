import assert from 'assert';
import { deduplicateRegistrations } from '../src/utils/registrationUtils.js';

console.log('\n── deduplicateRegistrations ──');

// Test 1: Empty list
assert.deepStrictEqual(deduplicateRegistrations([]), []);
console.log('  ✅ Empty array returns empty array');

// Test 2: Exact duplicate IDs
const listWithDupIds = [
  { id: '1', email: 'test@example.com', domain: 'Web Dev', created_at: '2026-11-23T10:00:00Z', status: 'Pending' },
  { id: '1', email: 'test@example.com', domain: 'Web Dev', created_at: '2026-11-23T10:00:00Z', status: 'Pending' }
];
assert.strictEqual(deduplicateRegistrations(listWithDupIds).length, 1);
console.log('  ✅ Filters out exact duplicate IDs');

// Test 3: Rapid double submission (same email + same domain + same UTR)
const rapidDoubleSubmit = [
  { id: 'uuid-1', email: 'raj@gmail.com', domain: 'PCB Design', utr_number: 'UTR123456789', created_at: '2026-11-23T10:00:00Z', status: 'Pending' },
  { id: 'uuid-2', email: 'raj@gmail.com', domain: 'PCB Design', utr_number: 'UTR123456789', created_at: '2026-11-23T10:00:02Z', status: 'Pending' }
];
assert.strictEqual(deduplicateRegistrations(rapidDoubleSubmit).length, 1);
console.log('  ✅ Filters out rapid double submission with identical UTR');

// Test 4: Preserves Approved record over duplicate Pending record
const approvedAndPending = [
  { id: 'uuid-dup-1', email: 'priya@gmail.com', domain: 'AWS Cloud', utr_number: 'UTR999', created_at: '2026-11-23T09:00:00Z', status: 'Approved', intern_number: 'DAKH26AWS001' },
  { id: 'uuid-dup-2', email: 'priya@gmail.com', domain: 'AWS Cloud', utr_number: 'UTR999', created_at: '2026-11-23T09:00:03Z', status: 'Pending' }
];
const result4 = deduplicateRegistrations(approvedAndPending);
assert.strictEqual(result4.length, 1);
assert.strictEqual(result4[0].status, 'Approved');
assert.strictEqual(result4[0].intern_number, 'DAKH26AWS001');
console.log('  ✅ Keeps Approved record when duplicate exists');

// Test 5: Does NOT filter out legitimate different domain registrations
const differentDomains = [
  { id: 'uuid-a', email: 'arun@gmail.com', domain: 'Web Development', utr_number: 'UTR1', created_at: '2026-11-23T08:00:00Z', status: 'Pending' },
  { id: 'uuid-b', email: 'arun@gmail.com', domain: 'PCB Design', utr_number: 'UTR2', created_at: '2026-11-23T08:00:00Z', status: 'Pending' }
];
assert.strictEqual(deduplicateRegistrations(differentDomains).length, 2);
console.log('  ✅ Preserves separate registrations for different domains');

console.log('\n────────────────────────────────────────\nAll dedup tests passed!\n');
