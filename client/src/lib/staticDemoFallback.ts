import superjson from "superjson";

type Author = {
  id: number;
  name: string;
  handle: string;
  initials: string;
  tone: string;
  bio?: string;
  email?: string;
  following?: boolean;
};

type Reply = {
  id: number;
  author: Author;
  body: string;
  time: string;
  createdAt: string;
};

type FeedPost = {
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

type NotificationItem = {
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

const STORAGE_KEY = "social_grove_static_store";

const defaultStore: LocalStore = {
  users: [
    {
      id: 1,
      name: "Arin Bell",
      handle: "arinbell",
      initials: "AB",
      tone: "avatar-olive",
      bio: "Curator of slow mornings and good questions.",
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
  ],
  posts: [
    {
      id: 1,
      userId: 1,
      author: {
        id: 1,
        name: "Arin Bell",
        handle: "arinbell",
        initials: "AB",
        tone: "avatar-olive",
        bio: "Curator of slow mornings and good questions.",
        email: "arin@socialgrove.local",
      },
      time: "25m ago",
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      body: "A small reminder from my morning walk: the best ideas rarely arrive when we ask them to. Leave a little room around the day. #slowmornings",
      imageUrl: null,
      likes: 48,
      comments: 2,
      liked: false,
      saved: false,
      replies: [
        {
          id: 101,
          author: {
            id: 2,
            name: "Maya Chen",
            handle: "mayamakes",
            initials: "MC",
            tone: "avatar-plum",
          },
          body: "This is exactly what I needed today.",
          time: "12m ago",
          createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        },
        {
          id: 102,
          author: {
            id: 3,
            name: "Jonas Wright",
            handle: "jonaswright",
            initials: "JW",
            tone: "avatar-olive",
          },
          body: "Room around the day — keeping that one.",
          time: "5m ago",
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: 2,
      userId: 3,
      author: {
        id: 3,
        name: "Jonas Wright",
        handle: "jonaswright",
        initials: "JW",
        tone: "avatar-olive",
      },
      time: "1h ago",
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      body: "Collected a few colors on the way home. There is something about late light that makes an ordinary street feel like a new place. #madebyhand",
      imageUrl:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      likes: 112,
      comments: 1,
      liked: true,
      saved: true,
      replies: [
        {
          id: 103,
          author: {
            id: 1,
            name: "Arin Bell",
            handle: "arinbell",
            initials: "AB",
            tone: "avatar-olive",
          },
          body: "The golden hour gradient here is magnificent.",
          time: "30m ago",
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: 3,
      userId: 2,
      author: {
        id: 2,
        name: "Maya Chen",
        handle: "mayamakes",
        initials: "MC",
        tone: "avatar-plum",
      },
      time: "3h ago",
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      body: "Third firing of the season finished today. A mix of sage and matte white glazes. Sometimes letting pieces dry slowly makes all the difference. #madebyhand",
      imageUrl:
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
      likes: 89,
      comments: 0,
      liked: false,
      saved: false,
      replies: [],
    },
    {
      id: 4,
      userId: 4,
      author: {
        id: 4,
        name: "Nia Okafor",
        handle: "niawrites",
        initials: "NO",
        tone: "avatar-sand",
      },
      time: "5h ago",
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      body: "A quiet corner with mint tea, wool socks, and an unfinished notebook. Grateful for unhurried afternoons. #smalljoys #quietplaces",
      imageUrl: null,
      likes: 64,
      comments: 0,
      liked: false,
      saved: false,
      replies: [],
    },
  ],
  follows: [
    { followerId: 1, followingId: 2 },
    { followerId: 1, followingId: 3 },
  ],
  notifications: [
    {
      id: 1,
      userId: 1,
      actor: {
        id: 2,
        name: "Maya Chen",
        handle: "mayamakes",
        initials: "MC",
        tone: "avatar-plum",
      },
      type: "comment",
      text: "replied to your note: \"This is exactly what I needed today.\"",
      time: "12m ago",
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 2,
      userId: 1,
      actor: {
        id: 3,
        name: "Jonas Wright",
        handle: "jonaswright",
        initials: "JW",
        tone: "avatar-olive",
      },
      type: "like",
      text: "liked your note",
      time: "18m ago",
      createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      read: false,
    },
  ],
};

function getStore(): LocalStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  saveStore(defaultStore);
  return defaultStore;
}

function saveStore(store: LocalStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

export function handleStaticApiRequest(
  pathname: string,
  method: string,
  bodyData: any,
  searchParams: URLSearchParams
): Response | null {
  const trpcPrefix = "/api/trpc";
  if (!pathname.includes(trpcPrefix)) {
    return null;
  }

  const endpointPath = pathname.substring(pathname.indexOf(trpcPrefix) + trpcPrefix.length).replace(/^\//, "");
  const procedureNames = endpointPath.split(",");

  const store = getStore();
  const currentUserId = 1;
  const results: any[] = [];

  for (let i = 0; i < procedureNames.length; i++) {
    const procedure = procedureNames[i];
    let input: any = undefined;

    if (method === "GET") {
      const rawInput = searchParams.get("input");
      if (rawInput) {
        try {
          const parsed = JSON.parse(rawInput);
          input = parsed[i] ?? parsed;
        } catch {}
      }
    } else {
      input = bodyData?.[i] ?? bodyData;
    }

    let data: any = null;

    switch (procedure) {
      case "auth.me": {
        const user = store.users.find((u) => u.id === currentUserId) || store.users[0];
        data = {
          id: user.id,
          openId: "demo-user",
          name: user.name,
          email: user.email,
          role: "user",
          loginMethod: "oauth",
        };
        break;
      }
      case "auth.logout": {
        data = { success: true };
        break;
      }
      case "social.feed": {
        const filter = input?.json?.filter || input?.filter || "all";
        let list = [...store.posts];
        if (filter === "saved") {
          list = list.filter((p) => p.saved);
        } else if (filter === "trending") {
          list = list.sort((a, b) => b.likes - a.likes);
        }
        data = list;
        break;
      }
      case "social.circles": {
        const followingIds = store.follows
          .filter((f) => f.followerId === currentUserId)
          .map((f) => f.followingId);

        data = store.users
          .filter((u) => u.id !== currentUserId)
          .map((u) => ({
            ...u,
            followed: followingIds.includes(u.id),
          }));
        break;
      }
      case "social.currentProfile": {
        const user = store.users.find((u) => u.id === currentUserId) || store.users[0];
        data = user;
        break;
      }
      case "social.notifications": {
        data = store.notifications;
        break;
      }
      case "social.createPost": {
        const body = input?.json?.body || input?.body || "";
        const imageUrl = input?.json?.imageUrl || input?.imageUrl || null;
        const author = store.users.find((u) => u.id === currentUserId) || store.users[0];
        const newPost: FeedPost = {
          id: Date.now(),
          userId: currentUserId,
          author,
          time: "Just now",
          createdAt: new Date().toISOString(),
          body,
          imageUrl,
          likes: 0,
          comments: 0,
          liked: false,
          saved: false,
          replies: [],
        };
        store.posts.unshift(newPost);
        saveStore(store);
        data = newPost;
        break;
      }
      case "social.addComment": {
        const postId = input?.json?.postId || input?.postId;
        const body = input?.json?.body || input?.body || "";
        const post = store.posts.find((p) => p.id === postId);
        const author = store.users.find((u) => u.id === currentUserId) || store.users[0];
        if (post) {
          const newReply: Reply = {
            id: Date.now(),
            author,
            body,
            time: "Just now",
            createdAt: new Date().toISOString(),
          };
          post.replies.push(newReply);
          post.comments = post.replies.length;
          saveStore(store);
        }
        data = { success: true };
        break;
      }
      case "social.toggleLike": {
        const postId = input?.json?.postId || input?.postId;
        const post = store.posts.find((p) => p.id === postId);
        if (post) {
          post.liked = !post.liked;
          post.likes += post.liked ? 1 : -1;
          saveStore(store);
          data = { liked: post.liked, likes: post.likes };
        } else {
          data = { liked: false, likes: 0 };
        }
        break;
      }
      case "social.toggleSave": {
        const postId = input?.json?.postId || input?.postId;
        const post = store.posts.find((p) => p.id === postId);
        if (post) {
          post.saved = !post.saved;
          saveStore(store);
          data = { saved: post.saved };
        } else {
          data = { saved: false };
        }
        break;
      }
      case "social.toggleFollow": {
        const followingId = input?.json?.followingId || input?.followingId;
        const idx = store.follows.findIndex(
          (f) => f.followerId === currentUserId && f.followingId === followingId
        );
        let following = false;
        if (idx >= 0) {
          store.follows.splice(idx, 1);
          following = false;
        } else {
          store.follows.push({ followerId: currentUserId, followingId });
          following = true;
        }
        saveStore(store);
        data = { following };
        break;
      }
      case "social.updateProfile": {
        const patch = input?.json || input || {};
        const user = store.users.find((u) => u.id === currentUserId);
        if (user) {
          if (patch.name) user.name = patch.name;
          if (patch.handle) user.handle = patch.handle;
          if (patch.bio !== undefined) user.bio = patch.bio;
          if (patch.tone) user.tone = patch.tone;
          user.initials = user.name.slice(0, 2).toUpperCase();
          saveStore(store);
        }
        data = user;
        break;
      }
      case "social.deletePost": {
        const postId = input?.json?.postId || input?.postId;
        store.posts = store.posts.filter((p) => p.id !== postId);
        saveStore(store);
        data = { success: true };
        break;
      }
      case "social.markNotificationsRead": {
        store.notifications.forEach((n) => (n.read = true));
        saveStore(store);
        data = { success: true };
        break;
      }
      default: {
        data = null;
      }
    }

    const serialized = superjson.serialize(data);
    results.push({
      result: {
        data: serialized,
      },
    });
  }

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
