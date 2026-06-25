import { PostTestSection } from "../_components/posttest-section";
import { PostTestPeriod, type PostTestQuestion } from "../_types";

type SearchParams = Promise<{
  period?: string;
  created?: string;
  updated?: string;
  deleted?: string;
  error?: string;
}>;

const errorMessages: Record<string, string> = {
  missing_body: "Question text cannot be empty.",
  missing_options: "All four answer options must be filled in.",
  duplicate_option: "Answer options must be unique.",
  missing_correct: "Select a correct answer.",
  invalid_period: "Select a valid period (Midterm or Final).",
  invalid_sort_order: "Question number must be a positive integer.",
  duplicate_sort_order: "That question number is already taken for this period.",
  not_found: "Question not found.",
  server_error: "Something went wrong. Please try again.",
};

async function getQuestions(): Promise<PostTestQuestion[]> {
  // Replace with your actual db call, e.g.:
  // return prisma.postTestQuestion.findMany({ orderBy: [{ period: "asc" }, { sortOrder: "asc" }] });
  return [];
}

export default async function PostTestPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const questions = await getQuestions();

  const errorMessage = params.error ? (errorMessages[params.error] ?? params.error) : null;
  const createdId = params.created ?? null;
  const updatedId = params.updated ?? null;
  const deletedId = params.deleted ?? null;

  const activePeriod =
    params.period === PostTestPeriod.FINAL ? PostTestPeriod.FINAL : PostTestPeriod.MIDTERM;

  return (
    <PostTestSection
      questions={questions}
      activePeriod={activePeriod}
      errorMessage={errorMessage}
      createdId={createdId}
      updatedId={updatedId}
      deletedId={deletedId}
    />
  );
}
