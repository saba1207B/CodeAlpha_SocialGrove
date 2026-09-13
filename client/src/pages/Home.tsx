import { useMemo, useRef, useState } from "react";
import {
  Bell,
  Bookmark,
  Check,
  ChevronRight,
  Compass,
  Heart,
  Home as HomeIcon,
  ImagePlus,
  Leaf,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  PenLine,
  Search,
  Send,
  Settings,
  Share2,
  Sparkles,
  Trash2,
  UserCheck,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  isStaticOrGitHubPages,
  getStoredPosts,
  getStoredProfile,
  getStoredCircles,
  getStoredNotifications,
  saveDemoPost,
  toggleDemoLike,
  toggleDemoSave,
  addDemoComment,
  toggleDemoFollow,
  updateDemoProfile,
  deleteDemoPost,
  markDemoNotificationsRead,
} from "@/lib/demoStorage";

type Author = {
  id?: number;
  name: string;
  handle: string;
  initials: string;
  tone: string;
  bio?: string;
  email?: string;
  followed?: boolean;
};

type Reply = {
  id: number;
  author: Author;
  body: string;
  time: string;
  createdAt: string;
};

type Post = {
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

const AVATAR_TONES = [
  { id: "avatar-terracotta", label: "Terracotta", color: "#c65d45" },
  { id: "avatar-olive", label: "Olive", color: "#65715d" },
  { id: "avatar-plum", label: "Plum", color: "#685466" },
  { id: "avatar-sand", label: "Sand", color: "#b99169" },
  { id: "avatar-blue", label: "Blue", color: "#657a85" },
];

function Avatar({ person, size = "md" }: { person: Author; size?: "sm" | "md" | "lg" }) {
  return (
    <div className={`avatar ${person.tone || "avatar-terracotta"} avatar-${size}`}>
      {person.initials || person.name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function EditProfileModal({
  currentUser,
  onClose,
  onSave,
}: {
  currentUser: Author;
  onClose: () => void;
  onSave: (data: { name: string; handle: string; bio: string; tone: string }) => void;
}) {
  const [name, setName] = useState(currentUser.name);
  const [handle, setHandle] = useState(currentUser.handle);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [tone, setTone] = useState(currentUser.tone || "avatar-terracotta");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !handle.trim()) {
      toast.error("Name and handle are required");
      return;
    }
    onSave({ name, handle, bio, tone });
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose} aria-label="Close edit profile">
          <X size={18} />
        </button>
        <p className="eyebrow">Personalize</p>
        <h2 id="edit-profile-title">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="edit-name">Display Name</label>
            <input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-handle">Handle</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">@</span>
              <input
                id="edit-handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="handle"
                maxLength={40}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="edit-bio">Bio</label>
            <textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A few words about what you keep in your grove..."
              rows={3}
              maxLength={200}
            />
            <span className="char-counter">{bio.length}/200</span>
          </div>
          <div className="form-group">
            <label>Avatar Accent Color</label>
            <div className="tone-picker">
              {AVATAR_TONES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className={`tone-swatch ${tone === t.id ? "selected" : ""}`}
                  style={{ backgroundColor: t.color }}
                  onClick={() => setTone(t.id)}
                  aria-label={t.label}
                >
                  {tone === t.id && <Check size={14} color="#fff" />}
                </button>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Save Changes <Check size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PostCard({
  post,
  currentUser,
  onLike,
  onSave,
  onComment,
  onDelete,
  onTagClick,
}: {
  post: Post;
  currentUser: Author;
  onLike: () => void;
  onSave: () => void;
  onComment: (value: string) => void;
  onDelete?: () => void;
  onTagClick?: (tag: string) => void;
}) {
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const submitComment = () => {
    const value = comment.trim();
    if (!value) return;
    onComment(value);
    setComment("");
    setCommentOpen(true);
  };

  const copyPost = () => {
    navigator.clipboard.writeText(`${post.author.name} on Social Grove: "${post.body}"`);
    toast.success("Note copied to clipboard");
    setMenuOpen(false);
  };

  const renderBodyWithTags = (text: string) => {
    const parts = text.split(/(#[a-zA-Z0-9_-]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("#")) {
        return (
          <button
            key={i}
            className="inline-tag"
            onClick={(e) => {
              e.stopPropagation();
              onTagClick?.(part);
            }}
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

  const isAuthor = post.userId === currentUser.id || post.author.handle === currentUser.handle;

  return (
    <article className="post-card fade-up">
      <div className="post-header">
        <div className="post-author">
          <Avatar person={post.author} />
          <div>
            <div className="author-name-row">
              <strong>{post.author.name}</strong>
              <span className="muted">· {post.time}</span>
            </div>
            <span className="handle">@{post.author.handle}</span>
          </div>
        </div>

        <div className="post-menu-wrap">
          <button
            className="icon-button subtle"
            aria-label="More post options"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <MoreHorizontal size={19} />
          </button>
          {menuOpen && (
            <div className="post-menu-dropdown">
              <button onClick={copyPost} className="post-menu-item">
                <Share2 size={14} /> Copy note text
              </button>
              {isAuthor && onDelete && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="post-menu-item danger"
                >
                  <Trash2 size={14} /> Delete note
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="post-body">{renderBodyWithTags(post.body)}</p>

      {post.imageUrl && (
        <img className="post-image" src={post.imageUrl} alt="Attached to note" loading="lazy" />
      )}

      <div className="post-actions">
        <div className="action-group">
          <button
            className={`post-action ${post.liked ? "is-liked" : ""}`}
            onClick={onLike}
            aria-label={post.liked ? "Unlike post" : "Like post"}
          >
            <Heart size={18} fill={post.liked ? "currentColor" : "none"} />
            <span>{post.likes}</span>
          </button>
          <button
            className={`post-action ${commentOpen ? "is-active" : ""}`}
            onClick={() => setCommentOpen((open) => !open)}
            aria-label="Toggle comments"
          >
            <MessageCircle size={18} />
            <span>{post.comments}</span>
          </button>
          <button
            className={`post-action ${post.saved ? "is-saved" : ""}`}
            onClick={onSave}
            aria-label={post.saved ? "Remove bookmark" : "Save note"}
          >
            <Bookmark size={18} fill={post.saved ? "currentColor" : "none"} />
          </button>
        </div>
        <span className="post-meta">
          {post.comments ? `${post.comments} thoughtful ${post.comments === 1 ? "reply" : "replies"}` : "Start the conversation"}
        </span>
      </div>

      {commentOpen && (
        <div className="comment-drawer">
          {post.replies && post.replies.length > 0 ? (
            <div className="replies-list">
              {post.replies.map((reply) => (
                <div className="reply" key={reply.id}>
                  <Avatar person={reply.author} size="sm" />
                  <div className="reply-content">
                    <div className="reply-header">
                      <strong>{reply.author.name}</strong>
                      <span className="reply-time">{reply.time}</span>
                    </div>
                    <p>{reply.body}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-comments-hint">No replies yet. Be the first to reflect.</p>
          )}

          <div className="comment-input-row">
            <Avatar person={currentUser} size="sm" />
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && submitComment()}
              placeholder="Add a thoughtful reply..."
              aria-label="Add a comment"
            />
            <button className="send-button" onClick={submitComment} aria-label="Send comment">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default function Home() {
  const utils = trpc.useUtils();

  const [activeNav, setActiveNav] = useState<"Home" | "Discover" | "Notifications" | "Saved" | "Profile">("Home");
  const [welcomeBannerVisible, setWelcomeBannerVisible] = useState(() => {
    return localStorage.getItem("sg_welcome_dismissed") !== "true";
  });
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [composer, setComposer] = useState("");
  const [composerImage, setComposerImage] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries & Demo State
  const isStaticMode = isStaticOrGitHubPages();
  const [demoTick, setDemoTick] = useState(0);
  const triggerDemoUpdate = () => setDemoTick((t) => t + 1);

  const feedFilter = activeNav === "Saved" ? "saved" : "all";
  const { data: rawPosts, isLoading: feedLoading, isError: feedError } = trpc.social.feed.useQuery(
    { filter: feedFilter },
    { retry: false, enabled: !isStaticMode }
  );
  const { data: rawCircles } = trpc.social.circles.useQuery(
    undefined,
    { retry: false, enabled: !isStaticMode }
  );
  const { data: profile } = trpc.social.currentProfile.useQuery(
    undefined,
    { retry: false, enabled: !isStaticMode }
  );
  const { data: rawNotifications = [] } = trpc.social.notifications.useQuery(
    undefined,
    { retry: false, enabled: !isStaticMode }
  );

  const isDemo = isStaticMode || Boolean(feedError);

  const effectivePosts: Post[] = useMemo(() => {
    if (isDemo) {
      return getStoredPosts(feedFilter);
    }
    return (rawPosts as Post[]) || [];
  }, [isDemo, rawPosts, feedFilter, demoTick]);

  const effectiveCircles = useMemo(() => {
    if (isDemo) {
      return getStoredCircles();
    }
    return rawCircles || [];
  }, [isDemo, rawCircles, demoTick]);

  const notifications = useMemo(() => {
    if (isDemo) {
      return getStoredNotifications().map((n) => ({
        id: n.id,
        type: n.type,
        actor: n.actor,
        text: n.message,
        time: n.time,
        read: n.read,
      }));
    }
    return rawNotifications;
  }, [isDemo, rawNotifications, demoTick]);

  const currentUser: Author = useMemo(() => {
    if (isDemo || !profile) {
      return getStoredProfile();
    }
    return {
      id: profile.id,
      name: profile.name || "Arin Bell",
      handle: profile.handle || "arinbell",
      initials: profile.initials || "AB",
      tone: profile.tone || "avatar-terracotta",
      bio: profile.bio || "Collecting small wonders, useful questions, and reasons to take the scenic route.",
    };
  }, [isDemo, profile, demoTick]);

  // Mutations
  const createPostMutation = trpc.social.createPost.useMutation({
    onSuccess: () => {
      utils.social.feed.invalidate();
      utils.social.currentProfile.invalidate();
      setComposer("");
      setComposerImage(null);
      toast.success("Note posted to the grove");
    },
    onError: (err) => toast.error(err.message || "Failed to post note"),
  });

  const addCommentMutation = trpc.social.addComment.useMutation({
    onSuccess: () => {
      utils.social.feed.invalidate();
      toast.success("Reply added");
    },
  });

  const toggleLikeMutation = trpc.social.toggleLike.useMutation({
    onSuccess: () => utils.social.feed.invalidate(),
  });

  const toggleSaveMutation = trpc.social.toggleSave.useMutation({
    onSuccess: (data) => {
      utils.social.feed.invalidate();
      toast.success(data.saved ? "Saved to your bookmarks" : "Removed from saved notes");
    },
  });

  const toggleFollowMutation = trpc.social.toggleFollow.useMutation({
    onSuccess: (data) => {
      utils.social.circles.invalidate();
      utils.social.currentProfile.invalidate();
      toast.success(data.following ? "Added to your circle" : "Removed from your circle");
    },
  });

  const updateProfileMutation = trpc.social.updateProfile.useMutation({
    onSuccess: () => {
      utils.social.currentProfile.invalidate();
      utils.social.feed.invalidate();
      setEditProfileOpen(false);
      toast.success("Profile updated");
    },
    onError: (err) => toast.error(err.message || "Could not update profile"),
  });

  const deletePostMutation = trpc.social.deletePost.useMutation({
    onSuccess: () => {
      utils.social.feed.invalidate();
      utils.social.currentProfile.invalidate();
      toast.success("Note removed");
    },
    onError: (err) => toast.error(err.message || "Could not delete note"),
  });

  const markNotificationsReadMutation = trpc.social.markNotificationsRead.useMutation({
    onSuccess: () => utils.social.notifications.invalidate(),
  });

  // Action Dispatchers (supports both Demo mode and Backend mode)
  const handleLike = (postId: number) => {
    if (isDemo) {
      toggleDemoLike(postId);
      triggerDemoUpdate();
      return;
    }
    toggleLikeMutation.mutate({ postId });
  };

  const handleSave = (postId: number) => {
    if (isDemo) {
      const res = toggleDemoSave(postId);
      triggerDemoUpdate();
      toast.success(res.saved ? "Saved to your bookmarks" : "Removed from saved notes");
      return;
    }
    toggleSaveMutation.mutate({ postId });
  };

  const handleComment = (postId: number, val: string) => {
    if (isDemo) {
      addDemoComment(postId, val);
      triggerDemoUpdate();
      toast.success("Reply added");
      return;
    }
    addCommentMutation.mutate({ postId, body: val });
  };

  const handleDelete = (postId: number) => {
    if (isDemo) {
      deleteDemoPost(postId);
      triggerDemoUpdate();
      toast.success("Note removed");
      return;
    }
    deletePostMutation.mutate({ postId });
  };

  const handleFollow = (followingId?: number, handle?: string) => {
    if (isDemo && handle) {
      const res = toggleDemoFollow(handle);
      triggerDemoUpdate();
      toast.success(res.following ? "Added to your circle" : "Removed from your circle");
      return;
    }
    if (followingId) {
      toggleFollowMutation.mutate({ followingId });
    }
  };

  const handleUpdateProfile = (data: any) => {
    if (isDemo) {
      updateDemoProfile(data);
      triggerDemoUpdate();
      setEditProfileOpen(false);
      toast.success("Profile updated");
      return;
    }
    updateProfileMutation.mutate(data);
  };

  const handleMarkNotificationsRead = () => {
    if (isDemo) {
      markDemoNotificationsRead();
      triggerDemoUpdate();
      return;
    }
    markNotificationsReadMutation.mutate();
  };

  // Photo attachment handling
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setComposerImage(dataUrl);
      toast.success("Photo attached");
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setComposerImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Filtered posts
  const visiblePosts = useMemo(() => {
    let result = effectivePosts;

    if (selectedTag) {
      result = result.filter((post) => post.body.toLowerCase().includes(selectedTag.toLowerCase()));
    }

    const normalizedSearch = search.trim().toLowerCase();
    if (normalizedSearch) {
      result = result.filter(
        (post) =>
          post.body.toLowerCase().includes(normalizedSearch) ||
          post.author.name.toLowerCase().includes(normalizedSearch) ||
          post.author.handle.toLowerCase().includes(normalizedSearch)
      );
    }

    return result;
  }, [effectivePosts, selectedTag, search]);

  const handleCreatePost = () => {
    if (!composer.trim() && !composerImage) {
      toast.error("Please write something or attach a photo");
      return;
    }
    const bodyText = composer.trim() || (composerImage ? "Shared a moment in the grove." : "");
    if (isDemo) {
      saveDemoPost({ body: bodyText, imageUrl: composerImage });
      setComposer("");
      setComposerImage(null);
      triggerDemoUpdate();
      toast.success("Note posted to the grove");
      return;
    }
    createPostMutation.mutate({
      body: bodyText,
      imageUrl: composerImage || undefined,
    });
  };

  const dismissWelcomeBanner = () => {
    setWelcomeBannerVisible(false);
    localStorage.setItem("sg_welcome_dismissed", "true");
  };

  const navItems = [
    { label: "Home", icon: HomeIcon, key: "Home" as const },
    { label: "Discover", icon: Compass, key: "Discover" as const },
    {
      label: "Notifications",
      icon: Bell,
      key: "Notifications" as const,
      badge: notifications.filter((n) => !n.read).length ? `${notifications.filter((n) => !n.read).length}` : undefined,
    },
    { label: "Saved", icon: Bookmark, key: "Saved" as const },
    { label: "Profile", icon: UserRound, key: "Profile" as const },
  ];

  const trendingTags = [
    { tag: "#slowmornings", count: "248 notes" },
    { tag: "#madebyhand", count: "189 notes" },
    { tag: "#smalljoys", count: "164 notes" },
    { tag: "#quietplaces", count: "98 notes" },
  ];

  return (
    <div className="app-shell">
      {editProfileOpen && (
        <EditProfileModal
          currentUser={currentUser}
          onClose={() => setEditProfileOpen(false)}
          onSave={handleUpdateProfile}
        />
      )}

      {/* Hidden file input for photo attachments */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoSelect}
        accept="image/*"
        style={{ display: "none" }}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand" onClick={() => { setActiveNav("Home"); setSelectedTag(null); }}>
          <span className="brand-mark"><Leaf size={18} /></span>
          <span>social<span className="brand-accent">grove</span></span>
        </div>

        <div className="sidebar-label">Your space</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon, badge, key }) => (
            <button
              className={`nav-item ${activeNav === key ? "active" : ""}`}
              key={label}
              onClick={() => {
                setActiveNav(key);
                if (key === "Notifications") {
                  handleMarkNotificationsRead();
                }
              }}
            >
              <Icon size={19} strokeWidth={activeNav === key ? 2.3 : 1.8} />
              <span>{label}</span>
              {badge && <b>{badge}</b>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-label">Make something</div>
          <button
            className="create-link"
            onClick={() => {
              setActiveNav("Home");
              setTimeout(() => document.getElementById("composer")?.focus(), 50);
            }}
          >
            <PenLine size={17} />
            <span>Write a note</span>
            <span className="shortcut">N</span>
          </button>
          <div className="mini-profile" onClick={() => setActiveNav("Profile")} role="button" tabIndex={0}>
            <Avatar person={currentUser} size="sm" />
            <div>
              <strong>{currentUser.name}</strong>
              <span>@{currentUser.handle}</span>
            </div>
            <Settings size={15} className="muted" />
          </div>
        </div>
      </aside>

      {/* Content Column */}
      <main className="content-column">
        <header className="topbar">
          <div className="mobile-brand" onClick={() => setActiveNav("Home")}>
            <span className="brand-mark"><Leaf size={16} /></span>
            social<span className="brand-accent">grove</span>
          </div>
          <div className="topbar-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notes, people, tags..."
              aria-label="Search posts"
            />
            {search && (
              <button className="icon-button subtle" onClick={() => setSearch("")} aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            className="mobile-avatar-button"
            onClick={() => setActiveNav("Profile")}
            aria-label="Open profile"
          >
            <Avatar person={currentUser} size="sm" />
          </button>
        </header>

        {/* VIEW: Profile */}
        {activeNav === "Profile" && (
          <section className="profile-view fade-up">
            <div className="profile-cover" />
            <div className="profile-main">
              <div className="profile-avatar-wrap">
                <Avatar person={currentUser} size="lg" />
              </div>
              <div className="profile-heading-row">
                <div>
                  <h1>{currentUser.name}</h1>
                  <p>@{currentUser.handle}</p>
                </div>
                <button className="secondary-button" onClick={() => setEditProfileOpen(true)}>
                  <Settings size={15} /> Edit profile
                </button>
              </div>
              <p className="profile-bio">{currentUser.bio}</p>
              <div className="profile-stats">
                <div>
                  <strong>{profile?.notesCount ?? effectivePosts.filter((p) => p.userId === currentUser.id || p.author.handle === currentUser.handle).length}</strong>
                  <span>notes</span>
                </div>
                <div>
                  <strong>{profile?.followingCount ?? effectiveCircles.filter((c: any) => c.followed).length}</strong>
                  <span>following</span>
                </div>
                <div>
                  <strong>{profile?.followersCount ?? 42}</strong>
                  <span>followers</span>
                </div>
              </div>

              <div className="profile-divider" />
              <p className="eyebrow">Your notes in the grove</p>
              <div className="profile-feed-list">
                {((profile?.notes && profile.notes.length > 0) ? profile.notes : effectivePosts.filter((p) => p.userId === currentUser.id || p.author.handle === currentUser.handle)).length > 0 ? (
                  ((profile?.notes && profile.notes.length > 0) ? profile.notes : effectivePosts.filter((p) => p.userId === currentUser.id || p.author.handle === currentUser.handle)).map((post: any) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={currentUser}
                      onLike={() => handleLike(post.id)}
                      onSave={() => handleSave(post.id)}
                      onComment={(val) => handleComment(post.id, val)}
                      onDelete={() => handleDelete(post.id)}
                      onTagClick={(t) => { setSelectedTag(t); setActiveNav("Home"); }}
                    />
                  ))
                ) : (
                  <div className="empty-state">
                    <PenLine size={24} />
                    <strong>No notes written yet</strong>
                    <span>Use the composer on the home feed to plant your first idea.</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* VIEW: Notifications */}
        {activeNav === "Notifications" && (
          <section className="notifications-view fade-up">
            <div className="view-header">
              <div>
                <p className="eyebrow">Circle Activity</p>
                <h2>Notifications</h2>
              </div>
              <button
                className="secondary-button subtle-btn"
                onClick={handleMarkNotificationsRead}
              >
                Mark all as read
              </button>
            </div>

            <div className="notifications-list">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div className={`notification-item ${!n.read ? "unread" : ""}`} key={n.id}>
                    <div className="notification-icon-badge">
                      {n.type === "like" && <Heart size={14} className="icon-like" fill="currentColor" />}
                      {n.type === "comment" && <MessageCircle size={14} className="icon-comment" />}
                      {n.type === "follow" && <UserPlus size={14} className="icon-follow" />}
                    </div>
                    <Avatar person={n.actor} size="sm" />
                    <div className="notification-content">
                      <p>{n.text}</p>
                      <span className="notification-time">{n.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Bell size={24} />
                  <strong>All quiet for now</strong>
                  <span>When someone in the grove interacts with your notes, it will appear here.</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* VIEW: Discover */}
        {activeNav === "Discover" && (
          <section className="discover-view fade-up">
            <div className="view-header">
              <div>
                <p className="eyebrow">Explore</p>
                <h2>Discover the Grove</h2>
                <p className="welcome-copy">Wander through quiet thoughts, slow mornings, and craft.</p>
              </div>
            </div>

            <div className="discover-tags-grid">
              {trendingTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  className="discover-tag-card"
                  onClick={() => {
                    setSelectedTag(tag);
                    setActiveNav("Home");
                  }}
                >
                  <Compass size={16} />
                  <div>
                    <strong>{tag}</strong>
                    <span>{count}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="feed-heading">
              <div>
                <p className="eyebrow">Community Notes</p>
                <h2>Trending notes</h2>
              </div>
            </div>

            <div className="feed-list">
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onLike={() => handleLike(post.id)}
                  onSave={() => handleSave(post.id)}
                  onComment={(val) => handleComment(post.id, val)}
                  onDelete={() => handleDelete(post.id)}
                  onTagClick={(t) => { setSelectedTag(t); setActiveNav("Home"); }}
                />
              ))}
            </div>
          </section>
        )}

        {/* VIEW: Saved */}
        {activeNav === "Saved" && (
          <section className="saved-view fade-up">
            <div className="view-header">
              <div>
                <p className="eyebrow">Your Sanctuary</p>
                <h2>Saved Notes</h2>
                <p className="welcome-copy">Reflections and artwork you chose to keep close.</p>
              </div>
            </div>

            <div className="feed-list">
              {visiblePosts.length > 0 ? (
                visiblePosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onLike={() => handleLike(post.id)}
                    onSave={() => handleSave(post.id)}
                    onComment={(val) => handleComment(post.id, val)}
                    onDelete={() => handleDelete(post.id)}
                    onTagClick={(t) => { setSelectedTag(t); setActiveNav("Home"); }}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <Bookmark size={24} />
                  <strong>No saved notes yet</strong>
                  <span>Click the bookmark icon on any note in the grove to save it here for later.</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* VIEW: Home Feed */}
        {activeNav === "Home" && (
          <>
            {welcomeBannerVisible && (
              <section className="welcome-block">
                <div>
                  <p className="eyebrow">Welcome to the Grove</p>
                  <h1>Good day, {currentUser.name.split(" ")[0]}<span className="headline-dot">.</span></h1>
                  <p className="welcome-copy">A gentle corner of the internet for ideas worth keeping.</p>
                </div>
                <button
                  className="icon-button welcome-dismiss"
                  onClick={dismissWelcomeBanner}
                  aria-label="Dismiss welcome banner"
                >
                  <X size={16} />
                </button>
              </section>
            )}

            {/* Composer */}
            <section className="composer-card">
              <div className="composer-top">
                <Avatar person={currentUser} />
                <div className="composer-context">
                  <strong>Share something with your circle</strong>
                  <span>Public · Everyone in the grove</span>
                </div>
              </div>

              <textarea
                id="composer"
                value={composer}
                onChange={(event) => setComposer(event.target.value)}
                placeholder="What is on your mind? Share a thought, quote, or morning note..."
                rows={3}
              />

              {composerImage && (
                <div className="composer-image-preview">
                  <img src={composerImage} alt="Attached preview" />
                  <button className="remove-photo-btn" onClick={removePhoto} aria-label="Remove photo">
                    <X size={14} /> Remove photo
                  </button>
                </div>
              )}

              <div className="composer-footer">
                <button
                  className="attachment-button"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus size={18} />
                  <span>{composerImage ? "Change photo" : "Add a photo"}</span>
                </button>
                <button
                  className="primary-button"
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <span>Share note</span>
                      <Send size={15} />
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Active Tag Filter Chip */}
            {selectedTag && (
              <div className="active-tag-banner fade-up">
                <span className="tag-pill">
                  <Compass size={14} /> Showing notes tagged <strong>{selectedTag}</strong>
                </span>
                <button
                  className="clear-filter-button"
                  onClick={() => setSelectedTag(null)}
                  aria-label="Clear tag filter"
                >
                  Clear filter <X size={13} />
                </button>
              </div>
            )}

            {/* Feed Section */}
            <div className="feed-heading">
              <div>
                <p className="eyebrow">The latest</p>
                <h2>From your circle</h2>
              </div>
              <button
                className="filter-button"
                onClick={() => {
                  setSelectedTag(null);
                  setSearch("");
                }}
              >
                All notes <ChevronRight size={15} />
              </button>
            </div>

            <div className="feed-list">
              {feedLoading ? (
                <div className="empty-state">
                  <Loader2 size={24} className="animate-spin" />
                  <span>Gathering notes from the grove...</span>
                </div>
              ) : visiblePosts.length ? (
                visiblePosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onLike={() => handleLike(post.id)}
                    onSave={() => handleSave(post.id)}
                    onComment={(value) => handleComment(post.id, value)}
                    onDelete={() => handleDelete(post.id)}
                    onTagClick={(t) => setSelectedTag(t)}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <Search size={22} />
                  <strong>No notes found</strong>
                  <span>Try a different keyword or hashtag search.</span>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Right Rail */}
      <aside className="right-rail">
        <section className="rail-card circle-card">
          <div className="rail-heading">
            <div>
              <p className="eyebrow">People to follow</p>
              <h3>Your circle</h3>
            </div>
            <Users size={20} />
          </div>
          <div className="circle-list">
            {effectiveCircles.map((person) => (
              <div className="circle-person" key={person.id || person.handle}>
                <Avatar person={person} size="sm" />
                <div className="circle-info">
                  <strong>{person.name}</strong>
                  <span>@{person.handle}</span>
                </div>
                <button
                  className={`follow-button ${person.followed ? "following" : ""}`}
                  onClick={() => handleFollow(person.id, person.handle)}
                  aria-label={person.followed ? `Unfollow ${person.name}` : `Follow ${person.name}`}
                >
                  {person.followed ? (
                    <>
                      <UserCheck size={12} /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus size={12} /> Follow
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rail-card trends-card">
          <div className="rail-heading">
            <div>
              <p className="eyebrow">A little momentum</p>
              <h3>Trending today</h3>
            </div>
            <Compass size={20} />
          </div>
          <div className="trend-list">
            {trendingTags.map(({ tag, count }, idx) => (
              <button
                key={tag}
                className={`trend-item-btn ${selectedTag === tag ? "active" : ""}`}
                onClick={() => {
                  setSelectedTag(selectedTag === tag ? null : tag);
                  setActiveNav("Home");
                }}
              >
                <span>0{idx + 1}</span>
                <div className="trend-details">
                  <strong>{tag}</strong>
                  <small>{count}</small>
                </div>
                <ChevronRight size={14} className="trend-arrow" />
              </button>
            ))}
          </div>
        </section>

        <section className="rail-quote">
          <div className="quote-line" />
          <p>“The internet can feel like a neighborhood again.”</p>
          <span>— a note from the grove</span>
        </section>

        <footer className="rail-footer">
          About · Guidelines · Privacy
          <br />
          <span>© 2026 Social Grove</span>
        </footer>
      </aside>
    </div>
  );
}
