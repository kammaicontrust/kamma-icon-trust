"use client";

import { useCallback, useRef } from "react";
import {
  Search, RotateCcw, Check, SlidersHorizontal,
  GraduationCap, MapPin, Briefcase, Wallet, Users, Heart
} from "lucide-react";

/* ─── Constants ──────────────────────────────────────────────────── */
const GENDERS       = ["Male", "Female"];
const MARITAL_OPTS  = ["Never Married", "Divorced", "Widowed", "Late Marriage"];
const EDUCATION_OPTS = [
  "", "10th / SSLC", "12th / Intermediate", "Diploma",
  "B.Tech / B.E.", "B.Sc", "B.Com", "B.A.",
  "M.Tech / M.E.", "M.Sc", "M.Com", "M.A.", "MBA",
  "MBBS / MD", "BDS", "LLB / LLM", "Ph.D", "Other"
];
const INCOME_OPTS = [
  "", "Below ₹3L", "₹3L – ₹6L", "₹6L – ₹12L",
  "₹12L – ₹25L", "₹25L – ₹50L", "Above ₹50L"
];

/* ─── Dual Range Slider ──────────────────────────────────────────── */
function DualRangeSlider({ min, max, value, onChange, unit = "", step = 1 }) {
  const trackRef = useRef(null);

  const left  = ((value[0] - min) / (max - min)) * 100;
  const right = ((value[1] - min) / (max - min)) * 100;

  const handleMin = (e) => {
    const v = Math.min(Number(e.target.value), value[1] - step);
    onChange([v, value[1]]);
  };

  const handleMax = (e) => {
    const v = Math.max(Number(e.target.value), value[0] + step);
    onChange([value[0], v]);
  };

  return (
    <div>
      <div className="flex justify-between mb-3">
        <span className="text-xs font-bold text-[#FF9933]">{value[0]}{unit}</span>
        <span className="text-xs font-bold text-[#FF9933]">{value[1]}{unit}</span>
      </div>
      <div className="range-slider-track" ref={trackRef}>
        <div
          className="range-slider-fill"
          style={{ left: `${left}%`, width: `${right - left}%` }}
        />
        <input
          type="range" min={min} max={max} step={step}
          value={value[0]} onChange={handleMin}
          className="range-input" style={{ zIndex: value[0] > max - 10 ? 5 : 3 }}
        />
        <input
          type="range" min={min} max={max} step={step}
          value={value[1]} onChange={handleMax}
          className="range-input" style={{ zIndex: 4 }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-[#0A1F44]/30">{min}{unit}</span>
        <span className="text-[10px] text-[#0A1F44]/30">{max}{unit}</span>
      </div>
    </div>
  );
}

/* ─── Section Label ──────────────────────────────────────────────── */
function FilterLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-[#FF9933]" strokeWidth={2} />
      <span className="text-xs font-black uppercase tracking-[0.15em] text-[#0A1F44]/50">
        {children}
      </span>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function ProfileFilters({
  pending,         // { gender, maritalStatuses, ageRange, heightRange, education, location, occupation, income }
  onPendingChange, // (field, value) => void
  onApply,
  onReset,
  matchCount,
  totalCount,
}) {
  const toggleGender = useCallback((g) => {
    onPendingChange("gender", pending.gender === g ? "" : g);
  }, [pending.gender, onPendingChange]);

  const toggleMarital = useCallback((status) => {
    const next = pending.maritalStatuses.includes(status)
      ? pending.maritalStatuses.filter(s => s !== status)
      : [...pending.maritalStatuses, status];
    onPendingChange("maritalStatuses", next);
  }, [pending.maritalStatuses, onPendingChange]);

  const hasFilters =
    pending.gender !== "" ||
    pending.maritalStatuses.length > 0 ||
    pending.ageRange[0] !== 18 || pending.ageRange[1] !== 60 ||
    pending.heightRange[0] !== 140 || pending.heightRange[1] !== 200 ||
    pending.education !== "" ||
    pending.location !== "" ||
    pending.occupation !== "" ||
    pending.income !== "";

  return (
    <div className="space-y-7">

      {/* ── Gender ── */}
      <div>
        <FilterLabel icon={Users}>Gender</FilterLabel>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map(g => (
            <button
              key={g}
              onClick={() => toggleGender(g)}
              className={`filter-chip ${pending.gender === g ? "filter-chip--active" : ""}`}
            >
              {g === "Male" ? "♂" : "♀"} {g}
            </button>
          ))}
        </div>
      </div>

      {/* ── Marital Status ── */}
      <div>
        <FilterLabel icon={Heart}>Marital Status</FilterLabel>
        <div className="flex flex-wrap gap-2">
          {MARITAL_OPTS.map(s => (
            <button
              key={s}
              onClick={() => toggleMarital(s)}
              className={`filter-chip ${pending.maritalStatuses.includes(s) ? "filter-chip--active" : ""}`}
            >
              {pending.maritalStatuses.includes(s) && <Check className="w-3 h-3" strokeWidth={3} />}
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Age Range ── */}
      <div>
        <FilterLabel icon={Users}>Age Range</FilterLabel>
        <DualRangeSlider
          min={18} max={60}
          value={pending.ageRange}
          onChange={v => onPendingChange("ageRange", v)}
          unit=" yrs"
        />
      </div>

      {/* ── Height Range ── */}
      <div>
        <FilterLabel icon={SlidersHorizontal}>Height Range</FilterLabel>
        <DualRangeSlider
          min={140} max={200}
          value={pending.heightRange}
          onChange={v => onPendingChange("heightRange", v)}
          unit=" cm"
        />
      </div>

      {/* ── Education ── */}
      <div>
        <FilterLabel icon={GraduationCap}>Education</FilterLabel>
        <select
          className="filter-select"
          value={pending.education}
          onChange={e => onPendingChange("education", e.target.value)}
        >
          <option value="">Any Education</option>
          {EDUCATION_OPTS.filter(Boolean).map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* ── Location ── */}
      <div>
        <FilterLabel icon={MapPin}>Location</FilterLabel>
        <input
          type="text"
          placeholder="Village / City"
          className="filter-text-input"
          value={pending.location}
          onChange={e => onPendingChange("location", e.target.value)}
        />
      </div>

      {/* ── Occupation ── */}
      <div>
        <FilterLabel icon={Briefcase}>Occupation / Job</FilterLabel>
        <input
          type="text"
          placeholder="e.g. Engineer, Teacher..."
          className="filter-text-input"
          value={pending.occupation}
          onChange={e => onPendingChange("occupation", e.target.value)}
        />
      </div>

      {/* ── Income (optional) ── */}
      <div>
        <FilterLabel icon={Wallet}>Annual Income</FilterLabel>
        <select
          className="filter-select"
          value={pending.income}
          onChange={e => onPendingChange("income", e.target.value)}
        >
          <option value="">Any Income</option>
          {INCOME_OPTS.filter(Boolean).map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* ── Match Count Badge ── */}
      <div className="flex items-center justify-center py-2">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#0A1F44]/5 border border-[#0A1F44]/10">
          <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse" />
          <span className="text-sm font-bold text-[#0A1F44]">
            <span className="text-[#FF9933]">{matchCount}</span>
            <span className="text-[#0A1F44]/50"> / {totalCount} profiles match</span>
          </span>
        </div>
      </div>

      {/* ── CTA Buttons ── */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onReset}
          disabled={!hasFilters}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-[#0A1F44]/10 text-[#0A1F44]/50 font-bold text-sm transition-all hover:border-[#0A1F44]/20 hover:text-[#0A1F44] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
          Reset
        </button>

        <button
          onClick={onApply}
          className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF9933] to-[#FFB266] text-white font-bold text-sm shadow-lg shadow-[#FF9933]/25 transition-all hover:shadow-[#FF9933]/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Search className="w-4 h-4" strokeWidth={2.5} />
          Apply Filters
        </button>
      </div>
    </div>
  );
}
