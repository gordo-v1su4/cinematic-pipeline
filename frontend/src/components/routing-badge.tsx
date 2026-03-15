import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  optimizer: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  expander: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  regenerate: "bg-red-500/15 text-red-400 border-red-500/30",
  "human-review": "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

export function RoutingBadge({ routing }: { routing: string | null }) {
  if (!routing) return <span className="text-neutral-600">--</span>;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        styles[routing] || "bg-neutral-500/15 text-neutral-400 border-neutral-500/30"
      )}
    >
      {routing}
    </span>
  );
}
