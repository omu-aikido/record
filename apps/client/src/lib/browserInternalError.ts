const SAFARI_INTERNAL_ERROR_MARKERS = [
  "viewportDominantIFrameElement",
  "viewportDominantIFrameHandle",
  "contentWindow",
];

const getErrorParts = (input: unknown): string[] => {
  if (input === undefined || input === null) {
    return [];
  }

  if (typeof input === "string") {
    return [input];
  }

  if (input instanceof Error) {
    return [input.message, input.stack ?? ""];
  }

  if (typeof input === "object") {
    const candidate = input as {
      error?: { message?: string; stack?: string } | null;
      filename?: string;
      message?: string;
      reason?: { message?: string; stack?: string } | string | null;
    };

    const reason = candidate.reason;

    return [
      candidate.message ?? "",
      candidate.filename ?? "",
      candidate.error?.message ?? "",
      candidate.error?.stack ?? "",
      typeof reason === "string" ? reason : (reason?.message ?? ""),
      typeof reason === "string" ? "" : (reason?.stack ?? ""),
    ];
  }

  return [];
};

export const isIgnoredBrowserInternalError = (input: unknown): boolean => {
  const haystack = getErrorParts(input).join("\n");
  return SAFARI_INTERNAL_ERROR_MARKERS.some((marker) => haystack.includes(marker));
};
