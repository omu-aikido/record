import { ArkErrors } from 'arktype';
import { Hono } from 'hono';

import { arktypeValidator } from '@hono/arktype-validator';
import { getAuth } from '@hono/clerk-auth';

import { notify } from '@/src/lib/observability';
import { getProfile, getUser, patchProfile } from '@/src/clerk/profile';

import { AccountMetadata, Role, updateAccountSchema } from 'share';

export const clerk = new Hono<{ Bindings: Env }>() //
  .get('/account', async (c) => {
    const auth = getAuth(c);
    if (!auth || !auth.userId) return c.json({ error: 'Not Authenticated' }, 401);
    const user = await getUser(c);
    if (!user) return c.json({ error: 'User not found' }, 404);
    return c.json(user, 200);
  })
  .patch(
    '/account',
    arktypeValidator('form', updateAccountSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid account payload' }, 400);
      }
      return;
    }),
    async (c) => {
      const auth = getAuth(c);
      if (!auth || !auth.userId) return c.json({ error: 'Not Authenticated' }, 401);

      const body = c.req.valid('form');

      const username = body.username;
      const firstName = body.firstName;
      const lastName = body.lastName;
      const profileImage = body.profileImage;

      const { createClerkClient } = await import('@clerk/backend');
      const clerkClient = createClerkClient({
        secretKey: c.env.CLERK_SECRET_KEY,
      });

      try {
        const updatePayload: Parameters<typeof clerkClient.users.updateUser>[1] = {};

        if (username && typeof username === 'string') updatePayload.username = username;
        if (!username) updatePayload.username = '';
        if (firstName && typeof firstName === 'string') updatePayload.firstName = firstName;
        if (lastName && typeof lastName === 'string') updatePayload.lastName = lastName;
        if (Object.keys(updatePayload).length > 0) await clerkClient.users.updateUser(auth.userId, updatePayload);

        if (profileImage instanceof File && profileImage.size > 0) {
          await clerkClient.users.updateUserProfileImage(auth.userId, {
            file: profileImage,
          });
        }

        const updatedUser = await clerkClient.users.getUser(auth.userId);

        return c.json(
          {
            userId: updatedUser.id,
            username: updatedUser.username,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            imageUrl: updatedUser.imageUrl,
          },
          200
        );
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        notify(c, err, { statusCode: 500 });
        return c.json({ error: 'Failed to update account' }, 500);
      }
    }
  )
  .get('/profile', async (c) => {
    const auth = getAuth(c);

    if (!auth || !auth.userId) return c.json({ error: 'Not Authenticated' }, 401);

    const profile = await getProfile(c);

    if (!profile) return c.json({ error: 'Profile not found' }, 404);

    return c.json({ profile: { id: auth.userId, ...profile } }, 200);
  })
  .patch(
    '/profile',
    arktypeValidator('json', AccountMetadata.omit('role'), (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid profile payload' }, 400);
      }
      return;
    }),
    async (c) => {
      const reqData = c.req.valid('json');
      const profile = await getProfile(c);

      if (!profile) return c.json({ error: 'Profile not found' }, 404);

      const newUserData = await patchProfile(c, {
        role: profile.role,
        ...reqData,
      });

      if (Object.keys(newUserData.publicMetadata).length === 0)
        return c.json({ error: 'Failed to update user data.' }, 500);

      const newProfile = AccountMetadata(newUserData.publicMetadata);

      if (newProfile instanceof ArkErrors) return c.json({ error: 'Invalid profile data' }, 400);

      return c.json({ profile: { id: newUserData.id, ...newProfile } }, 200);
    }
  )
  .get('/menu', async (c) => {
    const auth = getAuth(c);
    if (!auth || !auth.userId) return c.json({ error: 'Not Authenticated' }, 401);

    const profile = await getProfile(c);
    const role = profile ? Role.parse(profile.role) : undefined;
    const isManagement = role?.isManagement() ?? false;

    const menuItems = [
      {
        id: 'record',
        title: '活動記録',
        href: '/record',
        icon: 'clipboard-list',
        theme: 'blue',
      },
      {
        id: 'account',
        title: 'アカウント',
        href: '/account',
        icon: 'user',
        theme: 'green',
      },
    ];

    if (isManagement) {
      menuItems.push({
        id: 'admin',
        title: '管理パネル',
        href: '/admin',
        icon: 'settings',
        theme: 'indigo',
      });
    }

    return c.json({ menu: menuItems }, 200);
  });
