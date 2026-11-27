import crypto from 'crypto';
import { supabaseAdmin } from './_lib/supabaseServer.js';
import { 
  generateSearchQueries, 
  normalizeProfileUrl, 
  generateRecruitmentMessage 
} from '../src/utils/recruitmentUtils.js';

/**
 * Server-side SHA-256 hash generator
 */
function sha256(text) {
  return crypto.createHash('sha256').update(String(text).toLowerCase()).digest('hex');
}

/**
 * Fetch search results using DuckDuckGo HTML search engine (Zero-paid API)
 */
async function fetchDuckDuckGoResults(query, page = 0) {
  try {
    const startParam = page > 0 ? page * 20 : 0;
    const bodyParams = new URLSearchParams({
      q: query,
      b: '',
      kl: 'in-en',
      s: String(startParam),
      dc: String(startParam)
    });

    const res = await fetch('https://html.duckduckgo.com/html/', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://html.duckduckgo.com/'
      },
      body: bodyParams.toString(),
      signal: AbortSignal.timeout(8000)
    });

    if (!res.ok) {
      console.warn(`[Recruitment Engine] DuckDuckGo search status ${res.status} for query: ${query}`);
      return [];
    }

    const html = await res.text();
    const resultBlocks = html.split('class="result ');
    const results = [];

    for (let i = 1; i < resultBlocks.length; i++) {
      const block = resultBlocks[i];
      
      // Extract target url (resolves DDG redirect wrapper if present)
      const urlMatch = block.match(/href="([^"]+uddg=([^"&]+)[^"]*)"/) || 
                       block.match(/class="result__url"[^>]*href="([^"]+)"/) ||
                       block.match(/class="result__snippet"[^>]*href="([^"]+)"/);

      let targetUrl = '';
      if (urlMatch) {
        if (urlMatch[2]) {
          try {
            targetUrl = decodeURIComponent(urlMatch[2]);
          } catch {
            targetUrl = urlMatch[2];
          }
        } else {
          targetUrl = urlMatch[1];
        }
      }

      // Title
      const titleMatch = block.match(/class="result__title"[^>]*>([\s\S]*?)<\/h2>/);
      let title = '';
      if (titleMatch) {
        title = titleMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").trim();
      }

      // Snippet
      const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
      let snippet = '';
      if (snippetMatch) {
        snippet = snippetMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").trim();
      }

      if (targetUrl && (title || snippet)) {
        results.push({ title, snippet, targetUrl });
      }
    }

    return results;
  } catch (err) {
    console.warn('[Recruitment Engine] Search fetch error:', err.message);
    return [];
  }
}

/**
 * Fetch from configurable self-hosted SearXNG if configured in environment
 */
async function fetchSearXNGResults(query, page = 0) {
  const searxUrl = process.env.SEARXNG_URL;
  if (!searxUrl) return null;

  try {
    const url = `${searxUrl.replace(/\/+$/, '')}/search?q=${encodeURIComponent(query)}&format=json&pageno=${page + 1}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) DakhRecruitmentEngine/1.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results)) {
        return data.results.map(r => ({
          title: r.title || '',
          snippet: r.content || '',
          targetUrl: r.url || ''
        }));
      }
    }
  } catch (err) {
    console.warn('[Recruitment Engine] Configured SearXNG unreachable, falling back to DDG:', err.message);
  }
  return null;
}

/**
 * Deterministic AI / Heuristic verification & data extraction engine
 */
function verifyAndExtractCandidate(item, filters) {
  const { title = '', snippet = '', targetUrl = '' } = item;
  const combined = `${title} ${snippet}`;

  // 1. Candidate Name Extraction
  let name = '';
  const linkedinTitleMatch = title.match(/^([A-Za-z\s.]+?)(?:\s*[-–|•]\s*|\s*\|)/);
  if (linkedinTitleMatch && linkedinTitleMatch[1].trim().split(' ').length <= 4) {
    name = linkedinTitleMatch[1].trim();
  } else {
    const words = title.split(/[-–|•]/)[0].trim();
    if (words && words.length < 35 && words.split(' ').length <= 4) {
      name = words;
    }
  }

  name = name.replace(/^(profile of|resume of|cv of)\s+/i, '')
             .replace(/\s+(on linkedin|linkedin|github)$/i, '')
             .replace(/\.+$/, '')
             .trim();

  // Validate non-generic name
  if (!name || name.length < 3 || /^(student|campus|ambassador|intern|internship|member|lead|profile|overview|welcome)$/i.test(name)) {
    return null; // Exclude non-person results
  }

  // 2. College matching & extraction
  let college = filters.college || '';
  let collegeFound = false;
  if (filters.college) {
    const collegeClean = filters.college.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 15);
    collegeFound = new RegExp(collegeClean, 'i').test(combined);
  }

  if (!college) {
    const colMatch = combined.match(/([A-Z][A-Za-z\s&]+(?:College of Engineering|Engineering College|Institute of Technology|University|Campus))/);
    if (colMatch) {
      college = colMatch[1].trim();
      collegeFound = true;
    } else {
      college = filters.state ? `${filters.state} Region` : 'Verified Institution';
    }
  }

  // 3. Department Extraction
  let department = '';
  const deptMatch = combined.match(/\b(Computer Science(?: and Engineering)?|CSE|Information Technology|IT|Electronics and Communication(?: Engineering)?|ECE|Electrical and Electronics(?: Engineering)?|EEE|Mechanical(?: Engineering)?|MECH|Civil(?: Engineering)?|Artificial Intelligence|AI\/DS|AIDS|Data Science|Cyber Security|Aerospace)\b/i);
  if (deptMatch) {
    let rawDept = deptMatch[1].toUpperCase();
    if (rawDept.includes('COMPUTER SCIENCE')) department = 'CSE';
    else if (rawDept.includes('ELECTRONICS AND COMMUNICATION')) department = 'ECE';
    else if (rawDept.includes('ELECTRICAL AND ELECTRONICS')) department = 'EEE';
    else if (rawDept.includes('MECHANICAL')) department = 'MECH';
    else if (rawDept.includes('INFORMATION TECHNOLOGY')) department = 'IT';
    else department = rawDept;
  }

  // 4. Academic Year & Graduation Batch
  let academicYear = filters.academicYear && filters.academicYear !== 'All Years' ? filters.academicYear : '';
  let graduationBatch = filters.expectedGraduation || '';

  const batchMatch = combined.match(/\b(?:batch of|class of|graduating in|passed out in|expected graduation\s*:?\s*|batch\s*:?\s*)(\d{4})\b/i) ||
                     combined.match(/\b(202[4-9])\s*(?:passout|batch|graduat)/i) ||
                     combined.match(/\b(?:202\d\s*[-–]\s*)(202[5-9])\b/);

  if (batchMatch) {
    graduationBatch = batchMatch[1];
  }

  const yearMatch = combined.match(/\b(1st|2nd|3rd|4th|first|second|third|fourth|final|pre-final)\s*(?:year|yr)\b/i);
  if (yearMatch) {
    const yStr = yearMatch[1].toLowerCase();
    if (yStr.includes('1') || yStr.includes('first')) academicYear = '1st Year';
    else if (yStr.includes('2') || yStr.includes('second')) academicYear = '2nd Year';
    else if (yStr.includes('3') || yStr.includes('third') || yStr.includes('pre-final')) academicYear = '3rd Year';
    else if (yStr.includes('4') || yStr.includes('fourth') || yStr.includes('final')) academicYear = '4th Year';
  }

  if (!academicYear) {
    academicYear = filters.academicYear && filters.academicYear !== 'All Years' ? filters.academicYear : '2nd Year';
  }
  if (!graduationBatch) {
    graduationBatch = filters.expectedGraduation || '2028-2029';
  }

  // 5. Experience / Role
  let experience = '';
  const expMatch = combined.match(/(?:Campus Ambassador[^|•,.\n]*|Student Ambassador[^|•,.\n]*|Lead at[^|•,.\n]*|President[^|•,.\n]*|Coordinator[^|•,.\n]*|Secretary[^|•,.\n]*|Intern at[^|•,.\n]*|Developer at[^|•,.\n]*|Member at[^|•,.\n]*)/i);
  if (expMatch) {
    experience = expMatch[0].trim();
  } else {
    experience = filters.candidateType || 'Student Leader';
  }

  // 6. Match Status Classification
  const roleKeywordsMatch = filters.candidateType 
    ? new RegExp(filters.candidateType.slice(0, 7), 'i').test(combined) 
    : true;
  
  const yearMatchConfirm = filters.expectedGraduation 
    ? combined.includes(filters.expectedGraduation) 
    : true;

  let matchStatus = 'Partial Match';
  if (collegeFound && roleKeywordsMatch && name) {
    if (yearMatchConfirm || batchMatch) {
      matchStatus = 'Strong Match';
    } else {
      matchStatus = 'Partial Match';
    }
  } else if (name && (collegeFound || roleKeywordsMatch)) {
    matchStatus = 'Verification Pending';
  } else {
    // If neither college nor role matches, exclude as irrelevant
    return null;
  }

  // 7. Canonical Profile URL Normalization
  const canonicalUrl = normalizeProfileUrl(targetUrl);
  const profileHash = sha256(canonicalUrl);

  // Evidence snippet
  const evidence = snippet.length > 250 ? `${snippet.slice(0, 250)}...` : snippet;

  return {
    name,
    college: college || filters.college || 'Verified College',
    department: department || 'Not explicitly specified',
    academicYear,
    graduationBatch,
    experience,
    matchStatus,
    profileUrl: canonicalUrl,
    profileHash,
    evidence,
    sourceUrl: targetUrl,
    personalizedMessage: generateRecruitmentMessage({
      candidateName: name,
      college: college || filters.college,
      department,
      experience,
      academicYear
    })
  };
}

/**
 * AI Recruitment Search API Handler
 */
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Verify User Authentication (Admin or Team Member)
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
    }
  } catch (authErr) {
    return res.status(401).json({ error: 'Authentication failed', details: authErr.message });
  }

  const {
    state = 'Tamil Nadu',
    district = '',
    college = '',
    academicYear = '2nd Year',
    expectedGraduation = '2029',
    candidateType = 'Campus ambassadors',
    maxCandidates = 20,
    page = 0,
    seenHashes = []
  } = req.body || {};

  const seenHashSet = new Set(Array.isArray(seenHashes) ? seenHashes : []);

  try {
    // 2. Intelligent Query Generation
    const queries = generateSearchQueries({
      state,
      district,
      college,
      academicYear,
      expectedGraduation,
      candidateType
    });

    const targetLimit = Math.min(Math.max(parseInt(maxCandidates, 10) || 20, 5), 100);
    const discoveredCandidates = [];
    let duplicatesSkipped = 0;
    let irrelevantExcluded = 0;
    let totalRawResults = 0;
    const sourcesSet = new Set();

    // 3. Execute queries with fallback
    for (let qIndex = 0; qIndex < queries.length; qIndex++) {
      if (discoveredCandidates.length >= targetLimit) break;

      const q = queries[qIndex];
      // Track sources based on query
      if (q.includes('linkedin.com/in')) sourcesSet.add('LinkedIn Profiles');
      if (q.includes('linkedin.com/posts')) sourcesSet.add('LinkedIn Posts');
      if (q.includes('github.com')) sourcesSet.add('GitHub Profiles');
      if (q.includes('unstop.com') || q.includes('devpost.com')) sourcesSet.add('Competition Platforms');
      if (q.includes('student') || q.includes('engineering')) sourcesSet.add('Campus Directories');

      // Try SearXNG first if configured, else DuckDuckGo
      let rawResults = await fetchSearXNGResults(q, page);
      if (!rawResults || rawResults.length === 0) {
        rawResults = await fetchDuckDuckGoResults(q, page);
      }

      totalRawResults += rawResults.length;

      // 4. Verification and Duplicate Prevention
      for (const item of rawResults) {
        if (discoveredCandidates.length >= targetLimit) break;

        const verified = verifyAndExtractCandidate(item, {
          state,
          district,
          college,
          academicYear,
          expectedGraduation,
          candidateType
        });

        if (!verified) {
          irrelevantExcluded++;
          continue;
        }

        // Strict duplicate suppression via SHA-256 hash
        if (seenHashSet.has(verified.profileHash)) {
          duplicatesSkipped++;
          continue;
        }

        // Add to active set and candidate list
        seenHashSet.add(verified.profileHash);
        discoveredCandidates.push(verified);
      }

      // Polite small delay between queries
      if (qIndex < queries.length - 1 && discoveredCandidates.length < targetLimit) {
        await new Promise(resolve => setTimeout(resolve, 350));
      }
    }

    // Sort: Strong Match first, then Partial Match, then Verification Pending
    discoveredCandidates.sort((a, b) => {
      const order = { 'Strong Match': 1, 'Partial Match': 2, 'Verification Pending': 3 };
      return (order[a.matchStatus] || 4) - (order[b.matchStatus] || 4);
    });

    const strongMatches = discoveredCandidates.filter(c => c.matchStatus === 'Strong Match').length;
    const verificationPending = discoveredCandidates.filter(c => c.matchStatus === 'Verification Pending').length;

    return res.status(200).json({
      success: true,
      candidates: discoveredCandidates,
      stats: {
        sourcesSearched: Array.from(sourcesSet),
        resultsDiscovered: totalRawResults,
        duplicatesSkipped,
        irrelevantExcluded,
        strongMatches,
        verificationPending,
        uniqueCandidatesDisplayed: discoveredCandidates.length
      },
      page,
      hasMore: discoveredCandidates.length >= targetLimit
    });
  } catch (err) {
    console.error('[Recruitment Engine API Error]:', err);
    return res.status(500).json({
      error: 'Recruitment search encountered an unexpected error',
      details: err.message
    });
  }
}
