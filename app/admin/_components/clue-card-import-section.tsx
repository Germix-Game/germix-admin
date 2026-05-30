import { ArrowUpRight, ListFilter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  clueCardCategoryOptions,
  getClueCardCategoryLabel,
  getClueCardCategorySlug,
} from "@/lib/clue-cards";

import { ImportStatusBanner } from "./import-status-banner";

type ClueCardImportSectionProps = {
  cardsImported: number | null;
  cardsSkipped: number | null;
  cardErrorMessage: string | null;
  cardInfoMessage: string | null;
};

export function ClueCardImportSection({
  cardsImported,
  cardsSkipped,
  cardErrorMessage,
  cardInfoMessage,
}: ClueCardImportSectionProps) {
  const details =
    cardsImported !== null && cardsSkipped !== null && !cardErrorMessage
      ? `Imported ${cardsImported} clue cards, skipped ${cardsSkipped}.`
      : null;
  const exampleCategory = clueCardCategoryOptions[0]?.value;
  const examplePath = exampleCategory
    ? `cards/clues/${getClueCardCategorySlug(exampleCategory)}/${getClueCardCategoryLabel(exampleCategory)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}.png`
    : "cards/clues/<category>/<filename>.png";

  return (
    <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
      <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.26)] md:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Clue card import
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Add clue cards with static image paths
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Single entries generate a static PNG path from the chosen <span className="font-medium text-slate-900">category</span> and filename.
              CSV uploads import many cards at once from <span className="font-medium text-slate-900">category</span>, <span className="font-medium text-slate-900">label</span>, and optional <span className="font-medium text-slate-900">filename</span> columns. The filename should be just the file name, and the system will build the full path.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white">
            <p className="font-medium">Static path</p>
            <p className="mt-1 text-slate-300">cards/clues/&lt;category&gt;/&lt;filename&gt;</p>
          </div>
        </div>

        <ImportStatusBanner errorMessage={cardErrorMessage} infoMessage={cardInfoMessage} details={details} />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form
            action="/api/admin/import-clue-cards"
            method="post"
            encType="multipart/form-data"
            className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4"
          >
            <input type="hidden" name="mode" value="single" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Single entry</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Add one clue card by choosing a category, label, and PNG filename.
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Category</span>
              <select
                name="category"
                defaultValue=""
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
              >
                <option value="" disabled>
                  Choose a category
                </option>
                {clueCardCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Label</span>
              <input
                type="text"
                name="label"
                placeholder="Capsule"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Filename</span>
              <input
                type="text"
                name="filename"
                placeholder="staphylococcus-aureus-gram-stain-01.png"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
              />
            </label>

            <Button type="submit" size="lg" className="w-full rounded-2xl px-6">
              Add clue card
            </Button>
          </form>

          <form
            action="/api/admin/import-clue-cards"
            method="post"
            encType="multipart/form-data"
            className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4"
          >
            <input type="hidden" name="mode" value="csv" />
            <div>
              <p className="text-sm font-semibold text-slate-900">CSV import</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Upload a file with <span className="font-medium text-slate-900">category</span> and <span className="font-medium text-slate-900">label</span> headers.
                An optional <span className="font-medium text-slate-900">filename</span> column should contain only the PNG file name.
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">CSV file</span>
              <input
                type="file"
                name="file"
                accept=".csv,text/csv"
                className="block w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:border-slate-400"
              />
            </label>

            <Button type="submit" size="lg" variant="outline" className="w-full rounded-2xl px-6">
              Import CSV
            </Button>
          </form>
        </div>

        <div className="mt-4 text-sm leading-6 text-slate-500">
          The game repo should contain the actual PNG under the generated public path; this admin form only stores metadata.
        </div>
      </article>

      <aside className="space-y-6">
        <section className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_22px_50px_-30px_rgba(15,23,42,0.9)]">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <ArrowUpRight className="size-4" />
            Clue card rules
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <li>• Categories come from the <span className="font-medium text-white">CardCategory</span> enum.</li>
            <li>• Single entries store a generated path and expect the PNG to live in the game repo&apos;s public folder.</li>
            <li>• CSV imports accept <span className="font-medium text-white">category</span>, <span className="font-medium text-white">label</span>, and optional <span className="font-medium text-white">filename</span>; the filename must not include the category path.</li>
            <li>• Duplicate records are skipped when the category, label, and generated path already exist.</li>
          </ul>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.22)]">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <ListFilter className="size-4" />
            Example path format
          </div>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <p>The category folder comes from the enum slug:</p>
            <p className="rounded-2xl bg-slate-50 px-4 py-3 font-mono text-xs text-slate-900">
              {examplePath}
            </p>
            <p>Use the same path for the DB row and the static image file.</p>
          </div>
        </section>
      </aside>
    </section>
  );
}