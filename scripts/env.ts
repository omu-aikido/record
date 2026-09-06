/// <reference types="bun" />

import { homedir } from "node:os";
import { chmod, mkdir, rename, rm, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";

type EnvTarget = {
  encrypted: string;
  plaintext: string;
};

const root = resolve(import.meta.dir, "..");
const recipientFile = resolve(root, "secrets/dev.recipients");

const appTargets: EnvTarget[] = [
  {
    encrypted: resolve(root, "secrets/client.env.age"),
    plaintext: resolve(root, "apps/client/.env"),
  },
  {
    encrypted: resolve(root, "secrets/server.env.age"),
    plaintext: resolve(root, "apps/server/.env"),
  },
];

const e2eTargets: EnvTarget[] = [
  {
    encrypted: resolve(root, "secrets/e2e.env.age"),
    plaintext: resolve(root, "e2e/.env"),
  },
];

const envTargets = [...appTargets, ...e2eTargets];

function displayPath(path: string): string {
  return relative(root, path) || ".";
}

function expandHome(path: string): string {
  if (path === "~") return homedir();
  if (path.startsWith("~/")) return join(homedir(), path.slice(2));
  return path;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function identityPath(): string {
  const configured = process.env.AGE_IDENTITY_FILE;
  if (configured !== undefined && configured.trim() !== "") {
    return resolve(expandHome(configured.trim()));
  }

  const candidates = [join(homedir(), ".config/age/keys.txt"), join(homedir(), ".config/age/identity.age")];
  const existing = candidates.find((candidate) => Bun.file(candidate).size > 0);
  if (existing !== undefined) return existing;

  throw new Error(
    "No age identity found. Set AGE_IDENTITY_FILE to your private age identity file (it must stay outside this repository)."
  );
}

async function writeAtomically(path: string, contents: ArrayBuffer): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;

  try {
    await Bun.write(temporary, contents);
    await chmod(temporary, 0o600);
    await rename(temporary, path);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
}

async function decryptFile(target: EnvTarget, identity: string): Promise<void> {
  const ageProcess = Bun.spawn(["age", "--decrypt", "--identity", identity, target.encrypted], {
    cwd: root,
    stdin: "inherit",
    stdout: "pipe",
    stderr: "inherit",
  });
  const contents = new Response(ageProcess.stdout).arrayBuffer();
  const exitCode = await ageProcess.exited;

  if (exitCode !== 0) {
    try {
      await contents;
    } catch {
      // Ignore failed command output; no plaintext is written on failure.
    }
    throw new Error(`age could not decrypt ${displayPath(target.encrypted)} (exit code ${exitCode})`);
  }

  await writeAtomically(target.plaintext, await contents);
  console.log(`Decrypted ${displayPath(target.plaintext)}`);
}

async function encryptFile(target: EnvTarget): Promise<void> {
  const temporary = `${target.encrypted}.${process.pid}.tmp`;
  await mkdir(dirname(target.encrypted), { recursive: true });

  const ageProcess = Bun.spawn(
    ["age", "--encrypt", "--recipients-file", recipientFile, "--output", temporary, target.plaintext],
    {
      cwd: root,
      stdin: "inherit",
      stdout: "ignore",
      stderr: "inherit",
    }
  );
  const exitCode = await ageProcess.exited;

  if (exitCode !== 0) {
    await rm(temporary, { force: true });
    throw new Error(`age could not encrypt ${displayPath(target.plaintext)} (exit code ${exitCode})`);
  }

  try {
    await rename(temporary, target.encrypted);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
  console.log(`Encrypted ${displayPath(target.plaintext)} -> ${displayPath(target.encrypted)}`);
}

export async function decryptEnvFiles(): Promise<void> {
  const identity = identityPath();
  await Promise.all(
    envTargets.map(async (target) => {
      if (!(await fileExists(target.encrypted))) {
        throw new Error(`Encrypted environment file not found: ${displayPath(target.encrypted)}`);
      }
      await decryptFile(target, identity);
    })
  );
}

export async function encryptEnvFiles(): Promise<void> {
  if (!(await fileExists(recipientFile))) {
    throw new Error(`Age recipient file not found: ${displayPath(recipientFile)}`);
  }
  await Promise.all(
    envTargets.map(async (target) => {
      if (!(await fileExists(target.plaintext))) {
        throw new Error(`Plain environment file not found: ${displayPath(target.plaintext)}`);
      }
      await encryptFile(target);
    })
  );
}

async function main(): Promise<void> {
  const command = process.argv[2];
  if (command === "decrypt") {
    await decryptEnvFiles();
    return;
  }
  if (command === "encrypt") {
    await encryptEnvFiles();
    return;
  }

  throw new Error("Usage: bun scripts/env.ts <encrypt|decrypt>");
}

if (import.meta.main) {
  await main();
}
