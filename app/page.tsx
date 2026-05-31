import Link from "next/link";
import { ArrowRight, Database, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col justify-between gap-8 rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm md:p-10">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
              Germix Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Admin dashboard template
            </h1>
          </div>
          <Button asChild size="lg" className="rounded-full px-5">
            <Link href="/login">
              Sign in
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-stretch">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.9)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(148,163,184,0.24),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.16),_transparent_28%)]" />
            <div className="relative max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-medium text-slate-200">
                <Sparkles className="size-3.5" />
                Manual Supabase admin access only
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
                  Manage the Germix study without leaving the browser.
                </h2>
                <p className="max-w-xl text-sm leading-7 text-slate-300 md:text-base">
                  This template is intentionally small: one login screen, one protected
                  dashboard, and room for the whitelist, config, and export tools that will
                  follow.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Protected",
                    text: "Supabase session gate",
                  },
                  {
                    icon: Database,
                    title: "Research-ready",
                    text: "CSV export first",
                  },
                  {
                    icon: Sparkles,
                    title: "Focused",
                    text: "No signup flow in v1",
                  },
                ].map(({ icon: Icon, title, text }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm"
                  >
                    <Icon className="size-4 text-sky-300" />
                    <p className="mt-3 text-sm font-medium text-white">{title}</p>
                    <p className="mt-1 text-xs leading-6 text-slate-300">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                What you get
              </p>
              <h3 className="text-xl font-semibold text-slate-950">
                A clean starting shell for the dashboard
              </h3>
            </div>

            <div className="space-y-3 text-sm leading-6 text-slate-600">
              <p>• Login page backed by Supabase Auth.</p>
              <p>• Protected admin dashboard route.</p>
              <p>• Sign-out flow for the created admin account.</p>
              <p>• Space reserved for whitelist, config, and export panels.</p>
            </div>

            <Button asChild size="lg" className="mt-2 w-full rounded-2xl">
              <Link href="/login">Open login page</Link>
            </Button>
          </aside>
        </section>
      </div>
    </main>
  );
}
