import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ImportStatusBanner } from "./import-status-banner";

type UsernameImportSectionProps = {
  imported: number | null;
  skipped: number | null;
  errorMessage: string | null;
  infoMessage: string | null;
};

export function UsernameImportSection({ imported, skipped, errorMessage, infoMessage }: UsernameImportSectionProps) {
  const details =
    // imported !== null && skipped !== null && !errorMessage
    imported !== null && skipped !== null
      ? `Imported ${imported} users, skipped ${skipped}.`
      : null;

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.22)] md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Users</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Approved users</h2>
          <p className="text-sm leading-6 text-slate-600">Add one user with a username and password, or upload a CSV with username and password columns.</p>
        </div>

        <Button asChild variant="outline" size="lg" className="rounded-2xl px-5">
          <Link href="/admin">
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </Button>
      </div>

      <ImportStatusBanner errorMessage={errorMessage} infoMessage={infoMessage} details={details} />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <form action="/api/admin/import-usernames" method="post" className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
            <Upload className="size-4 text-slate-500" />
            Add one
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Username</span>
            <input
              type="text"
              name="username"
              placeholder="student01"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
            />
          </label>

          <Button type="submit" size="lg" className="w-full rounded-2xl px-6">
            Create user
          </Button>
        </form>

        <form action="/api/admin/import-usernames" method="post" encType="multipart/form-data" className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
            <Upload className="size-4 text-slate-500" />
            Upload CSV
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">CSV file</span>
            <input
              type="file"
              name="file"
              accept=".csv,text/csv"
              className="block w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:border-slate-400"
            />
          </label>

          <p className="text-sm leading-6 text-slate-500">CSV columns must include username and password.</p>

          <Button type="submit" size="lg" variant="outline" className="w-full rounded-2xl px-6">
            Import CSV
          </Button>
        </form>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">Duplicate usernames are skipped automatically.</p>

    </section>
  );
}