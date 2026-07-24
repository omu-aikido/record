import honoClient from "./honoClient";

export interface PublicVersion {
  id: string;
  shortId: string;
  tag: string | null;
  createdAt: string | null;
}

export interface VersionDisplay {
  label: string;
  detail: string;
}

export function toVersionDisplay(version: PublicVersion): VersionDisplay {
  return {
    label: version.tag ?? version.shortId,
    detail: version.id,
  };
}

export async function loadVersion(): Promise<VersionDisplay> {
  const response = await honoClient.status.$get();
  if (!response.ok) throw new Error("Failed to load deployed version");

  const { version } = await response.json();
  return toVersionDisplay(version);
}
