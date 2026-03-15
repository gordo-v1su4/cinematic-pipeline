"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { ScoreBadge } from "@/components/score-badge";
import { RoutingBadge } from "@/components/routing-badge";
import { listShots, type Shot } from "@/lib/api";

const columns: ColumnDef<Shot, unknown>[] = [
  {
    accessorKey: "shot_id",
    header: "Shot ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.shot_id}</span>
    ),
  },
  {
    accessorKey: "treatment_id",
    header: "Treatment",
    cell: ({ row }) => (
      <a
        href={`/treatments/${row.original.treatment_id}`}
        className="text-blue-400 hover:underline font-mono text-xs"
      >
        {row.original.treatment_id}
      </a>
    ),
  },
  {
    accessorKey: "shot_number",
    header: "#",
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate block" title={row.original.title}>
        {row.original.title}
      </span>
    ),
  },
  {
    accessorKey: "is_pivot_shot",
    header: "Pivot",
    cell: ({ row }) =>
      row.original.is_pivot_shot ? (
        <span className="text-amber-400 text-xs font-semibold">PIVOT</span>
      ) : null,
  },
  {
    accessorKey: "anamorphic_fidelity",
    header: "Anamorphic",
    cell: ({ row }) => <ScoreBadge score={row.original.anamorphic_fidelity} />,
  },
  {
    accessorKey: "lighting_quality",
    header: "Lighting",
    cell: ({ row }) => <ScoreBadge score={row.original.lighting_quality} />,
  },
  {
    accessorKey: "color_grade",
    header: "Grade",
    cell: ({ row }) => <ScoreBadge score={row.original.color_grade} />,
  },
  {
    accessorKey: "subject_sharpness",
    header: "Sharpness",
    cell: ({ row }) => <ScoreBadge score={row.original.subject_sharpness} />,
  },
  {
    accessorKey: "composition",
    header: "Comp",
    cell: ({ row }) => <ScoreBadge score={row.original.composition} />,
  },
  {
    accessorKey: "shot_energy",
    header: "Energy",
    cell: ({ row }) => <ScoreBadge score={row.original.shot_energy} />,
  },
  {
    accessorKey: "per_image_average",
    header: "Avg",
    cell: ({ row }) => (
      <ScoreBadge score={row.original.per_image_average} label="Per-image average" />
    ),
  },
  {
    accessorKey: "routing",
    header: "Routing",
    cell: ({ row }) => <RoutingBadge routing={row.original.routing} />,
  },
  {
    accessorKey: "model_used",
    header: "Model",
    cell: ({ row }) => (
      <span className="text-xs text-neutral-500">{row.original.model_used}</span>
    ),
  },
  {
    accessorKey: "training_set_eligible",
    header: "LoRA",
    cell: ({ row }) =>
      row.original.training_set_eligible ? (
        <span className="text-emerald-400 text-xs font-semibold">YES</span>
      ) : null,
  },
];

const ROUTING_OPTIONS = ["all", "approved", "optimizer", "expander", "regenerate", "human-review"];

export default function ShotsPage() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routingFilter, setRoutingFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = routingFilter !== "all" ? { routing: routingFilter, pageSize: 100 } : { pageSize: 100 };
    listShots(params)
      .then((res) => setShots(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [routingFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Shots</h1>
          <p className="text-sm text-neutral-500 mt-1">
            All generated shots with evaluation scores and routing status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {ROUTING_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setRoutingFilter(opt)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                routingFilter === opt
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-transparent"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-neutral-500">Loading shots...</div>
      ) : (
        <DataTable
          columns={columns}
          data={shots}
          filterColumn="treatment_id"
          filterPlaceholder="Filter by treatment ID..."
        />
      )}
    </div>
  );
}
