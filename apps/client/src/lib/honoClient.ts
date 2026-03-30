import type App from '../../../server/src';
import { hc } from 'hono/client';

const honoClient = hc<typeof App>('/', { init: { credentials: 'include' } }).api;

export default honoClient;
