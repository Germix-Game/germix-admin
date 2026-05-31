import { CardCategory } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { MicrobeImportSection } from "../_components/microbe-editor-section";

type SearchParams = Promise<{
  imported?: string;
  updated?: string;
  skipped?: string;
  error?: string;
  message?: string;
  microbesImported?: string;
  microbesUpdated?: string;
  microbesSkipped?: string;
  microbesError?: string;
  microbesMessage?: string;
}>;

const microbeErrorMessages: Record<string, string> = {
  unsupported_mode: "Microbe import only supports the single-entry form.",
  missing_name: "Enter a microbe name.",
  missing_short_name: "Enter a microbe short name.",
  missing_microbe_id: "Select a microbe to edit.",
  microbe_not_found: "The selected microbe could not be found.",
  microbe_exists: "Another microbe already uses that name.",
  invalid_game_mode: "Choose a valid game mode.",
  invalid_gram_type: "Choose a valid gram type.",
  invalid_star_rating: "Star rating must be a non-negative number.",
  missing_clue_cards: "Provide at least one clue card id.",
};

const microbeMessage = "microbe_import_success";
const microbeUpdateMessage = "microbe_update_success";

export default async function MicrobesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const microbesImportedValue = params.microbesImported ?? params.imported;
  const microbesUpdatedValue = params.microbesUpdated ?? params.updated;
  const microbesSkippedValue = params.microbesSkipped ?? params.skipped;
  const microbeErrorValue = params.microbesError ?? params.error;
  const microbeMessageValue = params.microbesMessage ?? params.message;

  const microbesImported = microbesImportedValue ? Number(microbesImportedValue) : null;
  const microbesUpdated = microbesUpdatedValue ? Number(microbesUpdatedValue) : null;
  const microbesSkipped = microbesSkippedValue ? Number(microbesSkippedValue) : null;
  const microbeErrorMessage = microbeErrorValue ? microbeErrorMessages[microbeErrorValue] ?? microbeErrorValue : null;
  const microbeInfoMessage =
    microbeMessageValue === microbeUpdateMessage
      ? "Microbe update completed."
      : microbeMessageValue === microbeMessage
        ? "Microbe import completed."
        : null;

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

  const microbes = await prisma.microbe.findMany({
    select: {
      id: true,
      name: true,
      shortName: true,
      gameMode: true,
      gramType: true,
      tags: true,
      starRating: true,
      answerImageUrl: true,
      clues: {
        select: {
          clueCardId: true,
          clueCard: {
            select: {
              category: true,
            },
          },
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: [{ name: "asc" }],
  });

  return (
    <MicrobeImportSection
      imported={microbesImported}
      updated={microbesUpdated}
      skipped={microbesSkipped}
      errorMessage={microbeErrorMessage}
      infoMessage={microbeInfoMessage}
      clueCardsByCategory={clueCardsByCategory}
      microbes={microbes}
    />
  );
}