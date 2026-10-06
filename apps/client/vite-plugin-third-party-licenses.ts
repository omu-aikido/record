import path from "node:path";
import type { Plugin } from "vite";
import { readFileSync } from "node:fs";

interface ThirdPartyLicense {
  name: string;
  version: string;
  license: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getLicenseType(metadata: Record<string, unknown>): string {
  const license = metadata.license;
  if (typeof license === "string") return license;
  if (isRecord(license) && typeof license.type === "string") return license.type;

  if (Array.isArray(metadata.licenses)) {
    const legacyLicenses = (metadata.licenses as unknown[]).flatMap((item) => {
      if (typeof item === "string") return [item];
      return isRecord(item) && typeof item.type === "string" ? [item.type] : [];
    });
    if (legacyLicenses.length > 0) return legacyLicenses.join(" OR ");
  }

  return "UNKNOWN";
}

function findPackageLicense(moduleId: string): ThirdPartyLicense | null {
  const filePath = moduleId.split("?")[0];
  if (!path.isAbsolute(filePath)) return null;

  let directory = path.dirname(filePath);
  while (directory !== path.dirname(directory)) {
    if (directory.includes(`${path.sep}node_modules${path.sep}`)) {
      try {
        const metadata: unknown = JSON.parse(readFileSync(path.join(directory, "package.json"), "utf8"));
        if (isRecord(metadata) && typeof metadata.name === "string" && typeof metadata.version === "string") {
          return {
            name: metadata.name,
            version: metadata.version,
            license: getLicenseType(metadata),
          };
        }
      } catch {
        // Not every ancestor of a module is a package directory.
      }
    }

    directory = path.dirname(directory);
  }

  return null;
}

export function collectThirdPartyLicenses(moduleIds: Iterable<string>): ThirdPartyLicense[] {
  const packages = new Map<string, ThirdPartyLicense>();

  for (const moduleId of moduleIds) {
    const license = findPackageLicense(moduleId);
    if (license) packages.set(`${license.name}@${license.version}`, license);
  }

  const licenses = [...packages.values()];
  licenses.sort((left, right) => left.name.localeCompare(right.name) || left.version.localeCompare(right.version));
  return licenses;
}

export function formatThirdPartyLicenses(licenses: readonly ThirdPartyLicense[]): string {
  return `${licenses.map(({ name, version, license }) => `${name}@${version} — ${license}`).join("\n")}\n`;
}

export default function thirdPartyLicenses(): Plugin {
  return {
    name: "third-party-licenses",
    generateBundle(_options, bundle) {
      const moduleIds = Object.values(bundle).flatMap((output) =>
        output.type === "chunk" ? Object.keys(output.modules) : []
      );
      const licenses = collectThirdPartyLicenses(moduleIds);

      this.emitFile({
        type: "asset",
        fileName: "licenses.txt",
        source: formatThirdPartyLicenses(licenses),
      });
    },
  };
}
