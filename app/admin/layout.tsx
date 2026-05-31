import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AdminNavTabs } from "./_components/admin-nav-tabs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_36%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl flex-col gap-6">
        <header className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.28)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Admin tools</p>
              <h1 className="text-3xl font-semibold tracking-tight">Manage Germix</h1>
            </div>

            <form action="/api/auth/logout" method="post">
              <Button type="submit" variant="outline" size="lg" className="rounded-2xl px-5">
                <LogOut className="size-4" />
                Sign out
              </Button>
            </form>
          </div>

          <AdminNavTabs />
        </header>

        <div className="flex-1">{children}</div>
      </div>
    </main>
  );
}