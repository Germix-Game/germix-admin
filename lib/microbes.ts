import { GameMode, GramType, MicrobeTag } from "@prisma/client";
import { slugifyClueCardSegment } from "@/lib/clue-cards";

type EnumOption<T> = {
  value: T;
  label: string;
  slug: string;
};

export const gameModeOptions: EnumOption<GameMode>[] = [
  { value: GameMode.BACTERIA, label: "Bacteria", slug: "bacteria" },
  { value: GameMode.FUNGI, label: "Fungi", slug: "fungi" },
  { value: GameMode.PARASITE, label: "Parasite", slug: "parasite" },
  { value: GameMode.VIRUS, label: "Virus", slug: "virus" },
];

export const gramTypeOptions: EnumOption<GramType>[] = [
  { value: GramType.POSITIVE, label: "Positive", slug: "positive" },
  { value: GramType.NEGATIVE, label: "Negative", slug: "negative" },
  { value: GramType.ACID_FAST, label: "Acid fast", slug: "acid-fast" },
  { value: GramType.NONE, label: "None", slug: "none" },
];

export const microbeTagOptions: EnumOption<MicrobeTag>[] = [
  { value: MicrobeTag.ANAEROBE, label: "Anaerobe", slug: "anaerobe" },
  { value: MicrobeTag.AEROBE, label: "Aerobe", slug: "aerobe" },
  {
    value: MicrobeTag.FACULTATIVE_ANAEROBE,
    label: "Facultative anaerobe",
    slug: "facultative-anaerobe",
  },
  { value: MicrobeTag.SPORE_FORMER, label: "Spore former", slug: "spore-former" },
  { value: MicrobeTag.ENCAPSULATED, label: "Encapsulated", slug: "encapsulated" },
  { value: MicrobeTag.INTRACELLULAR, label: "Intracellular", slug: "intracellular" },
];

const gameModeLookup = new Set(gameModeOptions.map((option) => option.value));
const gramTypeLookup = new Set(gramTypeOptions.map((option) => option.value));
const microbeTagLookup = new Set(microbeTagOptions.map((option) => option.value));

export function isGameMode(value: string): value is GameMode {
  return gameModeLookup.has(value as GameMode);
}

export function isGramType(value: string): value is GramType {
  return gramTypeLookup.has(value as GramType);
}

export function isMicrobeTag(value: string): value is MicrobeTag {
  return microbeTagLookup.has(value as MicrobeTag);
}

export function normalizePngFileName(fileName: string) {
  const trimmed = fileName.trim();

  if (!trimmed) {
    return "";
  }

  const withoutQuery = trimmed.split("?")[0].split("#")[0];
  const fileNameOnly = withoutQuery.split(/[\\/]/).pop() ?? withoutQuery;

  if (fileNameOnly.toLowerCase().endsWith(".png")) {
    const baseName = fileNameOnly.slice(0, -4);
    const safeBaseName = slugifyClueCardSegment(baseName) || "microbe-card";
    return `${safeBaseName}.png`;
  }

  const safeBaseName = slugifyClueCardSegment(fileNameOnly) || "microbe-card";
  return `${safeBaseName}.png`;
}

export function buildAnswerImageFileName(name: string) {
  const slug = slugifyClueCardSegment(name);
  return `${slug || "microbe-card"}.png`;
}

export function buildAnswerImagePath(gameMode: GameMode, fileName: string) {
  return `cards/answers/${gameMode.toLowerCase()}/${fileName}`;
}
