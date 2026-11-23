/**
 * Deduplicate registrations to eliminate accidental double submissions and duplicate UI rows.
 * Prioritizes approved records and complete intern credentials.
 */
export const deduplicateRegistrations = (list) => {
  if (!Array.isArray(list) || list.length === 0) return [];
  
  // 1. Sort so approved records and those with intern_number come first, then latest by created_at
  const sorted = [...list].sort((a, b) => {
    if (a.status === 'Approved' && b.status !== 'Approved') return -1;
    if (b.status === 'Approved' && a.status !== 'Approved') return 1;
    if (a.intern_number && !b.intern_number) return -1;
    if (b.intern_number && !a.intern_number) return 1;
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });

  const seenIds = new Set();
  const seenSignatures = new Map();
  const deduped = [];

  for (const reg of sorted) {
    if (!reg || !reg.id) continue;
    if (seenIds.has(reg.id)) continue;
    seenIds.add(reg.id);

    const email = (reg.email || '').trim().toLowerCase();
    const domain = (reg.domain || '').trim().toLowerCase();
    const utr = (reg.utr_number || '').trim().toLowerCase();
    const timeMs = reg.created_at ? new Date(reg.created_at).getTime() : 0;

    let isDuplicate = false;
    if (email && domain) {
      // Signature 1: exact same email + domain + UTR (for non-trivial UTR)
      if (utr && utr !== 'pending_pay_later' && utr !== 'pending' && utr.length > 3) {
        const utrSig = `${email}|${domain}|${utr}`;
        if (seenSignatures.has(utrSig)) {
          isDuplicate = true;
        } else {
          seenSignatures.set(utrSig, true);
        }
      }

      // Signature 2: rapid double submit within 10 minutes (600,000 ms) for identical student & domain
      if (!isDuplicate) {
        const recentTimeKey = `${email}|${domain}`;
        const prevTime = seenSignatures.get(recentTimeKey);
        if (typeof prevTime === 'number' && Math.abs(timeMs - prevTime) < 600000) {
          isDuplicate = true;
        } else if (prevTime === undefined) {
          seenSignatures.set(recentTimeKey, timeMs);
        }
      }
    }

    if (!isDuplicate) {
      deduped.push(reg);
    }
  }

  // Restore chronological order (newest first)
  return deduped.sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
};
