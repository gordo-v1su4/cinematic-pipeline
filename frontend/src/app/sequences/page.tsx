"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { ScoreBadge } from "@/components/score-badge";
import { RoutingBadge } from "@/components/routing-badge";
import { listSequences, type Sequence } from "@/lib/api";

const columns: ColumnDef<Sequence, unknown>[] = [
  {
    accessorKey: "sequence_id",
    header: "Sequence ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.sequence_id}</span>
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
    accessorKey: "sequence_dynamicism",
    header: "Dynamicism",
    cell: ({ row }) => <ScoreBadge score={row.original.sequence_dynamicism} />,
  },
  {
    accessorKey: "anamorphic_consistency",
    header: "Anamorphic",
    cell: ({ row }) => <ScoreBadge score={row.original.anamorphic_consistency} />,
  },
  {
    accessorKey: "character_consistency",
    header: "Character",
    cell: ({ row }) => <ScoreBadge score={row.original.character_consistency} />,
  },
  {
    accessorKey: "world_continuity",
    header: "World",
    cell: ({ row }) => <ScoreBadge score={row.original.world_continuity} />,
  },
  {
    accessorKey: "narrative_flow",
    header: "Narrative",
    cell: ({ row }) => <ScoreBadge score={row.original.narrative_flow} />,
  },
  {
    accessorKey: "sequence_average",
    header: "Avg",
    cell: ({ row }) => <ScoreBadge score={row.original.sequence_average} />,
  },
  {
    accessorKey: "sequence_pass",
    header: "Pass",
    cell: ({ row }) =>
      row.original.sequence_pass ? (
        <span className="text-emerald-400 text-xs font-semibold">PASS</span>
      ) : (
        <span className="text-red-400 text-xs font-semibold">FAIL</span>
      ),
  },
  {
    accessorKey: "recommended_action",
    header: "Action",
    cell: ({ row }) => <RoutingBadge routing={row.original.recommended_action} />,
  },
  {
    accessorKey: "training_set_eligible",
    header: "LoRA",
    cell: ({ row }) =>
      row.original.training_set_eligible ? (
        <span className="text-emerald-400 text-xs font-semibold">YES</span>
      ) : null,
  },
  {
    accessorKey: "evaluation_model",
    header: "Model",
    cell: ({ row }) => (
      <span className="text-xs text-neutral-500">{row.original.evaluation_model}</span>
    ),
  },
  {
    accessorKey: "evaluated_at",
    header: "Evaluated",
    cell: ({ row }) => (
      <span className="text-xs text-neutral-500">
        {row.original.evaluated_at
          ? new Date(row.original.evaluated_at).toLocaleDateString()
          : "--"}
      </span>
    ),
  },
];

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSequences({ pageSize: 50 })
      .then((res) => setSequences(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Sequences</h1>
        <p className="text-sm text-neutral-500 mt-1">
          3x3 grid evaluations — sequence-level consistency scores.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-neutral-500">Loading sequences...</div>
      ) : (
        <DataTable
          columns={columns}
          data={sequences}
          filterColumn="treatment_id"
          filterPlaceholder="Filter by treatment ID..."
        />
      )}
    </div>
  );
}
