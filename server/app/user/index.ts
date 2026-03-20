import { clerk } from './clerk';
import { ensureSignedIn } from '@/server/middleware/signedIn';
import { Hono } from 'hono';
import { record } from './record';

const userApp = new Hono<{ Bindings: Env }>() //
  .use('*', ensureSignedIn) //
  .route('/record', record) //
  .route('/clerk', clerk); //

export default userApp;
