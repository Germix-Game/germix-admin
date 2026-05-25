import Link from "next/link";
import { AlertCircle, ArrowRight, ShieldCheck, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

type SearchParams = Promise<{
  error?: string;
  email?: string;
  message?: string;
}>;

const errorMessages: Record<string, string> = {
  missing_fields: "Enter both your admin email and password.",
  invalid_credentials: "That email or password was not accepted.",
  auth_required: "Please sign in to continue.",
  not_admin: "This account is not allowed to access admin tools.",
  admin_inactive: "Admin account is not active.",
};

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const errorMessage = params.error ? errorMessages[params.error] ?? "Sign in failed." : null;
  const infoMessage = params.message === "signed_out" ? "You have been signed out." : null;
  const email = params.email ?? "";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.12),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.85)] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.2),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(148,163,184,0.15),_transparent_24%)]" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium tracking-wide text-slate-200">
                <ShieldCheck className="size-3.5" />
                Supabase Auth gate
              </div>
              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-semibold tracking-tight md:text-6xl">
                  Sign in to the Germix admin dashboard.
                </h1>
                <p className="max-w-lg text-sm leading-7 text-slate-300 md:text-base">
                  Use the admin account you manually created in Supabase. Signup is disabled
                  for this surface.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Whitelist imports",
                "Config updates",
                "CSV exports",
                "Read-only metrics",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.28)] md:p-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Admin login
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Access the dashboard
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                No signup flow here. Sign in with the Supabase auth user you created.
              </p>
            </div>

            <form action="/api/auth/login" method="post" className="mt-8 space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Admin email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={email}
                  placeholder="admin@example.com"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                />
              </div>

              {(errorMessage || infoMessage) && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    errorMessage
                      ? "border-amber-200 bg-amber-50 text-amber-900"
                      : "border-emerald-200 bg-emerald-50 text-emerald-900"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <p>{errorMessage ?? infoMessage}</p>
                  </div>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full rounded-2xl">
                Sign in
                <ArrowRight className="size-4" />
              </Button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-0.5 size-4 shrink-0 text-slate-500" />
                <p>
                  Your Supabase session will be refreshed automatically. After sign in,
                  you will land on the protected admin dashboard.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
              <Link href="/" className="transition hover:text-slate-950">
                Back to home
              </Link>
              <span>Login only, no signup flow</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}