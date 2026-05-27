import Link from "next/link";
import {
  Database,
  ListFilter,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type SearchParams = Promise<{
  imported?: string;
  skipped?: string;
  error?: string;
  message?: string;
}>;

const errorMessages: Record<string, string> = {
  missing_file: "Choose a CSV file before uploading.",
  missing_input: "Enter a username or choose a CSV file.",
  invalid_csv: "The CSV file is missing the required username header.",
  invalid_username: "The username cannot include leading or trailing spaces.",
};

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const imported = params.imported ? Number(params.imported) : null;
  const skipped = params.skipped ? Number(params.skipped) : null;
  const errorMessage = params.error ? errorMessages[params.error] ?? params.error : null;
  const infoMessage = params.message === "import_success" ? "Username import completed." : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(15,23,42,0.08),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.28)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              <ShieldCheck className="size-3.5" />
              Authenticated admin session
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Germix admin dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                This is the protected shell for whitelist management, configuration, and
                export workflows. The actual tools can land here incrementally.
              </p>
            </div>
          </div>

          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="outline" size="lg" className="rounded-2xl px-5">
              <LogOut className="size-4" />
              Sign out
            </Button>
          </form>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.26)] md:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Whitelist import
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Upload approved usernames
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Add a single username manually or upload a CSV with a <span className="font-medium text-slate-900">username</span>
                  column. Existing usernames are skipped automatically.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white">
                <p className="font-medium">Accepted format</p>
                <p className="mt-1 text-slate-300">username or CSV</p>
              </div>
            </div>

            {(errorMessage || infoMessage || imported !== null) && (
              <div
                className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
                  errorMessage
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-emerald-200 bg-emerald-50 text-emerald-900"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">{errorMessage ? "!" : "✓"}</span>
                  <div>
                    <p>{errorMessage ?? infoMessage}</p>
                    {imported !== null && skipped !== null && !errorMessage && (
                      <p className="mt-1 text-xs opacity-80">
                        Imported {imported} usernames, skipped {skipped}.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <form action="/api/admin/import-usernames" method="post" className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Manual add</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Add one approved username without creating a CSV.
                  </p>
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

                <Button type="submit" size="lg" className="w-full rounded-2xl px-6">
                  Add username
                </Button>
              </form>

              <form action="/api/admin/import-usernames" method="post" encType="multipart/form-data" className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">CSV import</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Upload a file with a header named <span className="font-medium text-slate-900">username</span>.
                  </p>
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

                <Button type="submit" size="lg" variant="outline" className="w-full rounded-2xl px-6">
                  Import CSV
                </Button>
              </form>
            </div>

            <div className="mt-4 text-sm leading-6 text-slate-500">
              The upload is idempotent. Duplicate usernames are skipped.
            </div>
          </article>

          <aside className="space-y-6">
            <section className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_22px_50px_-30px_rgba(15,23,42,0.9)]">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Database className="size-4" />
                Import rules
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <li>• CSV must include a header named <span className="font-medium text-white">username</span>.</li>
                <li>• Rows with leading or trailing spaces are rejected.</li>
                <li>• Re-uploading the same file will not create duplicates.</li>
                <li>• Case is preserved exactly as imported.</li>
              </ul>
            </section>

            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.22)]">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <ListFilter className="size-4" />
                Next work items
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <li>• Add config editing for unlock dates.</li>
                <li>• Add CSV export with date filtering.</li>
                <li>• Add recent audit activity once the backend is wired.</li>
              </ul>

              <Button asChild variant="secondary" size="lg" className="mt-6 w-full rounded-2xl">
                <Link href="/login">Return to login</Link>
              </Button>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}