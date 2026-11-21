import React, { useState, useMemo } from 'react';
import { PieChart as PieIcon, Sparkles, ChevronDown, ChevronUp, Check } from 'lucide-react';

const PALETTE = [
  { stroke: '#8b5cf6', fill: '#8b5cf6', bg: 'bg-purple-50 text-purple-700 border-purple-200' }, // Purple
  { stroke: '#3b82f6', fill: '#3b82f6', bg: 'bg-blue-50 text-blue-700 border-blue-200' },       // Blue
  { stroke: '#10b981', fill: '#10b981', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }, // Emerald
  { stroke: '#f59e0b', fill: '#f59e0b', bg: 'bg-amber-50 text-amber-700 border-amber-200' },   // Amber
  { stroke: '#ec4899', fill: '#ec4899', bg: 'bg-pink-50 text-pink-700 border-pink-200' },       // Pink
  { stroke: '#06b6d4', fill: '#06b6d4', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },       // Cyan
  { stroke: '#f97316', fill: '#f97316', bg: 'bg-orange-50 text-orange-700 border-orange-200' }, // Orange
  { stroke: '#6366f1', fill: '#6366f1', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' }, // Indigo
  { stroke: '#64748b', fill: '#64748b', bg: 'bg-slate-50 text-slate-700 border-slate-200' },   // Slate
];

export default function DomainDistributionChart({ 
  registrations = [], 
  selectedDomain = 'all', 
  onSelectDomain 
}) {
  const [hoveredDomain, setHoveredDomain] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Compute domain aggregation
  const { domainList, totalCount, topDomain } = useMemo(() => {
    if (!registrations || registrations.length === 0) {
      return { domainList: [], totalCount: 0, topDomain: null };
    }

    const counts = {};
    registrations.forEach(r => {
      const raw = (r.domain || 'Unspecified').trim();
      counts[raw] = (counts[raw] || 0) + 1;
    });

    const total = registrations.length;
    const sorted = Object.entries(counts)
      .map(([name, count], index) => {
        const color = PALETTE[index % PALETTE.length];
        const pct = (count / total) * 100;
        return {
          name,
          count,
          pct: Number(pct.toFixed(1)),
          color
        };
      })
      .sort((a, b) => b.count - a.count);

    return {
      domainList: sorted,
      totalCount: total,
      topDomain: sorted[0] || null
    };
  }, [registrations]);

  if (totalCount === 0) return null;

  // Circumference of circle with r=36 is 2 * PI * 36 = 226.19467
  const RADIUS = 36;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  let cumulativePercent = 0;
  const slices = domainList.map(item => {
    const strokeDasharray = `${(item.pct / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
    const strokeDashoffset = -((cumulativePercent / 100) * CIRCUMFERENCE);
    cumulativePercent += item.pct;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset
    };
  });

  const activeDisplay = hoveredDomain || (selectedDomain !== 'all' ? domainList.find(d => d.name === selectedDomain) : null) || topDomain;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs mb-6 overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                Domain Registration Analytics
              </h3>
              {topDomain && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Top: {topDomain.name} ({topDomain.pct}%)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Real-time distribution of {totalCount} registered students across {domainList.length} internship domains.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedDomain !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectDomain && onSelectDomain('all')}
              className="text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Show All ({totalCount})
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isExpanded ? "Collapse Chart" : "Expand Chart"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Chart Body */}
      {isExpanded && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Interactive Donut / Pie Chart */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-52 h-52 flex items-center justify-center">
              <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full transform -rotate-90 filter drop-shadow-xs"
              >
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="14"
                />

                {/* Slices */}
                {slices.map((slice) => {
                  const isHovered = hoveredDomain?.name === slice.name;
                  const isSelected = selectedDomain === slice.name;
                  return (
                    <circle
                      key={slice.name}
                      cx="50"
                      cy="50"
                      r={RADIUS}
                      fill="none"
                      stroke={slice.color.stroke}
                      strokeWidth={isHovered || isSelected ? 17 : 14}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      className="transition-all duration-300 cursor-pointer"
                      style={{
                        opacity: hoveredDomain && !isHovered ? 0.45 : 1,
                        filter: isHovered || isSelected ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' : 'none'
                      }}
                      onMouseEnter={() => setHoveredDomain(slice)}
                      onMouseLeave={() => setHoveredDomain(null)}
                      onClick={() => onSelectDomain && onSelectDomain(selectedDomain === slice.name ? 'all' : slice.name)}
                    />
                  );
                })}
              </svg>

              {/* Center Info Hole */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                {activeDisplay ? (
                  <>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate max-w-[120px]">
                      {activeDisplay.name}
                    </span>
                    <span className="text-2xl font-black text-slate-900 leading-none my-0.5">
                      {activeDisplay.pct}%
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {activeDisplay.count} intern{activeDisplay.count > 1 ? 's' : ''}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-black text-slate-900 leading-none">
                      {totalCount}
                    </span>
                    <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">
                      Total Interns
                    </span>
                  </>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 font-medium text-center">
              Click slice or domain bar to filter students table
            </p>
          </div>

          {/* Right: Domain Ranking & Percentage Bars */}
          <div className="md:col-span-7 space-y-2">
            {domainList.map((domain, rank) => {
              const isSelected = selectedDomain === domain.name;
              const isHovered = hoveredDomain?.name === domain.name;

              return (
                <div
                  key={domain.name}
                  onClick={() => onSelectDomain && onSelectDomain(isSelected ? 'all' : domain.name)}
                  onMouseEnter={() => setHoveredDomain(domain)}
                  onMouseLeave={() => setHoveredDomain(null)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected 
                      ? 'bg-purple-50/90 border-purple-300 ring-2 ring-purple-500/20 shadow-xs' 
                      : isHovered 
                        ? 'bg-slate-50 border-slate-300 shadow-2xs' 
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span 
                        className="w-3 h-3 rounded-full shrink-0 shadow-2xs" 
                        style={{ backgroundColor: domain.color.fill }} 
                      />
                      <span className="font-extrabold text-slate-800 truncate">
                        {domain.name}
                      </span>
                      {rank === 0 && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md">
                          #1 Most Registered
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-slate-700 text-[11px]">
                        {domain.count} ({domain.pct}%)
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold bg-purple-600 text-white px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Filtered
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${domain.pct}%`, 
                        backgroundColor: domain.color.fill 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
