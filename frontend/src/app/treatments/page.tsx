"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { listTreatments, type Treatment } from "@/lib/api";

const columns: ColumnDef<Treatment, unknown>[] = [
  {
    accessorKey: "treatment_id",
    header: "ID",
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
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span className="max-w-[250px] truncate block font-medium" title={row.original.title}>
        {row.original.title}
      </span>
    ),
  },
  {
    accessorKey: "structure",
    header: "Structure",
    cell: ({ row }) => (
      <span title={row.original.structure_name}>
        {row.original.structure}
        <span className="ml-1.5 text-neutral-500 text-xs">{row.original.structure_name}</span>
      </span>
    ),
  },
  {
    accessorKey: "collision",
    header: "Collision",
  },
  {
    accessorKey: "director_tone",
    header: "Tone",
  },
  {
    accessorKey: "product_mode",
    header: "Product",
    cell: ({ row }) => (
      <span className="text-xs text-neutral-400">{row.original.product_mode}</span>
    ),
  },
  {
    accessorKey: "location_type",
    header: "Location",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "version",
    header: "V",
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-xs text-neutral-500">
        {row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString()
          : "--"}
      </span>
    ),
  },
];

const STATUS_OPTIONS = ["all", "draft", "generating", "evaluating", "approved", "training-set"];

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = statusFilter !== "all" ? { status: statusFilter, pageSize: 50 } : { pageSize: 50 };
    listTreatments(params)
      .then((res) => setTreatments(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Treatments</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Commercial treatments — structure, director tone, collision type.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === opt
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
        <div className="py-12 text-center text-neutral-500">Loading treatments...</div>
      ) : (
        <DataTable
          columns={columns}
          data={treatments}
          filterColumn="title"
          filterPlaceholder="Filter by title..."
        />
      )}
    </div>
  );
}
