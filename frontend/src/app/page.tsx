import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Cinematic Pipeline</h1>
        <p className="mt-2 text-neutral-400">
          Anamorphic commercial treatment pipeline — treatments, grids, LoRA training.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/treatments"
          className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition-colors hover:border-neutral-700 hover:bg-neutral-900"
        >
          <h2 className="text-lg font-medium text-neutral-200 group-hover:text-neutral-100">
            Treatments
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Browse generated commercial treatments — structure, tone, location.
          </p>
        </Link>

        <Link
          href="/shots"
          className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition-colors hover:border-neutral-700 hover:bg-neutral-900"
        >
          <h2 className="text-lg font-medium text-neutral-200 group-hover:text-neutral-100">
            Shots
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            View all shots with scores, routing status, and LoRA eligibility.
          </p>
        </Link>

        <Link
          href="/sequences"
          className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition-colors hover:border-neutral-700 hover:bg-neutral-900"
        >
          <h2 className="text-lg font-medium text-neutral-200 group-hover:text-neutral-100">
            Sequences
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Evaluate 3x3 grids — sequence-level consistency and narrative flow.
          </p>
        </Link>
      </div>
    </div>
  );
}
