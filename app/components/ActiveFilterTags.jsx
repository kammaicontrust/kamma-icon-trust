"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const DEFAULT_FILTERS = {
  gender: "",
  maritalStatuses: [],
  ageRange: [18, 60],
  heightRange: [140, 200],
  education: "",
  location: "",
  occupation: "",
  income: "",
};

function formatRange(range, unit) {
  const [lo, hi] = range;
  return `${lo}${unit} – ${hi}${unit}`;
}

/**
 * Builds an array of { key, label } for every active filter
 * so the parent can remove them individually.
 */
export function buildActiveTags(applied) {
  const tags = [];

  if (applied.gender)
    tags.push({ key: "gender", label: `Gender: ${applied.gender}` });

  applied.maritalStatuses.forEach(s =>
    tags.push({ key: `marital-${s}`, label: `Status: ${s}` })
  );

  if (applied.ageRange[0] !== 18 || applied.ageRange[1] !== 60)
    tags.push({ key: "ageRange", label: `Age: ${formatRange(applied.ageRange, " yrs")}` });

  if (applied.heightRange[0] !== 140 || applied.heightRange[1] !== 200)
    tags.push({ key: "heightRange", label: `Height: ${formatRange(applied.heightRange, " cm")}` });

  if (applied.education)
    tags.push({ key: "education", label: `Education: ${applied.education}` });

  if (applied.location)
    tags.push({ key: "location", label: `Location: ${applied.location}` });

  if (applied.occupation)
    tags.push({ key: "occupation", label: `Job: ${applied.occupation}` });

  if (applied.income)
    tags.push({ key: "income", label: `Income: ${applied.income}` });

  return tags;
}

/**
 * Returns the new applied-filters state after removing a tag.
 */
export function removeTag(applied, tagKey) {
  const next = { ...applied, maritalStatuses: [...applied.maritalStatuses] };

  if (tagKey === "gender")      { next.gender = ""; return next; }
  if (tagKey === "ageRange")    { next.ageRange = DEFAULT_FILTERS.ageRange; return next; }
  if (tagKey === "heightRange") { next.heightRange = DEFAULT_FILTERS.heightRange; return next; }
  if (tagKey === "education")   { next.education = ""; return next; }
  if (tagKey === "location")    { next.location = ""; return next; }
  if (tagKey === "occupation")  { next.occupation = ""; return next; }
  if (tagKey === "income")      { next.income = ""; return next; }

  if (tagKey.startsWith("marital-")) {
    const status = tagKey.replace("marital-", "");
    next.maritalStatuses = next.maritalStatuses.filter(s => s !== status);
    return next;
  }

  return next;
}

/* ─── Component ─────────────────────────────────────────────────── */
export default function ActiveFilterTags({ applied, onRemoveTag, onClearAll }) {
  const tags = buildActiveTags(applied);

  if (!tags.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-wrap items-center gap-2 mb-8"
    >
      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#0A1F44]/40 mr-1">
        Active:
      </span>

      <AnimatePresence mode="popLayout">
        {tags.map(({ key, label }) => (
          <motion.span
            key={key}
            layout
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="active-tag"
          >
            {label}
            <button
              onClick={() => onRemoveTag(key)}
              aria-label={`Remove filter: ${label}`}
            >
              <X className="w-2.5 h-2.5" strokeWidth={3} />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Clear all */}
      <button
        onClick={onClearAll}
        className="text-xs font-bold text-[#0A1F44]/30 hover:text-red-400 transition-colors ml-1 flex items-center gap-1"
      >
        <X className="w-3 h-3" strokeWidth={3} /> Clear all
      </button>
    </motion.div>
  );
}
