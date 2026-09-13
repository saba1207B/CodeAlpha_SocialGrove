import fs from "fs";
import path from "path";
import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { comments, follows, InsertUser, postLikes, posts, User, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ---------------------------------------------------------------------------
// Local Persistent JSON Storage Fallback
// ---------------------------------------------------------------------------

export type Author = {
  id: number;
  name: string;
  handle: string;
  initials: string;
  tone: string;
  bio?: string;
  email?: string;
  following?: boolean;
};

export type Reply = {
  id: number;
  author: Author;
  body: string;
  time: string;
  createdAt: string;
};

export type FeedPost = {
  id: number;
  userId: number;
  author: Author;
  time: string;
  createdAt: string;
  body: string;
  imageUrl?: string | null;
  likes: number;
  comments: number;
  liked: boolean;
  saved: boolean;
  replies: Reply[];
};

export type NotificationItem = {
  id: number;
  userId: number;
  actor: Author;
  type: "like" | "comment" | "follow";
  text: string;
  time: string;
  createdAt: string;
  read: boolean;
};

type LocalStore = {
  users: Author[];
  posts: FeedPost[];
  follows: { followerId: number; followingId: number }[];
  notifications: NotificationItem[];
};

const DB_FILE_PATH = path.resolve(import.meta.dirname, "local_db.json");

const defaultUsers: Author[] = [
  {
    id: 1,
    name: "Arin Bell",
    handle: "arinbell",
    initials: "AB",
    tone: "avatar-terracotta",
    bio: "Collecting small wonders, useful questions, and reasons to take the scenic route.",
    email: "arin@socialgrove.local",
  },
  {
    id: 2,
    name: "Maya Chen",
    handle: "mayamakes",
    initials: "MC",
    tone: "avatar-plum",
    bio: "Ceramicist and quiet morning enthusiast. Exploring form, fire, and mindful routines.",
    email: "maya@socialgrove.local",
  },
  {
    id: 3,
    name: "Jonas Wright",
    handle: "jonaswright",
    initials: "JW",
    tone: "avatar-olive",
    bio: "Landscape painter looking for late light and forgotten street corners.",
    email: "jonas@socialgrove.local",
  },
  {
    id: 4,
    name: "Nia Okafor",
    handle: "niawrites",
    initials: "NO",
    tone: "avatar-sand",
    bio: "Essayist, long lunch advocate, and notebook page collector.",
    email: "nia@socialgrove.local",
  },
  {
    id: 5,
    name: "Theo Park",
    handle: "theopark",
    initials: "TP",
    tone: "avatar-blue",
    bio: "Architectural designer observing the rhythm of the city.",
    email: "theo@socialgrove.local",
  },
];

const defaultPosts: FeedPost[] = [
  {
    id: 1,
    userId: 2,
    author: defaultUsers[1],
    time: "18m ago",
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    body: "A small reminder from my morning walk: the best ideas rarely arrive when we ask them to. Leave a little room around the day. #slowmornings",
    imageUrl: null,
    likes: 48,
    comments: 2,
    liked: false,
    saved: false,
    replies: [
      {
        id: 101,
        author: defaultUsers[0],
        body: "This is exactly what I needed today.",
        time: "12m ago",
        createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      },
      {
        id: 102,
        author: defaultUsers[2],
        body: "Room around the day — keeping that one.",
        time: "5m ago",
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 2,
    userId: 3,
    author: defaultUsers[2],
    time: "1h ago",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    body: "Collected a few colors on the way home. There is something about late light that makes an ordinary street feel like a new place. #madebyhand",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    likes: 112,
    comments: 2,
    liked: true,
    saved: true,
    replies: [
      {
        id: 103,
        author: defaultUsers[1],
        body: "The light is unreal here.",
        time: "45m ago",
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
      {
        id: 104,
        author: defaultUsers[3],
        body: "This makes me want to take the long way home.",
        time: "20m ago",
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 3,
    userId: 4,
    author: defaultUsers[3],
    time: "3h ago",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    body: "What are you making space for this week? I am choosing one brave conversation, one long lunch, and a notebook page with no outcome attached. #smalljoys",
    imageUrl: null,
    likes: 76,
    comments: 1,
    liked: false,
    saved: false,
    replies: [
      {
        id: 105,
        author: defaultUsers[4],
        body: "A page with no outcome attached — yes.",
        time: "2h ago",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

const defaultFollows = [
  { followerId: 1, followingId: 2 },
  { followerId: 1, followingId: 3 },
  { followerId: 3, followingId: 1 },
  { followerId: 4, followingId: 1 },
];

const defaultNotifications: NotificationItem[] = [
  {
    id: 1,
    userId: 1,
    actor: defaultUsers[1],
    type: "like",
    text: "Maya Chen liked your morning note.",
    time: "25m ago",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 2,
    userId: 1,
    actor: defaultUsers[2],
    type: "comment",
    text: "Jonas Wright replied to your note: 'Love this perspective!'",
    time: "1h ago",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 3,
    userId: 1,
    actor: defaultUsers[4],
    type: "follow",
    text: "Theo Park joined your circle.",
    time: "1d ago",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

let _memoryStore: LocalStore | null = null;

function loadStore(): LocalStore {
  if (_memoryStore) return _memoryStore;

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      _memoryStore = JSON.parse(raw);
      return _memoryStore!;
    } catch (e) {
      console.warn("[LocalDB] Could not parse local_db.json, resetting to seed defaults", e);
    }
  }

  _memoryStore = {
    users: defaultUsers,
    posts: defaultPosts,
    follows: defaultFollows,
    notifications: defaultNotifications,
  };
  saveStore();
  return _memoryStore;
}

function saveStore() {
  if (!_memoryStore) return;
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(_memoryStore, null, 2), "utf-8");
  } catch (err) {
    console.error("[LocalDB] Failed to save store:", err);
  }
}

// ---------------------------------------------------------------------------
// Unified User & Dev Functions
// ---------------------------------------------------------------------------

export async function getOrCreateDevUser(): Promise<User> {
  const store = loadStore();
  const u = store.users.find((user) => user.id === 1) || defaultUsers[0];
  return {
    id: u.id,
    openId: "dev-arin-bell",
    name: u.name,
    email: u.email ?? "arin@socialgrove.local",
    loginMethod: "local",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    const store = loadStore();
    const existing = store.users.find((u) => u.handle === user.name || u.id === 1);
    if (existing) {
      if (user.name) existing.name = user.name;
      if (user.email) existing.email = user.email;
      saveStore();
    }
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    const store = loadStore();
    const u = store.users.find((user) => user.id === 1);
    if (!u) return undefined;
    return {
      id: u.id,
      openId,
      name: u.name,
      email: u.email ?? null,
      loginMethod: "local",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ---------------------------------------------------------------------------
// Social Functions (Feed, Posts, Comments, Likes, Saves, Follows, Profile)
// ---------------------------------------------------------------------------

export async function getFeed(
  limit = 20,
  filter: "all" | "saved" | "trending" = "all",
  currentUserId = 1
): Promise<FeedPost[]> {
  const store = loadStore();
  let list = [...store.posts];

  if (filter === "saved") {
    list = list.filter((p) => p.saved);
  } else if (filter === "trending") {
    list.sort((a, b) => b.likes + b.comments - (a.likes + a.comments));
  } else {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return list.slice(0, limit);
}

export async function createPost(
  userId: number,
  body: string,
  imageUrl?: string
): Promise<number> {
  const store = loadStore();
  const author = store.users.find((u) => u.id === userId) || defaultUsers[0];
  const newPost: FeedPost = {
    id: Date.now(),
    userId,
    author,
    time: "Just now",
    createdAt: new Date().toISOString(),
    body,
    imageUrl: imageUrl || null,
    likes: 0,
    comments: 0,
    liked: false,
    saved: false,
    replies: [],
  };

  store.posts.unshift(newPost);
  saveStore();

  const db = await getDb();
  if (db) {
    try {
      const result = await db.insert(posts).values({ userId, body, imageUrl: imageUrl ?? null });
      return result[0]?.insertId ?? newPost.id;
    } catch {
      // ignore db error in fallback mode
    }
  }

  return newPost.id;
}

export async function addComment(
  userId: number,
  postId: number,
  body: string
): Promise<Reply> {
  const store = loadStore();
  const post = store.posts.find((p) => p.id === postId);
  if (!post) throw new Error("Post not found");

  const author = store.users.find((u) => u.id === userId) || defaultUsers[0];
  const reply: Reply = {
    id: Date.now(),
    author,
    body,
    time: "Just now",
    createdAt: new Date().toISOString(),
  };

  post.replies = post.replies || [];
  post.replies.push(reply);
  post.comments = post.replies.length;

  // Add notification to post author if not self
  if (post.userId !== userId) {
    store.notifications.unshift({
      id: Date.now(),
      userId: post.userId,
      actor: author,
      type: "comment",
      text: `${author.name} replied to your note: "${body.slice(0, 40)}${body.length > 40 ? "..." : ""}"`,
      time: "Just now",
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  saveStore();

  const db = await getDb();
  if (db) {
    try {
      await db.insert(comments).values({ userId, postId, body });
    } catch {
      // fallback
    }
  }

  return reply;
}

export async function toggleLike(
  userId: number,
  postId: number
): Promise<{ liked: boolean; likes: number }> {
  const store = loadStore();
  const post = store.posts.find((p) => p.id === postId);
  if (!post) throw new Error("Post not found");

  post.liked = !post.liked;
  post.likes = post.liked ? post.likes + 1 : Math.max(0, post.likes - 1);

  if (post.liked && post.userId !== userId) {
    const actor = store.users.find((u) => u.id === userId) || defaultUsers[0];
    store.notifications.unshift({
      id: Date.now(),
      userId: post.userId,
      actor,
      type: "like",
      text: `${actor.name} liked your note.`,
      time: "Just now",
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  saveStore();

  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select({ id: postLikes.id })
        .from(postLikes)
        .where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)))
        .limit(1);
      if (existing[0]) {
        await db.delete(postLikes).where(eq(postLikes.id, existing[0].id));
      } else {
        await db.insert(postLikes).values({ userId, postId });
      }
    } catch {
      // fallback
    }
  }

  return { liked: post.liked, likes: post.likes };
}

export async function toggleSave(
  userId: number,
  postId: number
): Promise<{ saved: boolean }> {
  const store = loadStore();
  const post = store.posts.find((p) => p.id === postId);
  if (!post) throw new Error("Post not found");

  post.saved = !post.saved;
  saveStore();
  return { saved: post.saved };
}

export async function toggleFollow(
  followerId: number,
  followingId: number
): Promise<{ following: boolean }> {
  if (followerId === followingId) throw new Error("You cannot follow yourself");
  const store = loadStore();
  const index = store.follows.findIndex(
    (f) => f.followerId === followerId && f.followingId === followingId
  );

  let following = false;
  if (index >= 0) {
    store.follows.splice(index, 1);
    following = false;
  } else {
    store.follows.push({ followerId, followingId });
    following = true;

    const follower = store.users.find((u) => u.id === followerId) || defaultUsers[0];
    store.notifications.unshift({
      id: Date.now(),
      userId: followingId,
      actor: follower,
      type: "follow",
      text: `${follower.name} joined your circle.`,
      time: "Just now",
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  saveStore();

  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select({ id: follows.id })
        .from(follows)
        .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
        .limit(1);
      if (existing[0]) {
        await db.delete(follows).where(eq(follows.id, existing[0].id));
      } else {
        await db.insert(follows).values({ followerId, followingId });
      }
    } catch {
      // fallback
    }
  }

  return { following };
}

export async function getProfile(userId: number) {
  const store = loadStore();
  const user = store.users.find((u) => u.id === userId) || defaultUsers[0];
  const userPosts = store.posts.filter((p) => p.userId === userId);
  const followingCount = store.follows.filter((f) => f.followerId === userId).length;
  const followersCount = store.follows.filter((f) => f.followingId === userId).length;

  return {
    ...user,
    notesCount: userPosts.length,
    followingCount,
    followersCount,
    notes: userPosts,
  };
}

export async function updateProfile(
  userId: number,
  data: { name?: string; handle?: string; bio?: string; tone?: string }
) {
  const store = loadStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");

  if (data.name) user.name = data.name.trim();
  if (data.handle) user.handle = data.handle.trim().replace(/^@/, "");
  if (data.bio !== undefined) user.bio = data.bio.trim();
  if (data.tone) user.tone = data.tone;

  // Update initials
  const parts = user.name.split(" ");
  user.initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : user.name.slice(0, 2).toUpperCase();

  // Update author references in posts
  store.posts.forEach((p) => {
    if (p.userId === userId) {
      p.author = { ...user };
    }
    p.replies?.forEach((r) => {
      if (r.author.id === userId) {
        r.author = { ...user };
      }
    });
  });

  saveStore();
  return user;
}

export async function deletePost(userId: number, postId: number): Promise<boolean> {
  const store = loadStore();
  const postIndex = store.posts.findIndex((p) => p.id === postId);
  if (postIndex === -1) throw new Error("Post not found");

  const post = store.posts[postIndex];
  if (post.userId !== userId) throw new Error("You can only delete your own notes");

  store.posts.splice(postIndex, 1);
  saveStore();

  const db = await getDb();
  if (db) {
    try {
      await db.delete(posts).where(and(eq(posts.id, postId), eq(posts.userId, userId)));
    } catch {
      // fallback
    }
  }

  return true;
}

export async function getNotifications(userId: number): Promise<NotificationItem[]> {
  const store = loadStore();
  return store.notifications.filter((n) => n.userId === userId);
}

export async function markNotificationsRead(userId: number): Promise<boolean> {
  const store = loadStore();
  store.notifications.forEach((n) => {
    if (n.userId === userId) n.read = true;
  });
  saveStore();
  return true;
}

export async function getCircleUsers(currentUserId: number) {
  const store = loadStore();
  return store.users
    .filter((u) => u.id !== currentUserId)
    .map((u) => ({
      ...u,
      followed: store.follows.some(
        (f) => f.followerId === currentUserId && f.followingId === u.id
      ),
    }));
}
