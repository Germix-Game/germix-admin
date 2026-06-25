import Link from "next/link";
import { PostTestPeriod } from "../_types";

type PeriodTabsProps = {
  activePeriod: PostTestPeriod;
};

const tabs: { label: string; period: PostTestPeriod }[] = [
  { label: "Midterm", period: PostTestPeriod.MIDTERM },
  { label: "Final", period: PostTestPeriod.FINAL },
];

export function PeriodTabs({ activePeriod }: PeriodTabsProps) {
  return (
    <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-100 p-1 w-fit">
      {tabs.map(({ label, period }) => {
        const isActive = activePeriod === period;
        return (
          <Link
            key={period}
            href={`?period=${period}`}
            className={[
              "rounded-xl px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            ].join(" ")}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
