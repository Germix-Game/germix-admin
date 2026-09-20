type PostTestStatusBannerProps = {
  errorMessage: string | null;
  successMessage: string | null;
};

export function PostTestStatusBanner({ errorMessage, successMessage }: PostTestStatusBannerProps) {
  if (!errorMessage && !successMessage) return null;

  if (errorMessage) {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-red-200 text-red-700">
          <svg viewBox="0 0 12 12" fill="none" className="size-3" aria-hidden="true">
            <path d="M6 1v5M6 9v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-emerald-700">
        <svg viewBox="0 0 12 12" fill="none" className="size-3" aria-hidden="true">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {successMessage}
    </div>
  );
}
