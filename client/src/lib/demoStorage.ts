/**
 * Demo & Offline Storage Layer for Social Grove
 *
 * Provides realistic initial data and interactive persistence via localStorage
 * when running on GitHub Pages (or whenever the backend is unavailable).
 */

export type Author = {
  id?: number;
  name: string;
  handle: string;
  initials: string;
  tone: string;
  bio?: string;
  email?: string;
  followed?: boolean;
};

export type Reply = {
  id: number;
  author: Author;
  body: string;
  time: string;
  createdAt: string;
};

export type Post = {
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
  replies?: Reply[];
};

export type CircleMember = {
  id: number;
  name: string;
  handle: string;
  initials: string;
  tone: string;
  bio: string;
  followed: boolean;
  notesCount: number;
};

export type GroveNotification = {
  id: number;
  type: "like" | "comment" | "follow";
  actor: Author;
  message: string;
  time: string;
  read: boolean;
};

const STORAGE_KEYS = {
  POSTS: "sg_demo_posts_v1",
  PROFILE: "sg_demo_profile_v1",
  CIRCLES: "sg_demo_circles_v1",
  NOTIFICATIONS: "sg_demo_notifications_v1",
};

export const DEFAULT_USER: Author = {
  id: 1,
  name: "Arin Bell",
  handle: "arinbell",
  initials: "AB",
  tone: "avatar-terracotta",
  bio: "Collecting small wonders, useful questions, and reasons to take the scenic route.",
  email: "arin@socialgrove.local",
};

const SEED_CIRCLES: CircleMember[] = [
  {
    id: 2,
    name: "Maya Lin",
    handle: "mayalin",
    initials: "ML",
    tone: "avatar-sage",
    bio: "Ceramics artist, studio gardener, and quiet observer of shifting seasons.",
    followed: true,
    notesCount: 18,
  },
  {
    id: 3,
    name: "Julian Vance",
    handle: "julianv",
    initials: "JV",
    tone: "avatar-slate",
    bio: "Typography enthusiast, bookbinder, and defender of slow coffee mornings.",
    followed: true,
    notesCount: 24,
  },
  {
    id: 4,
    name: "Elena Rostova",
    handle: "elenar",
    initials: "ER",
    tone: "avatar-forest",
    bio: "Urban forager and botanist mapping pollinator sanctuaries across old brick walls.",
    followed: false,
    notesCount: 15,
  },
  {
    id: 5,
    name: "Sora Takahashi",
    handle: "sorat",
    initials: "ST",
    tone: "avatar-clay",
    bio: "Architectural photographer capturing soft morning light and timber structures.",
    followed: true,
    notesCount: 31,
  },
];

const SEED_POSTS: Post[] = [
  {
    id: 101,
    userId: 1,
    author: DEFAULT_USER,
    time: "24m ago",
    createdAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    body: "The morning light filtering through birch leaves reminded me why slow mornings are non-negotiable. Kettle humming, no notifications until 10am. #slowliving #mindfulness #morningritual",
    imageUrl: null,
    likes: 28,
    comments: 3,
    liked: true,
    saved: true,
    replies: [
      {
        id: 1001,
        author: SEED_CIRCLES[0],
        body: "Could not agree more. Guarding the first hour makes the whole day feel spacious.",
        time: "18m ago",
        createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      },
      {
        id: 1002,
        author: SEED_CIRCLES[1],
        body: "Pouring an Ethiopian light roast right now to that exact sentiment.",
        time: "12m ago",
        createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      },
      {
        id: 1003,
        author: SEED_CIRCLES[3],
        body: "The light at 7:30 was remarkable today—long amber beams across the balcony.",
        time: "5m ago",
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 102,
    userId: 4,
    author: SEED_CIRCLES[2],
    time: "2h ago",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    body: "Found wild blue chicory flourishing straight through a crack in the bakery pavement this morning. Resilience in the smallest forgotten corners of our city. #natureinthecity #urbanecology #botany",
    imageUrl: null,
    likes: 46,
    comments: 2,
    liked: false,
    saved: false,
    replies: [
      {
        id: 1004,
        author: DEFAULT_USER,
        body: "Chicory roots go so astonishingly deep—nature always reclaims its space.",
        time: "1h ago",
        createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      },
      {
        id: 1005,
        author: SEED_CIRCLES[0],
        body: "That cornflower blue against grey asphalt is one of my favorite sights.",
        time: "45m ago",
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 103,
    userId: 3,
    author: SEED_CIRCLES[1],
    time: "5h ago",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    body: "Spent the afternoon hand-setting 12pt Bembo metal type for a small poetry broadside. There's a tactile rhythm in analog craft that software simply cannot mimic. Each letter has physical mass. #typography #craft #bookbinding #printmaking",
    imageUrl: null,
    likes: 62,
    comments: 1,
    liked: true,
    saved: true,
    replies: [
      {
        id: 1006,
        author: SEED_CIRCLES[3],
        body: "Please share a proof impression once you ink the chase! Would love to see it.",
        time: "3h ago",
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 104,
    userId: 2,
    author: SEED_CIRCLES[0],
    time: "yesterday",
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    body: "Unloading the kiln is always like unearthing small relics from another time. The celadon glaze turned out softer and deeper than expected. Autumn tea bowls are ready. #pottery #ceramics #autumncraft",
    imageUrl: null,
    likes: 54,
    comments: 2,
    liked: false,
    saved: false,
    replies: [
      {
        id: 1007,
        author: DEFAULT_USER,
        body: "The depth of a good reduction celadon is unbeatable. Beautiful work Maya.",
        time: "20h ago",
        createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
      },
      {
        id: 1008,
        author: SEED_CIRCLES[2],
        body: "I can already smell the roasted green tea in those bowls!",
        time: "15h ago",
        createdAt: new Date(Date.now() - 15 * 3600 * 1000).toISOString(),
      },
    ],
  },
];

const SEED_NOTIFICATIONS: GroveNotification[] = [
  {
    id: 201,
    type: "like",
    actor: SEED_CIRCLES[0],
    message: "liked your note on morning rituals and tea",
    time: "18m ago",
    read: false,
  },
  {
    id: 202,
    type: "comment",
    actor: SEED_CIRCLES[1],
    message: "replied to your note: 'Pouring an Ethiopian light roast right now...'",
    time: "12m ago",
    read: false,
  },
  {
    id: 203,
    type: "follow",
    actor: SEED_CIRCLES[3],
    message: "joined your circle in the grove",
    time: "1d ago",
    read: true,
  },
];

export function isStaticOrGitHubPages(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.location.hostname.endsWith("github.io") ||
    window.location.hostname === "localhost" && window.location.search.includes("demo=true") ||
    localStorage.getItem("sg_force_demo") === "true"
  );
}

export function getStoredPosts(filter?: "all" | "saved"): Post[] {
  if (typeof window === "undefined") return SEED_POSTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    let posts: Post[] = raw
      ? JSON.parse(raw).map((p: any) => ({ ...p, saved: Boolean(p.saved) }))
      : SEED_POSTS;
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(SEED_POSTS));
    }
    if (filter === "saved") {
      return posts.filter((p) => p.saved);
    }
    return posts;
  } catch {
    return SEED_POSTS;
  }
}

export function getStoredProfile(): Author {
  if (typeof window === "undefined") return DEFAULT_USER;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

export function getStoredCircles(): CircleMember[] {
  if (typeof window === "undefined") return SEED_CIRCLES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CIRCLES);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEYS.CIRCLES, JSON.stringify(SEED_CIRCLES));
    return SEED_CIRCLES;
  } catch {
    return SEED_CIRCLES;
  }
}

export function getStoredNotifications(): GroveNotification[] {
  if (typeof window === "undefined") return SEED_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
    return SEED_NOTIFICATIONS;
  } catch {
    return SEED_NOTIFICATIONS;
  }
}

export function saveDemoPost({
  body,
  imageUrl,
}: {
  body: string;
  imageUrl?: string | null;
}): Post {
  const posts = getStoredPosts();
  const profile = getStoredProfile();

  const newPost: Post = {
    id: Date.now(),
    userId: profile.id || 1,
    author: profile,
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

  const updated = [newPost, ...posts];
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
  return newPost;
}

export function toggleDemoLike(postId: number): { liked: boolean; likes: number } {
  const posts = getStoredPosts();
  let result = { liked: false, likes: 0 };

  const updated = posts.map((p) => {
    if (p.id === postId) {
      const nextLiked = !p.liked;
      const nextLikes = nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1);
      result = { liked: nextLiked, likes: nextLikes };
      return { ...p, liked: nextLiked, likes: nextLikes };
    }
    return p;
  });

  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
  return result;
}

export function toggleDemoSave(postId: number): { saved: boolean } {
  const posts = getStoredPosts();
  let result = { saved: false };

  const updated = posts.map((p) => {
    if (p.id === postId) {
      const nextSaved = !p.saved;
      result = { saved: nextSaved };
      return { ...p, saved: nextSaved };
    }
    return p;
  });

  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
  return result;
}

export function addDemoComment(postId: number, body: string): Reply {
  const posts = getStoredPosts();
  const profile = getStoredProfile();

  const reply: Reply = {
    id: Date.now(),
    author: profile,
    body,
    time: "Just now",
    createdAt: new Date().toISOString(),
  };

  const updated = posts.map((p) => {
    if (p.id === postId) {
      const replies = [...(p.replies || []), reply];
      return {
        ...p,
        replies,
        comments: replies.length,
      };
    }
    return p;
  });

  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
  return reply;
}

export function toggleDemoFollow(handle: string): { following: boolean } {
  const circles = getStoredCircles();
  let following = false;

  const updated = circles.map((c) => {
    if (c.handle === handle) {
      following = !c.followed;
      return { ...c, followed: following };
    }
    return c;
  });

  localStorage.setItem(STORAGE_KEYS.CIRCLES, JSON.stringify(updated));
  return { following };
}

export function updateDemoProfile(profileUpdates: Partial<Author>): Author {
  const current = getStoredProfile();
  const updated: Author = {
    ...current,
    ...profileUpdates,
    initials:
      profileUpdates.name
        ?.split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || current.initials,
  };

  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
  return updated;
}

export function deleteDemoPost(postId: number): void {
  const posts = getStoredPosts();
  const updated = posts.filter((p) => p.id !== postId);
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
}

export function markDemoNotificationsRead(): void {
  const notifs = getStoredNotifications();
  const updated = notifs.map((n) => ({ ...n, read: true }));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
}
