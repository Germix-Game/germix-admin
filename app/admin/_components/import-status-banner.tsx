type ImportStatusBannerProps = {
  errorMessage?: string | null;
  infoMessage?: string | null;
  details?: string | null;
};

export function ImportStatusBanner({ errorMessage, infoMessage, details }: ImportStatusBannerProps) {
  if (!errorMessage && !infoMessage && !details) {
    return null;
  }

  return (
    <div
      className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
        errorMessage
          ? "border-amber-200 bg-amber-50 text-amber-900"
          : "border-emerald-200 bg-emerald-50 text-emerald-900"
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5">{errorMessage ? "!" : "✓"}</span>
        <div>
          <p>{errorMessage ?? infoMessage}</p>
          {/* {details && !errorMessage && <p className="mt-1 text-xs opacity-80">{details}</p>} */}
          {details && <p className="mt-1 text-xs opacity-80">{details}</p>}
        </div>
      </div>
    </div>
  );
}