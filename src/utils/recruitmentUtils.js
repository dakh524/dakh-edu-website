/**
 * DAKH AI Recruitment Engine - Utilities & Data Constants
 * Privacy-first, zero-database in-memory research assistant helpers.
 */

// All 28 Indian States + 8 Union Territories
export const INDIAN_STATES_AND_UTS = [
  // States
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

// 10 Candidate Categories required
export const CANDIDATE_TYPES = [
  'General college students',
  'Campus ambassadors',
  'Student leaders',
  'Marketing interns',
  'Business development interns',
  'Internship seekers',
  'Technical club members',
  'Entrepreneurship club members',
  'Hackathon participants',
  'Symposium coordinators'
];

export const ACADEMIC_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'All Years'
];

/**
 * Calculate expected graduation year dynamically based on academic year
 * Assuming 4-year undergraduate degree (B.E./B.Tech) starting in current academic cycle.
 */
export function calculateExpectedGraduation(academicYear, currentYear = new Date().getFullYear()) {
  switch (academicYear) {
    case '1st Year':
      return currentYear + 3; // Entered this cycle, 3 more years
    case '2nd Year':
      return currentYear + 2; // Entered last year, 2 more years (e.g. 2026 + 3 or batch 2028-2029)
    case '3rd Year':
      return currentYear + 1;
    case '4th Year':
      return currentYear;
    case 'All Years':
    default:
      return `${currentYear}-${currentYear + 3}`;
  }
}

/**
 * Normalize public profile URL:
 * - Lowercase protocol & host
 * - Normalize subdomains (e.g. in.linkedin.com -> linkedin.com)
 * - Strip all tracking/marketing query parameters (utm_*, trk, ref, trackingId, authType, etc.)
 * - Strip trailing slashes
 */
export function normalizeProfileUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  try {
    const url = new URL(rawUrl.trim());
    let host = url.hostname.toLowerCase();
    
    // Normalize regional/mobile LinkedIn subdomains
    if (host.includes('linkedin.com')) {
      host = 'linkedin.com';
    } else if (host.includes('github.com')) {
      host = 'github.com';
    }
    
    // Clean pathname
    let pathname = url.pathname.replace(/\/+$/, '');
    
    // Whitelisted clean URL
    return `${url.protocol}//${host}${pathname}`.toLowerCase();
  } catch (err) {
    // Fallback if URL parsing fails
    return rawUrl.split('?')[0].split('#')[0].replace(/\/+$/, '').toLowerCase();
  }
}

/**
 * Generate SHA-256 hash of canonical profile URL (Client-side & Server-side compatible)
 */
export async function generateProfileHash(canonicalUrl) {
  const norm = normalizeProfileUrl(canonicalUrl);
  if (!norm) return '';
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgUint8 = new TextEncoder().encode(norm);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Simple fallback for node environment if subtle crypto not globally available
  let hash = 0;
  for (let i = 0; i < norm.length; i++) {
    hash = ((hash << 5) - hash) + norm.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * Generate multiple targeted search queries based on filters
 */
export function generateSearchQueries({
  state,
  district = '',
  college = '',
  academicYear = '2nd Year',
  expectedGraduation = '2029',
  candidateType = 'Campus ambassadors'
}) {
  const queries = [];
  const collegeFilter = college ? `"${college.trim()}"` : `"${state}"`;
  const locationTerms = [college ? `"${college.trim()}"` : null, district ? `"${district.trim()}"` : null, `"${state}"`].filter(Boolean).join(' ');

  // Mapping candidate type to search synonyms
  let roleKeywords = '"Campus Ambassador" OR "Student Ambassador"';
  if (candidateType.toLowerCase().includes('leader')) {
    roleKeywords = '"Student Lead" OR "Campus Lead" OR "President" OR "Coordinator"';
  } else if (candidateType.toLowerCase().includes('marketing')) {
    roleKeywords = '"Marketing Intern" OR "Social Media Lead" OR "Brand Ambassador"';
  } else if (candidateType.toLowerCase().includes('business')) {
    roleKeywords = '"Business Development Intern" OR "BDE Intern" OR "Growth Associate"';
  } else if (candidateType.toLowerCase().includes('internship seeker')) {
    roleKeywords = '"Seeking Internship" OR "Actively Looking for Internship" OR "Internship"';
  } else if (candidateType.toLowerCase().includes('technical club')) {
    roleKeywords = '"Coding Club" OR "GDSC" OR "IEEE" OR "Technical Club"';
  } else if (candidateType.toLowerCase().includes('entrepreneurship')) {
    roleKeywords = '"E-Cell" OR "EDC" OR "Entrepreneurship Club" OR "Startup Cell"';
  } else if (candidateType.toLowerCase().includes('hackathon')) {
    roleKeywords = '"Hackathon" OR "Smart India Hackathon" OR "Devpost" OR "Unstop"';
  } else if (candidateType.toLowerCase().includes('symposium')) {
    roleKeywords = '"Symposium Coordinator" OR "College Fest Organizer" OR "Event Coordinator"';
  }

  const gradYearTerm = expectedGraduation ? `("${expectedGraduation}" OR "Batch of ${expectedGraduation}" OR "${academicYear}")` : `("${academicYear}")`;

  // Query 1: LinkedIn Public Profiles (Highest precision)
  queries.push(`site:linkedin.com/in ${collegeFilter} (${roleKeywords}) ${gradYearTerm}`);

  // Query 2: LinkedIn Activity / Public Posts
  queries.push(`site:linkedin.com/posts ${collegeFilter} (${roleKeywords})`);

  // Query 3: GitHub Student Profiles
  queries.push(`site:github.com ${collegeFilter} ("student" OR "ambassador" OR "developer")`);

  // Query 4: Unstop / Devpost / Student Competition Platforms
  queries.push(`(site:unstop.com OR site:devpost.com) ${collegeFilter} ("ambassador" OR "lead" OR "participant")`);

  // Query 5: Broad Regional / College Search
  queries.push(`${locationTerms} (${roleKeywords}) ("student" OR "college" OR "engineering")`);

  return queries;
}

/**
 * Personalized Recruitment Message Generator (DAKH EDU SOLUTIONS Business Growth Associate)
 * Based strictly on verified public information without permanent storage or auto-messaging.
 */
export function generateRecruitmentMessage({
  candidateName = '',
  college = '',
  department = '',
  experience = '',
  academicYear = ''
}) {
  const firstName = candidateName ? candidateName.split(' ')[0] : 'there';
  const roleMention = experience ? `your experience with ${experience}` : 'your active student leadership profile';
  const collegeMention = college ? ` at ${college}` : '';

  return `Hi ${firstName},

I came across your profile and was impressed by ${roleMention}${collegeMention}.

At DAKH EDU SOLUTIONS, we are expanding our campus outreach across top engineering institutions and would like to invite you to collaborate with us as a Business Growth Associate (Campus Lead).

Key Highlights of the Opportunity:
• Flexible & Remote: Designed to balance seamlessly alongside your regular college academics.
• Zero Joining Fee: Free to join with no hidden upfront investment.
• Performance Incentives: Earn ₹100 per eligible, verified paid internship registration via your referral.
• Milestone Bonuses: Additional ₹250 cash bonus for every 10 eligible completed registrations.
• Growth & Recognition: Official DAKH EDU SOLUTIONS Certificate of Leadership and Letter of Recommendation (LOR).
• Transparent Guidelines: Performance/incentive-based student associate role (no fixed salary and no guaranteed permanent employment).

If you are interested in leading initiatives for your campus, check out our programs and apply directly here:
👉 https://dakhedusolutions.in/internship

Looking forward to connecting with you!

Best regards,
DAKH EDU SOLUTIONS Recruitment & Campus Relations Team`;
}
