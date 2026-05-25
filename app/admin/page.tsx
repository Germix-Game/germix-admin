import Link from "next/link";
import {
  ArrowDownToLine,
  Database,
  LayoutDashboard,
  ListFilter,
  LogOut,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const cards = [
  {
    label: "Whitelist imports",
    value: "Ready",
    description: "Bulk approved usernames from CSV.",
    icon: Users,
  },
  {
    label: "Runtime config",
    value: "Ready",
    description: "Date gates and unlock keys.",
    icon: Settings2,
  },
  {
    label: "CSV export",
    value: "Ready",
    description: "Analysis-friendly session data.",
    icon: ArrowDownToLine,
  },
  {
    label: "Metrics",
    value: "Template",
    description: "Read-only summary cards.",
    icon: LayoutDashboard,
  },
];

const recentTasks = [
  "ApprovedUsername import",
  "Config update audit",
  "Export queue",
  "Session health snapshot",
];

export default function AdminPage() {
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

        <section className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
          <div className="grid gap-6 md:grid-cols-2">
            {cards.map(({ label, value, description, icon: Icon }) => (
              <article
                key={label}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.26)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                      {value}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-950 p-3 text-white">
                    <Icon className="size-5" />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>

          <aside className="space-y-6">
            <section className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_22px_50px_-30px_rgba(15,23,42,0.9)]">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Database className="size-4" />
                System overview
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Ready for Supabase-backed operations.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Connect the import, config, and export routes here when you are ready.
                Until then this page gives you a clean authenticated template.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {recentTasks.map((task) => (
                  <div key={task} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-slate-200">
                    {task}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.22)]">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <ListFilter className="size-4" />
                Next work items
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <li>• Add the whitelist import panel.</li>
                <li>• Add config editing for unlock dates.</li>
                <li>• Add CSV export with date filtering.</li>
                <li>• Add recent audit activity once the backend is wired.
                </li>
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