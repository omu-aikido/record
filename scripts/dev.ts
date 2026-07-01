/// <reference types="bun" />

type DevChildProcess = ReturnType<typeof Bun.spawn>;

const children: DevChildProcess[] = [];
let shuttingDown = false;

function shutdown(exitCode = 0): void {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    child.kill();
  }

  setTimeout(() => {
    process.exit(exitCode);
  }, 100).unref?.();
}

process.once("SIGINT", () => {
  shutdown(0);
});
process.once("SIGTERM", () => {
  shutdown(0);
});

// eslint-disable-next-line max-lines-per-function
async function main(): Promise<void> {
  console.log("Starting database...");
  const database = Bun.spawn({
    cmd: ["bun", "run", "dev"],
    cwd: "apps/database",
    env: Bun.env,
    stdout: "inherit",
    stderr: "inherit",
  });
  children.push(database);
  void (async () => {
    const code = await database.exited;
    if (!shuttingDown) {
      console.error(`database exited unexpectedly (exit code ${code}). Shutting down remaining processes.`);
      shutdown(code ?? 1);
    }
  })();

  console.log("Waiting for database to initialize...");
  await Bun.sleep(1500);

  console.log("Starting server...");
  const server = Bun.spawn({
    cmd: ["bun", "run", "dev"],
    cwd: "apps/server",
    env: Bun.env,
    stdout: "inherit",
    stderr: "inherit",
  });
  children.push(server);
  void (async () => {
    const code = await server.exited;
    if (!shuttingDown) {
      console.error(`server exited unexpectedly (exit code ${code}). Shutting down remaining processes.`);
      shutdown(code ?? 1);
    }
  })();

  console.log("Waiting for server to initialize...");
  await Bun.sleep(1500);

  console.log("Starting client...");
  const client = Bun.spawn({
    cmd: ["bun", "run", "dev"],
    cwd: "apps/client",
    env: Bun.env,
    stdout: "inherit",
    stderr: "inherit",
  });
  children.push(client);
  void (async () => {
    const code = await client.exited;
    if (!shuttingDown) {
      console.error(`client exited unexpectedly (exit code ${code}). Shutting down remaining processes.`);
      shutdown(code ?? 1);
    }
  })();

  console.log("All dev servers started in order.");
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  shutdown(1);
});
