"use client";

import { useState } from "react";
import { Beaker, Check, ChevronDown, ListFilter, Search, X } from "lucide-react";
import { type CardCategory } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { gameModeOptions, gramTypeOptions, microbeTagOptions } from "@/lib/microbes";
import {
  clueCardCategoryOptions,
  getClueCardCategoryLabel,
} from "@/lib/clue-cards";

import { ImportStatusBanner } from "./import-status-banner";

type MicrobeImportSectionProps = {
  imported: number | null;
  skipped: number | null;
  errorMessage: string | null;
  infoMessage: string | null;
  clueCardsByCategory: Record<CardCategory, Array<{ id: string; label: string }>>;
};

export function MicrobeImportSection({
  imported,
  skipped,
  errorMessage,
  infoMessage,
  clueCardsByCategory,
}: MicrobeImportSectionProps) {
  const [selectedClueCardIdsByCategory, setSelectedClueCardIdsByCategory] = useState<
    Record<CardCategory, string[]>
  >(() =>
    clueCardCategoryOptions.reduce(
      (acc, categoryOption) => {
        acc[categoryOption.value] = [];
        return acc;
      },
      {} as Record<CardCategory, string[]>
    )
  );
  const [searchByCategory, setSearchByCategory] = useState<Record<CardCategory, string>>(() =>
    clueCardCategoryOptions.reduce(
      (acc, categoryOption) => {
        acc[categoryOption.value] = "";
        return acc;
      },
      {} as Record<CardCategory, string>
    )
  );

  const totalSelectedCount = Object.values(selectedClueCardIdsByCategory).reduce(
    (total, selectedIds) => total + selectedIds.length,
    0
  );

  const details =
    imported !== null && skipped !== null && !errorMessage
      ? `Imported ${imported} microbes, skipped ${skipped}.`
      : null;

  const exampleGameMode = gameModeOptions[0]?.slug ?? "bacteria";

  const toggleClueCard = (category: CardCategory, clueCardId: string) => {
    setSelectedClueCardIdsByCategory((current) => {
      const currentIds = current[category];

      return {
        ...current,
        [category]: currentIds.includes(clueCardId)
          ? currentIds.filter((selectedId) => selectedId !== clueCardId)
          : [...currentIds, clueCardId],
      };
    });
  };

  const selectVisibleClueCards = (category: CardCategory, visibleCardIds: string[]) => {
    setSelectedClueCardIdsByCategory((current) => {
      const currentIds = current[category];
      const visibleSet = new Set(visibleCardIds);
      const allVisibleSelected = visibleCardIds.length > 0 && visibleCardIds.every((id) => currentIds.includes(id));

      return {
        ...current,
        [category]: allVisibleSelected
          ? currentIds.filter((selectedId) => !visibleSet.has(selectedId))
          : Array.from(new Set([...currentIds, ...visibleCardIds])),
      };
    });
  };

  const clearCategorySelection = (category: CardCategory) => {
    setSelectedClueCardIdsByCategory((current) => ({
      ...current,
      [category]: [],
    }));
  };

  const clearSearch = (category: CardCategory) => {
    setSearchByCategory((current) => ({
      ...current,
      [category]: "",
    }));
  };

  const selectedCards = clueCardCategoryOptions.flatMap((categoryOption) =>
    selectedClueCardIdsByCategory[categoryOption.value].map((clueCardId) => ({
      category: categoryOption.value,
      clueCardId,
      label:
        clueCardsByCategory[categoryOption.value].find((card) => card.id === clueCardId)?.label ?? clueCardId,
    }))
  );

  return (
    <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
      <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.26)] md:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Microbe import
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Create a single microbe with clue-card associations
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Each microbe must link to clue cards that cover all <span className="font-medium text-slate-900">CardCategory</span> values.
              Use the searchable category panels below to pick cards quickly, and the route will build the answer image path from <span className="font-medium text-slate-900">gameMode</span> plus the filename.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white">
            <p className="font-medium">Answer path</p>
            <p className="mt-1 text-slate-300">cards/answers/&lt;gameMode&gt;/&lt;filename&gt;</p>
          </div>
        </div>

        <ImportStatusBanner errorMessage={errorMessage} infoMessage={infoMessage} details={details} />

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Selected clue cards</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Pick at least one clue card from each category. Filtering only narrows the list; it does not clear your current selections.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <span className="font-medium text-slate-950">{totalSelectedCount}</span> selected
            </div>
          </div>

          {selectedCards.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCards.map((selectedCard) => (
                <button
                  key={`${selectedCard.category}-${selectedCard.clueCardId}`}
                  type="button"
                  onClick={() => toggleClueCard(selectedCard.category, selectedCard.clueCardId)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  <span className="max-w-[14rem] truncate">{selectedCard.label}</span>
                  <X className="size-3.5" />
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-500">
              No clue cards selected yet. Open a category panel and search or click to add cards.
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form
            action="/api/admin/import-microbes"
            method="post"
            className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4"
          >
            <input type="hidden" name="mode" value="single" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Single entry</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Add one microbe and choose one or more clue cards from each category.
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Name</span>
              <input
                type="text"
                name="name"
                placeholder="Staphylococcus aureus"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Short name</span>
              <input
                type="text"
                name="shortName"
                placeholder="S. aureus"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Game mode</span>
                <select
                  name="gameMode"
                  defaultValue=""
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                >
                  <option value="" disabled>
                    Choose mode
                  </option>
                  {gameModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Gram type</span>
                <select
                  name="gramType"
                  defaultValue=""
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                >
                  <option value="" disabled>
                    Choose gram type
                  </option>
                  {gramTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Star rating</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  name="starRating"
                  defaultValue={1}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Answer filename</span>
                <input
                  type="text"
                  name="answerFilename"
                  placeholder="staphylococcus-aureus-answer.png"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                />
              </label>
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-700">Tags</legend>
              <details className="group overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50">
                  <span>Select microbe tags</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500">
                    {microbeTagOptions.length} available
                  </span>
                </summary>
                <div className="space-y-2 border-t border-slate-200 p-3">
                  {microbeTagOptions.map((tagOption) => (
                    <label
                      key={tagOption.value}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        name="tags"
                        value={tagOption.value}
                        className="mt-0.5 size-4 rounded border-slate-300 text-slate-900"
                      />
                      <span className="min-w-0">
                        <span className="block font-medium text-slate-900">{tagOption.label}</span>
                        <span className="block text-xs text-slate-500">{tagOption.value}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </details>
            </fieldset>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Clue cards by category</p>
              <p className="text-xs leading-5 text-slate-500">
                Use the filter field inside each panel to narrow the list, then bulk-select the visible cards or clear a category in one click.
              </p>
              {clueCardCategoryOptions.map((categoryOption) => {
                const options = clueCardsByCategory[categoryOption.value] ?? [];
                const selectedIds = selectedClueCardIdsByCategory[categoryOption.value];
                const searchValue = searchByCategory[categoryOption.value];
                const normalizedQuery = searchValue.trim().toLowerCase();
                const filteredOptions = options.filter((option) => {
                  if (!normalizedQuery) {
                    return true;
                  }

                  return (
                    option.label.toLowerCase().includes(normalizedQuery) ||
                    option.id.toLowerCase().includes(normalizedQuery)
                  );
                });
                const visibleCardIds = filteredOptions.map((option) => option.id);
                const visibleSelectedCount = filteredOptions.filter((option) => selectedIds.includes(option.id)).length;
                const allVisibleSelected =
                  filteredOptions.length > 0 && visibleSelectedCount === filteredOptions.length;

                return (
                  <details key={categoryOption.value} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    {selectedIds.map((selectedId) => (
                      <input
                        key={`selected-${categoryOption.value}-${selectedId}`}
                        type="hidden"
                        name={`clueCardIds_${categoryOption.value}`}
                        value={selectedId}
                      />
                    ))}

                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-slate-50">
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-900">
                          {getClueCardCategoryLabel(categoryOption.value)}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {selectedIds.length} selected of {options.length} available
                        </span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {options.length}
                        </span>
                        <ChevronDown className="size-4 text-slate-400 transition group-open:rotate-180" />
                      </span>
                    </summary>

                    <div className="border-t border-slate-200">
                      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                        <label className="relative block flex-1">
                          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="search"
                            value={searchValue}
                            onChange={(event) =>
                              setSearchByCategory((current) => ({
                                ...current,
                                [categoryOption.value]: event.target.value,
                              }))
                            }
                            placeholder={`Search ${getClueCardCategoryLabel(categoryOption.value).toLowerCase()} cards`}
                            className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                          />
                        </label>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => selectVisibleClueCards(categoryOption.value, visibleCardIds)}
                            disabled={filteredOptions.length === 0}
                            className="rounded-full px-3"
                          >
                            <Check className="size-3.5" />
                            {allVisibleSelected ? "Unselect visible" : "Select visible"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => clearCategorySelection(categoryOption.value)}
                            disabled={selectedIds.length === 0}
                            className="rounded-full px-3 text-slate-600"
                          >
                            Clear
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => clearSearch(categoryOption.value)}
                            disabled={!searchValue.trim()}
                            className="rounded-full px-3 text-slate-600"
                          >
                            Reset search
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3 p-4">
                        {filteredOptions.length === 0 ? (
                          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-500">
                            No clue cards match this search.
                          </p>
                        ) : (
                          <div className="grid gap-2">
                            {filteredOptions.map((option) => {
                              const checked = selectedIds.includes(option.id);

                              return (
                                <label
                                  key={option.id}
                                  className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleClueCard(categoryOption.value, option.id)}
                                    className="mt-0.5 size-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-300"
                                  />
                                  <span className="min-w-0 flex-1">
                                    <span className="block font-medium text-slate-900">{option.label}</span>
                                    <span className="mt-0.5 block truncate text-xs text-slate-500">{option.id}</span>
                                  </span>
                                  {checked ? <Check className="mt-0.5 size-4 text-slate-900" /> : null}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>

            <Button type="submit" size="lg" className="w-full rounded-2xl px-6">
              Add microbe
            </Button>
          </form>
        </div>

        <div className="mt-4 text-sm leading-6 text-slate-500">
          The system validates that each microbe includes at least one clue card from every category before saving. CSV uploads are no longer supported for microbe imports.
        </div>
      </article>

      <aside className="space-y-6">
        <section className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_22px_50px_-30px_rgba(15,23,42,0.9)]">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Beaker className="size-4" />
            Microbe rules
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <li>• Every microbe must include at least one clue card from each category, and can include more than one per category.</li>
            <li>• Use the search field inside each category panel to filter cards by label or id.</li>
            <li>• The visible-card bulk action lets you select or unselect the current filtered results in one click.</li>
            <li>• The answer filename should be only a filename; the route builds the full answer path.</li>
            <li>• Selected cards appear as removable chips above the form for quick review.</li>
            <li>• Duplicate microbe names are skipped automatically.</li>
          </ul>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.22)]">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <ListFilter className="size-4" />
            Example answer path
          </div>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <p>Generated from game mode and filename:</p>
            <p className="rounded-2xl bg-slate-50 px-4 py-3 font-mono text-xs text-slate-900">
              {`cards/answers/${exampleGameMode}/staphylococcus-aureus-answer.png`}
            </p>
            <p>
              Supported tags: {microbeTagOptions.map((option) => option.value).join(", ")}
            </p>
          </div>
        </section>
      </aside>
    </section>
  );
}
