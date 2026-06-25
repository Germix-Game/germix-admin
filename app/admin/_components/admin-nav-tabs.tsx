"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, FileText, House, Users, MessageCircleQuestionMark } from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Home", icon: House },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/clue-cards", label: "Clue cards", icon: FileText },
  { href: "/admin/microbes", label: "Microbes", icon: Database },
  { href: "/admin/questions", label: "Questions", icon: MessageCircleQuestionMark },
];

export function AdminNavTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="mt-6 flex flex-wrap gap-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Button
            key={item.href}
            asChild
            variant={isActive ? "default" : "outline"}
            size="lg"
            className={`rounded-2xl px-4 py-6 transition ${isActive ? "shadow-[0_12px_28px_-18px_rgba(15,23,42,0.65)]" : "bg-white"}`}
          >
            <Link href={item.href} aria-current={isActive ? "page" : undefined}>
              <span className="flex items-center gap-2">
                <Icon className="size-4" />
                <span className="flex flex-col items-start leading-none">
                  <span>{item.label}</span>
                  <span className={`text-[0.72rem] font-normal ${isActive ? "text-white/75" : "text-slate-500"}`}>
                  </span>
                </span>
              </span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}