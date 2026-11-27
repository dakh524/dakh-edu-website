import { useState, useRef, useEffect } from 'react';
import { 
  Search, RefreshCw, Square, Trash2, ExternalLink, FileText, Check, 
  Copy, ShieldCheck, AlertTriangle, Clock, Sparkles, Filter, Building2, 
  MapPin, GraduationCap, Users, Info, X, ChevronRight, Globe, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
  INDIAN_STATES_AND_UTS, 
  CANDIDATE_TYPES, 
  ACADEMIC_YEARS, 
  calculateExpectedGraduation 
} from '../utils/recruitmentUtils';

export default function AIRecruitmentEngine() {
  // Form Filter State
  const [selectedState, setSelectedState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('');
  const [college, setCollege] = useState('Panimalar Engineering College');
  const [academicYear, setAcademicYear] = useState('2nd Year');
  const [expectedGraduation, setExpectedGraduation] = useState('2029');
  const [candidateType, setCandidateType] = useState('Campus ambassadors');
  const [maxCandidates, setMaxCandidates] = useState(20);

  // Search Execution State
  const [isSearching, setIsSearching] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [seenHashes, setSeenHashes] = useState(new Set());
  const [page, setPage] = useState(0);
  const [searchError, setSearchError] = useState(null);
  const [activeEvidenceCandidate, setActiveEvidenceCandidate] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  // Live Statistics
  const [stats, setStats] = useState({
    sourcesSearched: [],
    resultsDiscovered: 0,
    duplicatesSkipped: 0,
    irrelevantExcluded: 0,
    strongMatches: 0,
    verificationPending: 0,
    uniqueCandidatesDisplayed: 0
  });

  // Abort Controller for search cancellation
  const abortControllerRef = useRef(null);

  // Auto-calculate graduation year when academic year changes (unless manually edited)
  useEffect(() => {
    if (academicYear === '2nd Year') {
      setExpectedGraduation('2029');
    } else {
      setExpectedGraduation(String(calculateExpectedGraduation(academicYear)));
    }
  }, [academicYear]);

  // Execute Search (Initial or "Find More")
  const executeSearch = async (isFindMore = false) => {
    setSearchError(null);
    setIsSearching(true);

    const nextPage = isFindMore ? page + 1 : 0;
    const currentSeen = isFindMore ? Array.from(seenHashes) : [];

    // Setup abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // 1. Get Supabase session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';

      // 2. Call backend search API
      const res = await fetch('/api/recruitment-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          state: selectedState,
          district: district.trim(),
          college: college.trim(),
          academicYear,
          expectedGraduation: expectedGraduation.trim(),
          candidateType,
          maxCandidates: parseInt(maxCandidates, 10),
          page: nextPage,
          seenHashes: currentSeen
        }),
        signal: abortControllerRef.current.signal
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || `Search failed with status ${res.status}`);
      }

      const data = await res.json();
      const newCandidates = data.candidates || [];

      // Update in-memory seen hashes
      const updatedHashSet = new Set(seenHashes);
      newCandidates.forEach(c => updatedHashSet.add(c.profileHash));
      setSeenHashes(updatedHashSet);

      // Update candidate list
      if (isFindMore) {
        setCandidates(prev => [...prev, ...newCandidates]);
      } else {
        setCandidates(newCandidates);
      }

      setPage(nextPage);

      // Update statistics
      setStats(prev => ({
        sourcesSearched: Array.from(new Set([...(prev.sourcesSearched || []), ...(data.stats?.sourcesSearched || [])])),
        resultsDiscovered: (isFindMore ? prev.resultsDiscovered : 0) + (data.stats?.resultsDiscovered || 0),
        duplicatesSkipped: (isFindMore ? prev.duplicatesSkipped : 0) + (data.stats?.duplicatesSkipped || 0),
        irrelevantExcluded: (isFindMore ? prev.irrelevantExcluded : 0) + (data.stats?.irrelevantExcluded || 0),
        strongMatches: (isFindMore ? prev.strongMatches : 0) + (data.stats?.strongMatches || 0),
        verificationPending: (isFindMore ? prev.verificationPending : 0) + (data.stats?.verificationPending || 0),
        uniqueCandidatesDisplayed: (isFindMore ? prev.uniqueCandidatesDisplayed : 0) + newCandidates.length
      }));

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[Recruitment Engine] Search cancelled by user');
      } else {
        console.error('[Recruitment Engine Error]:', err);
        setSearchError(err.message || 'An error occurred during search. Please check your connection and retry.');
      }
    } finally {
      setIsSearching(false);
      abortControllerRef.current = null;
    }
  };

  // Stop Search Action
  const handleStopSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsSearching(false);
  };

  // Reset Search Session Action
  const handleResetSession = () => {
    if (candidates.length > 0 && !window.confirm('Reset this recruitment search session? In-memory candidates and duplicate cache will be cleared.')) {
      return;
    }
    handleStopSearch();
    setCandidates([]);
    setSeenHashes(new Set());
    setPage(0);
    setSearchError(null);
    setStats({
      sourcesSearched: [],
      resultsDiscovered: 0,
      duplicatesSkipped: 0,
      irrelevantExcluded: 0,
      strongMatches: 0,
      verificationPending: 0,
      uniqueCandidatesDisplayed: 0
    });
  };

  // Copy Recruitment Message with feedback
  const handleCopyMessage = (candidate, index) => {
    const text = candidate.personalizedMessage;
    navigator.clipboard.writeText(text);
    setCopiedMessageId(index);
    setTimeout(() => setCopiedMessageId(null), 2500);
  };

  const popularColleges = [
    'Panimalar Engineering College',
    'Sri Sairam Engineering College',
    'Chennai Institute of Technology',
    'VIT Vellore',
    'SRM University',
    'Anna University'
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-purple-800/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="bg-purple-600/30 text-purple-200 text-xs font-bold px-3 py-1 rounded-full border border-purple-400/30 flex items-center gap-1.5 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" /> AI Web Research Assistant
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Zero Permanent Storage • Privacy First
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              AI Campus Recruitment Engine
            </h1>
            <p className="text-purple-200/80 text-sm md:text-base mt-1 max-w-2xl">
              Discover verified student leaders, campus ambassadors, and internship seekers across top colleges in real-time with evidence-backed matching.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <button
              onClick={() => handleResetSession()}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              title="Clear temporary session memory and duplicate cache"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-300" /> Reset Session
            </button>
          </div>
        </div>

        {/* In-Memory Privacy Disclosure */}
        <div className="mt-4 pt-4 border-t border-purple-800/60 flex items-center gap-2 text-xs text-purple-200/70">
          <Info className="w-4 h-4 shrink-0 text-purple-300" />
          <span>
            <strong>Session Memory Notice:</strong> Candidate profiles and search history are held purely in temporary memory during your active browser session. No candidate records are saved in any permanent database.
          </span>
        </div>
      </div>

      {/* Search Filters Dashboard Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">Target Search Parameters</h2>
          </div>
          <span className="text-xs text-gray-500">Live Multi-Query Web Discovery</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* State / UT */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-500" /> State / Union Territory *
            </label>
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              {INDIAN_STATES_AND_UTS.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-500" /> District (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Chennai, Thiruvallur, Coimbatore"
              value={district}
              onChange={e => setDistrict(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Candidate Type */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-500" /> Candidate Category *
            </label>
            <select
              value={candidateType}
              onChange={e => setCandidateType(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              {CANDIDATE_TYPES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* College Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-purple-500" /> College Name (Optional / Recommended)
            </label>
            <input
              type="text"
              placeholder="e.g. Panimalar Engineering College"
              value={college}
              onChange={e => setCollege(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            {/* Quick Pills */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-gray-400 font-semibold mr-1">Quick Select:</span>
              {popularColleges.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCollege(c)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    college === c 
                      ? 'bg-purple-100 text-purple-700 border-purple-300 font-bold' 
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {c.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-purple-500" /> Academic Year *
            </label>
            <select
              value={academicYear}
              onChange={e => setAcademicYear(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              {ACADEMIC_YEARS.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          {/* Expected Graduation Year */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-500" /> Expected Graduation Batch
            </label>
            <input
              type="text"
              placeholder="e.g. 2029"
              value={expectedGraduation}
              onChange={e => setExpectedGraduation(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <p className="text-[11px] text-gray-400 mt-1">Dynamically calculated based on course duration</p>
          </div>

          {/* Max Candidates */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-500" /> Maximum Candidates *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 50, 100].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setMaxCandidates(cnt)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    maxCandidates === cnt
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-slate-50 text-gray-700 border-gray-200 hover:bg-slate-100'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Start AI Recruitment Search */}
            <button
              onClick={() => executeSearch(false)}
              disabled={isSearching}
              className={`px-6 py-3 rounded-2xl font-bold text-sm text-white flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                isSearching 
                  ? 'bg-purple-400 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/25 active:scale-95'
              }`}
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Searching Live Web...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Start AI Recruitment Search
                </>
              )}
            </button>

            {/* Find More Candidates */}
            <button
              onClick={() => executeSearch(true)}
              disabled={isSearching || candidates.length === 0}
              className={`px-5 py-3 rounded-2xl font-bold text-sm border flex items-center gap-2 transition-all ${
                isSearching || candidates.length === 0
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50 active:scale-95 cursor-pointer shadow-sm'
              }`}
              title="Discovers fresh candidates without repeating previous profiles"
            >
              <RefreshCw className="w-4 h-4" /> Find More Candidates
            </button>

            {/* Stop Search */}
            {isSearching && (
              <button
                onClick={handleStopSearch}
                className="px-4 py-3 rounded-2xl font-bold text-sm bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-rose-600" /> Stop Search
              </button>
            )}
          </div>

          {/* Quick status pill */}
          <div className="text-xs text-gray-500 font-medium">
            {candidates.length > 0 ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {candidates.length} verified unique profiles discovered
              </span>
            ) : isSearching ? (
              <span className="text-purple-600 font-bold flex items-center gap-1.5 animate-pulse">
                <Globe className="w-4 h-4" /> Querying search providers...
              </span>
            ) : (
              <span>Ready to search real student profiles</span>
            )}
          </div>
        </div>

        {/* Search Error Banner */}
        {searchError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <p className="font-bold">Search Encountered an Issue</p>
              <p className="text-xs mt-0.5 text-rose-600">{searchError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Live Search Statistics Bar */}
      {(candidates.length > 0 || isSearching || stats.resultsDiscovered > 0) && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-600" /> Live Web Research Telemetry
            </h3>
            {stats.sourcesSearched.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {stats.sourcesSearched.map(s => (
                  <span key={s} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
              <div className="text-xl font-extrabold text-slate-800">{stats.resultsDiscovered}</div>
              <div className="text-[11px] text-gray-500 font-medium mt-0.5">Results Discovered</div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100 text-center">
              <div className="text-xl font-extrabold text-emerald-700">{stats.uniqueCandidatesDisplayed}</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Unique Displayed</div>
            </div>

            <div className="bg-purple-50 rounded-2xl p-3 border border-purple-100 text-center">
              <div className="text-xl font-extrabold text-purple-700">{stats.strongMatches}</div>
              <div className="text-[11px] text-purple-600 font-medium mt-0.5">Strong Matches</div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-3 border border-blue-100 text-center">
              <div className="text-xl font-extrabold text-blue-700">{stats.verificationPending}</div>
              <div className="text-[11px] text-blue-600 font-medium mt-0.5">Partial / Pending</div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100 text-center">
              <div className="text-xl font-extrabold text-amber-700">{stats.duplicatesSkipped}</div>
              <div className="text-[11px] text-amber-600 font-medium mt-0.5">Duplicates Skipped</div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 text-center">
              <div className="text-xl font-extrabold text-gray-600">{stats.irrelevantExcluded}</div>
              <div className="text-[11px] text-gray-500 font-medium mt-0.5">Irrelevant Excluded</div>
            </div>
          </div>
        </div>
      )}

      {/* Candidates Results Grid */}
      {candidates.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>Discovered Student Profiles</span>
              <span className="text-xs bg-purple-100 text-purple-700 font-extrabold px-2.5 py-0.5 rounded-full">
                {candidates.length}
              </span>
            </h3>
            <span className="text-xs text-gray-400">Click &ldquo;View Evidence&rdquo; to inspect source verification</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map((c, idx) => {
              const isStrong = c.matchStatus === 'Strong Match';
              const isPartial = c.matchStatus === 'Partial Match';

              return (
                <motion.div
                  key={c.profileHash || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  {/* Top Status & Role */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-extrabold text-gray-900">{c.name}</h4>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            isStrong 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : isPartial 
                              ? 'bg-purple-50 text-purple-700 border-purple-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {c.matchStatus}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-purple-700 mt-0.5 flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {c.college}
                        </p>
                      </div>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600 mt-2">
                      {c.department && c.department !== 'Not explicitly specified' && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700 text-[11px]">
                          {c.department}
                        </span>
                      )}
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700 text-[11px]">
                        {c.academicYear} • Batch {c.graduationBatch}
                      </span>
                      <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-md font-medium text-[11px]">
                        {c.experience}
                      </span>
                    </div>

                    {/* Evidence Teaser */}
                    <div className="mt-3 bg-slate-50/80 rounded-xl p-2.5 text-xs text-gray-600 border border-slate-100 line-clamp-2 italic">
                      &ldquo;{c.evidence}&rdquo;
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {/* Open Profile Button */}
                      <a
                        href={c.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-purple-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" /> Open Profile
                      </a>

                      {/* View Evidence Button */}
                      <button
                        onClick={() => setActiveEvidenceCandidate(c)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3 h-3" /> View Evidence
                      </button>
                    </div>

                    {/* Copy Recruitment Message Button */}
                    <button
                      onClick={() => handleCopyMessage(c, idx)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                        copiedMessageId === idx
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-95 shadow-sm'
                      }`}
                      title="Copy personalized invitation for Business Growth Associate"
                    >
                      {copiedMessageId === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Invite Message
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : !isSearching ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Ready to Discover Student Candidates</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
              Select your targeted state, college, and candidate type above and click &ldquo;Start AI Recruitment Search&rdquo; to begin real-time web discovery.
            </p>
          </div>
          <button
            onClick={() => executeSearch(false)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            Launch Sample Search (Panimalar Engineering College)
          </button>
        </div>
      ) : null}

      {/* Evidence Modal */}
      <AnimatePresence>
        {activeEvidenceCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-5 relative"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-gray-900">Verification Evidence</h3>
                </div>
                <button
                  onClick={() => setActiveEvidenceCandidate(null)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Candidate Name</label>
                  <p className="font-extrabold text-gray-900 text-base">{activeEvidenceCandidate.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Verified College</label>
                    <p className="font-semibold text-gray-800 text-xs">{activeEvidenceCandidate.college}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Department</label>
                    <p className="font-semibold text-gray-800 text-xs">{activeEvidenceCandidate.department}</p>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Extracted Web Evidence Snippet</label>
                  <div className="mt-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-700 leading-relaxed font-mono">
                    {activeEvidenceCandidate.evidence}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Canonical Profile Link</label>
                  <a
                    href={activeEvidenceCandidate.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-purple-700 font-semibold truncate hover:underline mt-0.5"
                  >
                    {activeEvidenceCandidate.profileUrl}
                  </a>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">SHA-256 Profile Hash (Duplicate Prevention Key)</label>
                  <p className="text-[10px] text-gray-400 font-mono truncate">{activeEvidenceCandidate.profileHash}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setActiveEvidenceCandidate(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
                <a
                  href={activeEvidenceCandidate.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Verified Source
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
