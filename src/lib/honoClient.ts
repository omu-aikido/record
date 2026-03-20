import type { AppType } from '@/server';
import { hc } from 'hono/client';

const honoClient = hc<AppType>('/', { init: { credentials: 'include' } }).api;

export default honoClient;
