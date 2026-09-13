import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAnonymousContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("social endpoints", () => {
  it("rejects post creation when a visitor is not authenticated", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());
    await expect(caller.social.createPost({ body: "A note from a visitor" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects feed limits outside the public range", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());
    await expect(caller.social.feed({ limit: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects blank comments before reaching the database", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());
    await expect(caller.social.addComment({ postId: 1, body: "" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
