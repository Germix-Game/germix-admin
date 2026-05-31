import { LogOut, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AdminHeader() {
  return (
    <header className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.28)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
          <ShieldCheck className="size-3.5" />
          Authenticated admin session
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Germix admin dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            This is the protected shell for whitelist management, clue-card imports, microbe imports,
            configuration, and export workflows. The actual tools can land here incrementally.
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
  );
}