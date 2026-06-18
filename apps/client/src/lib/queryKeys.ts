import type hc from './honoClient';
import { type InferRequestType } from 'hono/client';

type RecordQuery = Partial<InferRequestType<typeof hc.user.record.$get>>;
type AdminAccountsQuery = Partial<InferRequestType<typeof hc.admin.accounts.$get>>;
type AdminUsersQuery = Partial<InferRequestType<(typeof hc.admin.users)[':userId']['$get']>['query']>;

export const queryKeys = {
  user: {
    clerk: {
      profile: () => ['user', 'clerk', 'profile'] as const,
      account: () => ['user', 'clerk', 'account'] as const,
      menu: () => ['user', 'clerk', 'menu'] as const,
    },
    record: Object.assign((args?: RecordQuery) => ['user', 'record', args] as const, {
      count: () => ['user', 'record', 'count'] as const,
      ranking: () => ['user', 'record', 'ranking'] as const,
    }),
  },
  admin: {
    dashboard: () => ['admin', 'dashboard'] as const,
    accounts: (args?: AdminAccountsQuery) => ['admin', 'accounts', args] as const,
    users: (userId: string, args?: AdminUsersQuery) => ['admin', 'users', userId, { query: args }] as const,
  },
} as const;
