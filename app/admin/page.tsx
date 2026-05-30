import { CardCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

import { AdminHeader } from "./_components/admin-header";
import { ClueCardImportSection } from "./_components/clue-card-import-section";
import { MicrobeImportSection } from "./_components/microbe-import-section";
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
  microbesImported?: string;
  microbesSkipped?: string;
  microbesError?: string;
  microbesMessage?: string;
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

const microbeErrorMessages: Record<string, string> = {
  unsupported_mode: "Microbe import only supports the single-entry form.",
  missing_name: "Enter a microbe name.",
  missing_short_name: "Enter a microbe short name.",
  invalid_game_mode: "Choose a valid game mode.",
  invalid_gram_type: "Choose a valid gram type.",
  invalid_star_rating: "Star rating must be a non-negative integer.",
  missing_clue_cards: "Provide at least one clue card id.",
};

const microbeMessage = "microbe_import_success";

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
  const microbesImported = params.microbesImported ? Number(params.microbesImported) : null;
  const microbesSkipped = params.microbesSkipped ? Number(params.microbesSkipped) : null;
  const microbeErrorMessage = params.microbesError
    ? microbeErrorMessages[params.microbesError] ?? params.microbesError
    : null;
  const microbeInfoMessage =
    params.microbesMessage === microbeMessage ? "Microbe import completed." : null;

  const clueCards = await prisma.clueCard.findMany({
    select: {
      id: true,
      label: true,
      category: true,
    },
    orderBy: [{ category: "asc" }, { label: "asc" }],
  });

  const clueCardsByCategory = Object.values(CardCategory).reduce(
    (acc, category) => {
      acc[category] = clueCards
        .filter((card) => card.category === category)
        .map((card) => ({ id: card.id, label: card.label }));
      return acc;
    },
    {} as Record<CardCategory, Array<{ id: string; label: string }>>
  );

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
        <ClueCardImportSection
          cardsImported={cardsImported}
          cardsSkipped={cardsSkipped}
          cardErrorMessage={cardErrorMessage}
          cardInfoMessage={cardInfoMessage}
        />
        <MicrobeImportSection
          imported={microbesImported}
          skipped={microbesSkipped}
          errorMessage={microbeErrorMessage}
          infoMessage={microbeInfoMessage}
          clueCardsByCategory={clueCardsByCategory}
        />
      </div>
    </main>
  );
}