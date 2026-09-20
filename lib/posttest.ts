import { AnswerOption, PostTestPeriod } from "@prisma/client";

export type QuestionInput = {
  period?: string;
  body?: string;
  bodyImageUrl?: string[];
  options?: string[];
  correctOption?: string;
  sortOrder?: number;
};

export function validateQuestionInput(input: QuestionInput) {
  const {
    period,
    body,
    options,
    correctOption,
    sortOrder,
  } = input;

  if (
    period !== undefined &&
    !Object.values(PostTestPeriod).includes(period as PostTestPeriod)
  ) {
    return "invalid_period";
  }

  if (body !== undefined && !body.trim()) {
    return "missing_body";
  }

  if (options !== undefined) {
    if (options.length !== 5 || options.some((o) => !o?.trim())) {
      return "missing_options";
    }

    const normalized = options.map((o) => o.trim());

    if (new Set(normalized).size !== 5) {
      return "duplicate_option";
    }
  }

  if (
    correctOption !== undefined &&
    !Object.values(AnswerOption).includes(correctOption as AnswerOption)
  ) {
    return "missing_correct";
  }

  if (
    sortOrder !== undefined &&
    (!Number.isInteger(sortOrder) || sortOrder < 1)
  ) {
    return "invalid_sort_order";
  }

  return null;
}