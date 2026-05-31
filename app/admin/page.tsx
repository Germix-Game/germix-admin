import Link from "next/link";
import { ArrowRight, Database, FileText, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

const quickActions = [
  {
    href: "/admin/users",
    icon: Users,
    title: "Users",
    text: "Add approved usernames one at a time or by CSV.",
  },
  {
    href: "/admin/clue-cards",
    icon: FileText,
    title: "Clue cards",
    text: "Create clue cards and import the list in bulk.",
  },
  {
    href: "/admin/microbes",
    icon: Database,
    title: "Microbes",
    text: "Create or edit microbes and assign clue cards.",
  },
];

export default function AdminHomePage() {
  return (
    <section className="grid gap-6 lg:grid-cols-3">
      {quickActions.map(({ href, icon: Icon, title, text }) => (
        <article
          key={title}
          className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.22)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                <Icon className="size-3.5" />
                Task
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          </div>

          <Button asChild className="mt-6 w-full rounded-2xl px-5">
            <Link href={href}>
              Open {title.toLowerCase()}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </article>
      ))}
    </section>
  );
}