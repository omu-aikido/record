import type App from '../../server/src/index';
import type { WorkerEnv } from '../../server/env';

export type AppBindings = WorkerEnv;
export type AppType = typeof App;
