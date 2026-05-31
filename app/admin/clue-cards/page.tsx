import { ClueCardImportSection } from "../_components/clue-card-import-section";

type SearchParams = Promise<{
  cardsImported?: string;
  cardsSkipped?: string;
  cardsError?: string;
  cardsMessage?: string;
}>;

const clueCardErrorMessages: Record<string, string> = {
  missing_filename: "Enter the PNG filename before saving.",
  invalid_input: "Enter the required clue-card fields before uploading.",
  invalid_csv: "The CSV file is missing the required category and label headers.",
  invalid_category: "Choose a category from the available clue-card enum values.",
  invalid_label: "Enter a clue-card label before uploading.",
};

const clueCardMessage = "clue_card_import_success";

export default async function ClueCardsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const cardsImported = params.cardsImported ? Number(params.cardsImported) : null;
  const cardsSkipped = params.cardsSkipped ? Number(params.cardsSkipped) : null;
  const cardErrorMessage = params.cardsError ? clueCardErrorMessages[params.cardsError] ?? params.cardsError : null;
  const cardInfoMessage = params.cardsMessage === clueCardMessage ? "Clue card import completed." : null;

  return (
    <ClueCardImportSection
      cardsImported={cardsImported}
      cardsSkipped={cardsSkipped}
      cardErrorMessage={cardErrorMessage}
      cardInfoMessage={cardInfoMessage}
    />
  );
}