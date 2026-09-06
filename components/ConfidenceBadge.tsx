import { ConfidenceLabel } from "@/lib/types";

const STYLES: Record<ConfidenceLabel, string> = {
  Low: "bg-amber-100 text-amber-800",
  Medium: "bg-blue-100 text-blue-800",
  High: "bg-emerald-100 text-emerald-800",
};

export function ConfidenceBadge({ level }: { level: ConfidenceLabel }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[level]}`}>
      {level} confidence
    </span>
  );
}
