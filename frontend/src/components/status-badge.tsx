import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  draft: "bg-neutral-500/15 text-neutral-400 border-neutral-500/30",
  generating: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  evaluating: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "training-set": "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

export function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-neutral-600">--</span>;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        styles[status] || "bg-neutral-500/15 text-neutral-400 border-neutral-500/30"
      )}
    >
      {status}
    </span>
  );
}
