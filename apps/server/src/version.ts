export interface WorkerVersionMetadata {
  id: string;
  tag?: string;
  timestamp?: string;
}

export interface PublicVersion {
  id: string;
  shortId: string;
  tag: string | null;
  createdAt: string | null;
}

export function getPublicVersion(metadata: WorkerVersionMetadata | undefined): PublicVersion {
  if (metadata === undefined || metadata.id.length === 0) {
    return {
      id: "unknown",
      shortId: "unknown",
      tag: null,
      createdAt: null,
    };
  }

  const tag = metadata.tag?.trim();

  return {
    id: metadata.id,
    shortId: metadata.id.slice(0, 8),
    tag: tag === undefined || tag === "" ? null : tag,
    createdAt: metadata.timestamp ?? null,
  };
}
