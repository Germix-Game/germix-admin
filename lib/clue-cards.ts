import { CardCategory } from "@prisma/client";

type ClueCardCategoryOption = {
  value: CardCategory;
  label: string;
  slug: string;
};

export const clueCardCategoryOptions: ClueCardCategoryOption[] = [
  { value: CardCategory.GRAM_STAIN, label: "Gram stain", slug: "gram-stain" },
  { value: CardCategory.VIRULENCE_FACTOR, label: "Virulence factor", slug: "virulence-factor" },
  { value: CardCategory.LAB_CHARACTERISTIC, label: "Lab characteristic", slug: "lab-characteristic" },
  { value: CardCategory.SPECIAL_TRAIT, label: "Special trait", slug: "special-trait" },
  {
    value: CardCategory.CLINICAL_MANIFESTATION,
    label: "Clinical manifestation",
    slug: "clinical-manifestation",
  },
];

const categoryLookup = new Map(clueCardCategoryOptions.map((option) => [option.value, option]));

export function isClueCardCategory(value: string): value is CardCategory {
  return categoryLookup.has(value as CardCategory);
}

export function getClueCardCategorySlug(category: CardCategory) {
  return categoryLookup.get(category)?.slug ?? category.toLowerCase();
}

export function getClueCardCategoryLabel(category: CardCategory) {
  return categoryLookup.get(category)?.label ?? category;
}

export function slugifyClueCardSegment(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function buildClueCardImagePath(category: CardCategory, fileName: string) {
  return `cards/clues/${getClueCardCategorySlug(category)}/${fileName}`;
}

export function buildClueCardFileName(label: string) {
  const slug = slugifyClueCardSegment(label);
  return `${slug || "clue-card"}.png`;
}
