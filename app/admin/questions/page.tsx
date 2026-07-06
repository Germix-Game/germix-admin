import { PostTestSection } from "../_components/posttest-section";
import { PostTestPeriod, type PostTestQuestion, AnswerOption } from "../_types";
import { prisma } from "@/lib/prisma";

async function getPostTestEnabled() {
  const config = await prisma.config.findUnique({
    where: {
      key: "posttest_enabled",
    },
  });

  return config?.value === "true";
}

async function getPostTestPeriod() {
  const config = await prisma.config.findUnique({
    where: {
      key: "posttest_period",
    },
  });
  console.log(config?.value.toUpperCase());

  return config?.value.toUpperCase() as PostTestPeriod;
}

type SearchParams = Promise<{
  period?: string;
  created?: string;
  updated?: string;
  deleted?: string;
  error?: string;
}>;

const errorMessages: Record<string, string> = {
  missing_body: "Question text cannot be empty.",
  missing_options: "All five answer options must be filled in.",
  duplicate_option: "Answer options must be unique.",
  missing_correct: "Select a correct answer.",
  invalid_period: "Select a valid period (Midterm or Final).",
  invalid_sort_order: "Question number must be a positive integer.",
  duplicate_sort_order: "That question number is already taken for this period.",
  not_found: "Question not found.",
  server_error: "Something went wrong. Please try again.",
};

async function getQuestions(): Promise<PostTestQuestion[]> {
  const questions = await prisma.postTestQuestion.findMany({
    orderBy: [
      { period: "asc" },
      { sortOrder: "asc" },
    ],
  });

  return questions.map((q) => ({
    id: q.id,
    period: q.period as PostTestPeriod,
    body: q.body,
    options: q.options as [string, string, string, string, string],
    correctOption: q.correctOption as AnswerOption,
    sortOrder: q.sortOrder,
  }));
}

export default async function PostTestPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const questions = await getQuestions();
  const postTestEnabled = await getPostTestEnabled();
  const postTestPeriod = await getPostTestPeriod();
  const errorMessage = params.error ? (errorMessages[params.error] ?? params.error) : null;
  const createdId = params.created ?? null;
  const updatedId = params.updated ?? null;
  const deletedId = params.deleted ?? null;

  const activePeriod =
    params.period === PostTestPeriod.FINAL ? PostTestPeriod.FINAL : PostTestPeriod.MIDTERM;

  return (
    <PostTestSection
      questions={questions}
      postTestEnabled={postTestEnabled}
      postTestPeriod={postTestPeriod}
      activePeriod={activePeriod}
      errorMessage={errorMessage}
      createdId={createdId}
      updatedId={updatedId}
      deletedId={deletedId}
    />
  );
}
