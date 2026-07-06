"use client";

import { useRef } from "react";
import { AnswerOption, PostTestPeriod, type PostTestQuestion } from "../_types";
import { Button } from "@/components/ui/button";
import { OptionBadge } from "./option-badge";

const ANSWER_OPTIONS = [AnswerOption.A, AnswerOption.B, AnswerOption.C, AnswerOption.D, AnswerOption.E] as const;

type QuestionFormProps = {
  period: PostTestPeriod;
  nextSortOrder: number;
  /** If provided, renders as an edit form for this question */
  question?: PostTestQuestion;
  onCancel?: () => void;
};

export function QuestionForm({ period, nextSortOrder, question, onCancel }: QuestionFormProps) {
  const isEditing = !!question;
  const formRef = useRef<HTMLFormElement>(null);

  const action = isEditing
    ? `/api/admin/posttest/${question.id}`
    : `/api/admin/posttest`;

  return (
    <form
      ref={formRef}
      action={action}
      method="post"
      className="space-y-5 rounded-3xl border border-slate-200 bg-slate-50 p-5"
    >
      {/* Hidden fields */}
      <input type="hidden" name="period" value={period} />
      {isEditing && <input type="hidden" name="_method" value="PUT" />}

      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-900">
          {isEditing ? `Editing question ${question.sortOrder}` : "New question"}
        </p>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">No.</span>
            <input
              type="number"
              name="sortOrder"
              min={1}
              defaultValue={isEditing ? question.sortOrder : nextSortOrder}
              required
              className="h-8 w-16 rounded-xl border border-slate-200 bg-white px-2 text-center text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
            />
          </label>
        </div>
      </div>

      {/* Question body */}
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Question</span>
        <textarea
          name="body"
          rows={3}
          defaultValue={isEditing ? question.body : ""}
          placeholder="e.g. Which pathogen is responsible for malaria?"
          required
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200 resize-none"
        />
      </label>

      {/* Options A–E */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700 mb-2">Answer options</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {ANSWER_OPTIONS.map((opt, i) => (
            <label key={opt} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 transition focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-200">
              <OptionBadge option={opt} />
              <input
                type="text"
                name={`option_${opt}`}
                defaultValue={isEditing ? question.options[i] : ""}
                placeholder={`Option ${opt}`}
                required
                className="flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
              />
            </label>
          ))}
        </div>
      </fieldset>

      {/* Correct answer */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">Correct answer</legend>
        <div className="flex gap-2 flex-wrap">
          {ANSWER_OPTIONS.map((opt) => {
            const inputId = `${isEditing ? question.id : "new"}-correct-${opt}`;
            return (
              <label
                key={opt}
                htmlFor={inputId}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50 has-[:checked]:text-emerald-700"
              >
                <input
                  type="radio"
                  id={inputId}
                  name="correctOption"
                  value={opt}
                  defaultChecked={isEditing ? question.correctOption === opt : false}
                  required
                  className="accent-emerald-600"
                />
                <OptionBadge
                  option={opt}
                  isCorrect={isEditing && question.correctOption === opt}
                />
                <span className="font-medium">Option {opt}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" size="lg" className="rounded-2xl px-6">
          {isEditing ? "Save changes" : "Add question"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="rounded-2xl px-6 text-slate-500"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
