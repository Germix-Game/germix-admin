"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { type PostTestQuestion, PostTestPeriod } from "../_types";
import { OptionBadge } from "./option-badge";
import { QuestionForm } from "./question-form";
import { Button } from "@/components/ui/button";
import { AnswerOption } from "../_types";

const ANSWER_OPTIONS = [AnswerOption.A, AnswerOption.B, AnswerOption.C, AnswerOption.D, AnswerOption.E] as const;

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
        <div className="flex-1 space-y-3">
          <p className="text-sm font-medium leading-6 text-slate-900">{question.body}</p>
          {question.bodyImageUrl && question.bodyImageUrl.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {question.bodyImageUrl.map((url, index) => (
                <div key={index} className="group/img relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-1.5 transition hover:border-slate-300">
                  <img
                    src={url}
                    alt={`Question image ${index + 1}`}
                    className="max-h-40 rounded-xl object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/200x150?text=Invalid+Image+Path";
                    }}
                  />
                  <span className="absolute bottom-2 left-2 rounded-lg bg-slate-900/75 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 transition group-hover/img:opacity-100">
                    {url}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
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
          const optImage = question.optionImages?.find((oi) => oi.option === opt)?.imageUrl;
          return (
            <div
              key={opt}
              className={[
                "flex flex-col gap-2 rounded-2xl border p-3",
                isCorrect
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-100 bg-slate-50",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
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
              {optImage && (
                <div className="group/optimg relative self-start overflow-hidden rounded-xl border border-slate-200/60 bg-white p-1">
                  <img
                    src={optImage}
                    alt={`Option ${opt} image`}
                    className="max-h-24 rounded-lg object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/150x100?text=Invalid+Path";
                    }}
                  />
                  <span className="absolute bottom-1.5 left-1.5 rounded-md bg-slate-900/75 px-1.5 py-0.5 text-[9px] font-medium text-white opacity-0 transition group-hover/optimg:opacity-100">
                    {optImage}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
