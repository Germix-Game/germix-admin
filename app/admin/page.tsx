import { AdminHeader } from "./_components/admin-header";
import { ClueCardImportSection } from "./_components/clue-card-import-section";
import { UsernameImportSection } from "./_components/username-import-section";

type SearchParams = Promise<{
  imported?: string;
  skipped?: string;
  error?: string;
  message?: string;
  cardsImported?: string;
  cardsSkipped?: string;
  cardsError?: string;
  cardsMessage?: string;
}>;

const errorMessages: Record<string, string> = {
  missing_file: "Choose a CSV file before uploading.",
  missing_input: "Enter a username or choose a CSV file.",
  invalid_csv: "The CSV file is missing the required username header.",
  invalid_username: "The username cannot include leading or trailing spaces.",
};

const clueCardErrorMessages: Record<string, string> = {
  missing_filename: "Enter the PNG filename before saving.",
  invalid_input: "Enter the required clue-card fields before uploading.",
  invalid_csv: "The CSV file is missing the required category and label headers.",
  invalid_category: "Choose a category from the available clue-card enum values.",
  invalid_label: "Enter a clue-card label before uploading.",
};

const clueCardMessage = "clue_card_import_success";

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const imported = params.imported ? Number(params.imported) : null;
  const skipped = params.skipped ? Number(params.skipped) : null;
  const errorMessage = params.error ? errorMessages[params.error] ?? params.error : null;
  const infoMessage = params.message === "import_success" ? "Username import completed." : null;
  const cardsImported = params.cardsImported ? Number(params.cardsImported) : null;
  const cardsSkipped = params.cardsSkipped ? Number(params.cardsSkipped) : null;
  const cardErrorMessage = params.cardsError
    ? clueCardErrorMessages[params.cardsError] ?? params.cardsError
    : null;
  const cardInfoMessage = params.cardsMessage === clueCardMessage ? "Clue card import completed." : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(15,23,42,0.08),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl flex-col gap-6">
        <AdminHeader />
        <UsernameImportSection
          imported={imported}
          skipped={skipped}
          errorMessage={errorMessage}
          infoMessage={infoMessage}
        />
        {/* <ClueCardImportSection
          cardsImported={cardsImported}
          cardsSkipped={cardsSkipped}
          cardErrorMessage={cardErrorMessage}
          cardInfoMessage={cardInfoMessage}
        /> */}
      </div>
    </main>
  );
}