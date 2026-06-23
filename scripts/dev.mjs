const tasks = [
  {
    name: 'database',
    cwd: 'apps/database',
  },
  {
    name: 'server',
    cwd: 'apps/server',
  },
  {
    name: 'client',
    cwd: 'apps/client',
  },
];

const children = [];
let shuttingDown = false;

function startTask(task) {
  console.log(`Starting ${task.name}...`);

  const child = Bun.spawn({
    cmd: ['bun', 'run', 'dev'],
    cwd: task.cwd,
    env: Bun.env,
    stdout: 'inherit',
    stderr: 'inherit',
  });

  children.push(child);

  void (async () => {
    const code = await child.exited;

    if (shuttingDown) {
      return;
    }

    console.error(`${task.name} exited unexpectedly (exit code ${code}). Shutting down remaining processes.`);
    shutdown(code || 1);
  })();
}

function sleep(ms) {
  return Bun.sleep(ms);
}

function shutdown(exitCode = 0) {
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

process.once('SIGINT', () => shutdown(0));
process.once('SIGTERM', () => shutdown(0));

try {
  await tasks.reduce(async (previous, task, index) => {
    await previous;
    startTask(task);

    if (index < tasks.length - 1) {
      console.log(`Waiting for ${task.name} to initialize...`);
      await sleep(1500);
    }

    return;
  }, Promise.resolve());

  console.log('All dev servers started in order.');
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  shutdown(1);
}
