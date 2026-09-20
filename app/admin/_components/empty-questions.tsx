import { ClipboardList } from "lucide-react";
import { PostTestPeriod } from "../_types";

const periodLabel: Record<PostTestPeriod, string> = {
  [PostTestPeriod.MIDTERM]: "Midterm",
  [PostTestPeriod.FINAL]: "Final",
};

type EmptyQuestionsProps = {
  period: PostTestPeriod;
};

export function EmptyQuestions({ period }: EmptyQuestionsProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100">
        <ClipboardList className="size-5 text-slate-400" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-700">No {periodLabel[period]} questions yet</p>
        <p className="text-sm text-slate-500">Add your first question using the form below.</p>
      </div>
    </div>
  );
}
