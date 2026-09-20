import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostTestPeriod, type PostTestQuestion } from "../_types";
import { PostTestStatusBanner } from "./posttest-status-banner";
import { PeriodTabs } from "./period-tabs";
import { QuestionRow } from "./question-row";
import { QuestionForm } from "./question-form";
import { EmptyQuestions } from "./empty-questions";

type PostTestSectionProps = {
  questions: PostTestQuestion[];
  postTestEnabled: boolean;
  postTestPeriod: PostTestPeriod;
  activePeriod: PostTestPeriod;
  errorMessage: string | null;
  createdId: string | null;
  updatedId: string | null;
  deletedId: string | null;
};

const periodLabel: Record<PostTestPeriod, string> = {
  [PostTestPeriod.MIDTERM]: "Midterm",
  [PostTestPeriod.FINAL]: "Final",
};

export function PostTestSection({
  questions,
  postTestEnabled,
  postTestPeriod,
  activePeriod,
  errorMessage,
  createdId,
  updatedId,
  deletedId,
}: PostTestSectionProps) {
  const periodQuestions = questions
    .filter((q) => q.period === activePeriod)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const nextSortOrder =
    periodQuestions.length > 0
      ? Math.max(...periodQuestions.map((q) => q.sortOrder)) + 1
      : 1;

  const successMessage = createdId
    ? "Question added."
    : updatedId
    ? "Question updated."
    : deletedId
    ? "Question deleted."
    : null;

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.22)] md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Quiz
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Post-test questions
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            Manage multiple-choice questions for the midterm and final post-tests.
            Each question has four options (A–D) with one correct answer.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`size-2 rounded-full ${
              postTestPeriod === PostTestPeriod.FINAL
                ? "bg-blue-500"
                : "bg-orange-400"
            }`}
          />
          <span>
            {postTestPeriod === PostTestPeriod.FINAL ? "Final post-test" : "Midterm post-test"}
          </span>
        </div>
        <form action="/api/admin/posttest/period/toggle" method="POST">
          <input
            type="hidden"
            name="period"
            value={postTestPeriod === PostTestPeriod.MIDTERM ? "final" : "midterm"}
          />

          <Button
            type="submit"
            variant={postTestPeriod === PostTestPeriod.FINAL ? "destructive" : "default"}
            className="rounded-2xl"
          >
            {postTestPeriod === PostTestPeriod.FINAL
              ? "Change to midterm post-test"
              : "Change to final post-test"}
          </Button>
        </form>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`size-2 rounded-full ${
              postTestEnabled
                ? "bg-green-500"
                : "bg-slate-400"
            }`}
          />
          <span>
            {postTestEnabled ? "Post-test enabled" : "Post-test disabled"}
          </span>
        </div>
        <form action="/api/admin/posttest/toggle" method="POST">
          <input
            type="hidden"
            name="enabled"
            value={(!postTestEnabled).toString()}
          />

          <Button
            type="submit"
            variant={postTestEnabled ? "destructive" : "default"}
            className="rounded-2xl"
          >
            {postTestEnabled
              ? "Disable post-test"
              : "Enable post-test"}
          </Button>
        </form>
        <Button asChild variant="outline" size="lg" className="rounded-2xl px-5 shrink-0">
          <Link href="/admin">
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </Button>
      </div>

      {/* Status banner */}
      <PostTestStatusBanner
        errorMessage={errorMessage}
        successMessage={successMessage}
      />

      {/* Period tabs */}
      <div className="mt-6">
        <PeriodTabs activePeriod={activePeriod} />
      </div>

      {/* Stats strip */}
      <div className="mt-4 flex items-center gap-1 text-sm text-slate-500">
        <span className="font-semibold text-slate-800">{periodQuestions.length}</span>
        <span>{periodLabel[activePeriod]} question{periodQuestions.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Question list */}
      <div className="mt-4 space-y-3">
        {periodQuestions.length === 0 ? (
          <EmptyQuestions period={activePeriod} />
        ) : (
          periodQuestions.map((q) => (
            <QuestionRow
              key={q.id}
              question={q}
              period={activePeriod}
              isHighlighted={q.id === createdId || q.id === updatedId}
            />
          ))
        )}
      </div>

      {/* Add new question form */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Add question
        </p>
        <QuestionForm period={activePeriod} nextSortOrder={nextSortOrder} />
      </div>

      {/* Footer hint */}
      <p className="mt-4 text-sm leading-6 text-slate-500">
        Duplicate question numbers in the same period are not allowed.
      </p>
    </section>
  );
}
