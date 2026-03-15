import { cn } from "@/lib/utils";

export function ScoreBadge({ score, label }: { score: number | null; label?: string }) {
  if (score == null) return <span className="text-neutral-600">--</span>;

  const color =
    score >= 4.5
      ? "text-emerald-400"
      : score >= 4.0
        ? "text-green-400"
        : score >= 3.0
          ? "text-amber-400"
          : "text-red-400";

  return (
    <span className={cn("tabular-nums font-medium", color)} title={label}>
      {score.toFixed(1)}
    </span>
  );
}
