import { UsernameImportSection } from "../_components/username-import-section";

type SearchParams = Promise<{
  imported?: string;
  skipped?: string;
  error?: string;
  message?: string;
}>;

const errorMessages: Record<string, string> = {
  missing_file: "Choose a CSV file before uploading.",
  missing_input: "Enter a username or choose a CSV file.",
  invalid_csv: "The CSV file is missing the required username header.",
  invalid_username: "The username cannot include leading or trailing spaces.",
};

export default async function UsersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const imported = params.imported ? Number(params.imported) : null;
  const skipped = params.skipped ? Number(params.skipped) : null;
  const errorMessage = params.error ? errorMessages[params.error] ?? params.error : null;
  const infoMessage = params.message === "import_success" ? "Username import completed." : null;

  return (
    <UsernameImportSection
      imported={imported}
      skipped={skipped}
      errorMessage={errorMessage}
      infoMessage={infoMessage}
    />
  );
}