import type { AppType } from 'share/hono';
import { hc } from 'hono/client';

const honoClient = hc<AppType>('/', { init: { credentials: 'include' } }).api;

export default honoClient;
