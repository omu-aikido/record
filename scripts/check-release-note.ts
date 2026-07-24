/// <reference types="bun" />

import { releases } from "../apps/client/src/lib/releases";

const authorType = Bun.env.PR_AUTHOR_TYPE;
const authorLogin = Bun.env.PR_AUTHOR_LOGIN;
const headRef = Bun.env.PR_HEAD_REF;
const releaseNoteDateOverride = Bun.env.RELEASE_NOTE_DATE;

const isBot = Boolean(authorType === "Bot" || authorLogin === "dependabot[bot]" || headRef?.startsWith("dependabot/"));

if (isBot) {
  console.log("Release note check skipped for bot-authored PR.");
  process.exit(0);
}

const releaseNoteDate =
  releaseNoteDateOverride ??
  new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Tokyo",
    year: "numeric",
  }).format(new Date());
const hasReleaseNote = releases.some((release) => release.date === releaseNoteDate);

if (hasReleaseNote) {
  console.log(`Release note found for date ${releaseNoteDate}.`);
  process.exit(0);
}

console.log(
  `::error title=Release note missing::No release note exists for today (${releaseNoteDate}, JST). Add one before merging.`
);
process.exit(1);
