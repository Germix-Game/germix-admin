"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { type PostTestQuestion, PostTestPeriod } from "../_types";
import { OptionBadge } from "./option-badge";
import { QuestionForm } from "./question-form";
import { Button } from "@/components/ui/button";
import { AnswerOption } from "../_types";

const ANSWER_OPTIONS = [AnswerOption.A, AnswerOption.B, AnswerOption.C, AnswerOption.D] as const;

type QuestionRowProps = {
  question: PostTestQuestion;
  period: PostTestPeriod;
  isHighlighted?: boolean;
};

export function QuestionRow({ question, period, isHighlighted }: QuestionRowProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <QuestionForm
        period={period}
        nextSortOrder={question.sortOrder}
        question={question}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div
      className={[
        "group rounded-3xl border bg-white p-5 transition-shadow",
        isHighlighted
          ? "border-emerald-300 shadow-[0_0_0_3px_theme(colors.emerald.100)]"
          : "border-slate-200 hover:shadow-[0_4px_16px_-4px_rgba(15,23,42,0.1)]",
      ].join(" ")}
    >
      {/* Question header */}
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500">
          {question.sortOrder}
        </span>
        <p className="flex-1 text-sm font-medium leading-6 text-slate-900">{question.body}</p>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Edit question"
            className="flex size-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <Pencil className="size-3.5" />
          </button>
          <form action={`/api/admin/posttest/${question.id}/delete`} method="post">
            <button
              type="submit"
              aria-label="Delete question"
              className="flex size-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              onClick={(e) => {
                if (!confirm(`Delete question ${question.sortOrder}? This cannot be undone.`)) {
                  e.preventDefault();
                }
              }}
            >
              <Trash2 className="size-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Options grid */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {ANSWER_OPTIONS.map((opt, i) => {
          const isCorrect = question.correctOption === opt;
          return (
            <div
              key={opt}
              className={[
                "flex items-center gap-3 rounded-2xl border px-3 py-2",
                isCorrect
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-100 bg-slate-50",
              ].join(" ")}
            >
              <OptionBadge option={opt} isCorrect={isCorrect} />
              <span
                className={[
                  "text-sm",
                  isCorrect
                    ? "font-medium text-emerald-800"
                    : "text-slate-600",
                ].join(" ")}
              >
                {question.options[i]}
              </span>
              {isCorrect && (
                <span className="ml-auto text-xs font-semibold text-emerald-600">Correct</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
