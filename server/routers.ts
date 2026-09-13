import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addComment,
  createPost,
  deletePost,
  getCircleUsers,
  getFeed,
  getNotifications,
  getProfile,
  markNotificationsRead,
  toggleFollow,
  toggleLike,
  toggleSave,
  updateProfile,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  social: router({
    feed: publicProcedure
      .input(
        z
          .object({
            limit: z.number().min(1).max(50).default(20),
            filter: z.enum(["all", "saved", "trending"]).default("all"),
          })
          .optional()
      )
      .query(({ ctx, input }) =>
        getFeed(input?.limit ?? 20, input?.filter ?? "all", ctx.user?.id ?? 1)
      ),

    circles: publicProcedure.query(({ ctx }) => getCircleUsers(ctx.user?.id ?? 1)),

    createPost: protectedProcedure
      .input(
        z.object({
          body: z.string().trim().min(1).max(2000),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) => createPost(ctx.user.id, input.body, input.imageUrl)),

    addComment: protectedProcedure
      .input(
        z.object({
          postId: z.number().int().positive(),
          body: z.string().trim().min(1).max(500),
        })
      )
      .mutation(({ ctx, input }) => addComment(ctx.user.id, input.postId, input.body)),

    toggleLike: protectedProcedure
      .input(z.object({ postId: z.number().int().positive() }))
      .mutation(({ ctx, input }) => toggleLike(ctx.user.id, input.postId)),

    toggleSave: protectedProcedure
      .input(z.object({ postId: z.number().int().positive() }))
      .mutation(({ ctx, input }) => toggleSave(ctx.user.id, input.postId)),

    toggleFollow: protectedProcedure
      .input(z.object({ followingId: z.number().int().positive() }))
      .mutation(({ ctx, input }) => toggleFollow(ctx.user.id, input.followingId)),

    currentProfile: protectedProcedure.query(({ ctx }) => getProfile(ctx.user.id)),

    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(100).optional(),
          handle: z.string().min(1).max(50).optional(),
          bio: z.string().max(300).optional(),
          tone: z.string().max(50).optional(),
        })
      )
      .mutation(({ ctx, input }) => updateProfile(ctx.user.id, input)),

    deletePost: protectedProcedure
      .input(z.object({ postId: z.number().int().positive() }))
      .mutation(({ ctx, input }) => deletePost(ctx.user.id, input.postId)),

    notifications: protectedProcedure.query(({ ctx }) => getNotifications(ctx.user.id)),

    markNotificationsRead: protectedProcedure.mutation(({ ctx }) =>
      markNotificationsRead(ctx.user.id)
    ),
  }),
});

export type AppRouter = typeof appRouter;
