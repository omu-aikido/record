import { beforeEach, describe, expect, mock, test } from "bun:test";

const updateUserMetadataMock = mock(async (_userId: string, payload: Record<string, unknown>) => ({
  id: "member-user",
  publicMetadata: payload.publicMetadata,
}));
const updateUserMock = mock(async () => undefined);
const updateUserProfileImageMock = mock(async () => undefined);

const clerkUsers = {
  getUser: mock(async (userId: string) => {
    if (userId === "member-user") {
      return {
        id: "member-user",
        username: "aikido-user",
        firstName: "Aiko",
        lastName: "Do",
        imageUrl: "https://img.example/avatar.png",
        privateMetadata: { secret: "do-not-return" },
        unsafeMetadata: { internal: "do-not-return" },
        emailAddresses: [{ emailAddress: "aikido@example.com" }],
        publicMetadata: {
          role: "member",
          grade: null,
          getGradeAt: null,
          joinedAt: null,
          year: "",
          birthday: "",
        },
      };
    }

    throw new Error("user not found");
  }),
  updateUserMetadata: updateUserMetadataMock,
  updateUser: updateUserMock,
  updateUserProfileImage: updateUserProfileImageMock,
};

mock.module("@clerk/hono", () => ({
  getAuth: () => ({
    userId: "member-user",
    isAuthenticated: true,
  }),
}));

mock.module("@clerk/backend", () => ({
  createClerkClient: () => ({
    users: clerkUsers,
  }),
}));

mock.module("@/src/lib/observability", () => ({
  notify: mock(() => {}),
}));

const { clerk } = await import("@/src/app/user/clerk");

const testEnv = {
  CLERK_SECRET_KEY: "test-secret",
} as Env;

describe("GET /profile", () => {
  beforeEach(() => {
    clerkUsers.getUser.mockClear();
  });

  test("returns editable incomplete profile instead of 404", async () => {
    const res = await clerk.request("http://localhost/profile", {}, testEnv);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toMatchObject({
      needsProfileCompletion: true,
      profile: {
        id: "member-user",
        role: "member",
        grade: null,
        joinedAt: null,
        year: "",
        birthday: "",
      },
    });
  });
});

describe("GET /clerk/account", () => {
  test("returns only the public account DTO", async () => {
    const res = await clerk.request("http://localhost/account", {}, testEnv);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      userId: "member-user",
      username: "aikido-user",
      firstName: "Aiko",
      lastName: "Do",
      imageUrl: "https://img.example/avatar.png",
    });
    expect(json).not.toHaveProperty("privateMetadata");
    expect(json).not.toHaveProperty("unsafeMetadata");
    expect(json).not.toHaveProperty("emailAddresses");
  });
});

describe("PATCH /profile", () => {
  beforeEach(() => {
    clerkUsers.getUser.mockClear();
    updateUserMetadataMock.mockClear();
  });

  test("updates birthday on profile payload", async () => {
    const res = await clerk.request(
      "http://localhost/profile",
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          grade: 0,
          getGradeAt: null,
          joinedAt: 2024,
          year: "b1",
          birthday: "2001-02-03",
        }),
      },
      testEnv
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(updateUserMetadataMock).toHaveBeenCalledWith(
      "member-user",
      expect.objectContaining({
        publicMetadata: expect.objectContaining({
          birthday: "2001-02-03",
        }),
      })
    );
    expect(json).toMatchObject({
      needsProfileCompletion: false,
      profile: {
        id: "member-user",
        birthday: "2001-02-03",
      },
    });
  });
});

describe("PATCH /clerk/account", () => {
  beforeEach(() => {
    updateUserMock.mockClear();
    updateUserProfileImageMock.mockClear();
  });

  test("rejects a multipart image and never proxies it to Clerk's Backend API", async () => {
    const body = new FormData();
    body.set("firstName", "Aiko");
    body.set("profileImage", new File(["image"], "avatar.png", { type: "image/png" }));

    const res = await clerk.request(
      "http://localhost/account",
      { method: "PATCH", body },
      testEnv
    );

    expect(res.status).toBe(400);
    expect(updateUserMock).not.toHaveBeenCalled();
    expect(updateUserProfileImageMock).not.toHaveBeenCalled();
  });
});
