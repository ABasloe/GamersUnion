/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Connections, Group, LibraryEntry, PlayStatus, Review, Thread } from '../types';
import { SEED_GROUPS, SEED_REVIEWS, SEED_THREADS, STEAM_IMPORT } from '../data/seed';

interface AppState {
  library: LibraryEntry[];
  reviews: Review[];
  threads: Thread[];
  groups: Group[];
  favorites: string[]; // up to 3 game ids
  steamImported: boolean;
  username: string;
  connections: Connections;
}

interface AppActions {
  setStatus: (gameId: string, status: PlayStatus | null) => void;
  setRating: (gameId: string, rating: number | null) => void;
  setHours: (gameId: string, hours: number | null) => void;
  addReview: (gameId: string, rating: number, text: string) => void;
  deleteMyReview: (reviewId: string) => void;
  toggleReviewLike: (reviewId: string) => void;
  createThread: (gameId: string, title: string, text: string) => void;
  replyToThread: (threadId: string, text: string) => void;
  toggleGroupMembership: (groupId: string) => void;
  postToGroup: (groupId: string, text: string) => void;
  toggleFavorite: (gameId: string) => void;
  importSteam: () => void;
  setUsername: (name: string) => void;
  linkSteam: (steamId: string, personaName?: string) => void;
  unlinkSteam: () => void;
  linkUbisoft: (username: string) => void;
  unlinkUbisoft: () => void;
  applySteamLibrary: (items: { gameId: string; hours: number }[], unmatched: number) => void;
}

const STORAGE_KEY = 'gamers-union-state-v1';

const defaultState: AppState = {
  library: [],
  reviews: SEED_REVIEWS,
  threads: SEED_THREADS,
  groups: SEED_GROUPS,
  favorites: [],
  steamImported: false,
  username: 'Player One',
  connections: { steam: null, ubisoft: null },
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...(JSON.parse(raw) as Partial<AppState>) };
  } catch {
    return defaultState;
  }
}

const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10);

const AppContext = createContext<(AppState & AppActions) | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const actions = useMemo<AppActions>(() => {
    const upsertEntry = (gameId: string, patch: Partial<LibraryEntry>) =>
      setState((s) => {
        const existing = s.library.find((e) => e.gameId === gameId);
        const library = existing
          ? s.library.map((e) => (e.gameId === gameId ? { ...e, ...patch } : e))
          : [...s.library, { gameId, status: 'played' as PlayStatus, rating: null, hoursPlayed: null, addedAt: today(), ...patch }];
        return { ...s, library };
      });

    return {
      setStatus: (gameId, status) =>
        status === null
          ? setState((s) => ({
              ...s,
              library: s.library.filter((e) => e.gameId !== gameId),
              favorites: s.favorites.filter((f) => f !== gameId),
            }))
          : upsertEntry(gameId, { status }),
      setRating: (gameId, rating) => upsertEntry(gameId, { rating }),
      setHours: (gameId, hours) => upsertEntry(gameId, { hoursPlayed: hours }),
      addReview: (gameId, rating, text) =>
        setState((s) => ({
          ...s,
          reviews: [
            { id: uid(), gameId, author: s.username, rating, text, date: today(), likes: 0, isMine: true },
            ...s.reviews.filter((r) => !(r.isMine && r.gameId === gameId)),
          ],
        })),
      deleteMyReview: (reviewId) =>
        setState((s) => ({ ...s, reviews: s.reviews.filter((r) => r.id !== reviewId) })),
      toggleReviewLike: (reviewId) =>
        setState((s) => ({
          ...s,
          reviews: s.reviews.map((r) =>
            r.id === reviewId
              ? { ...r, likedByMe: !r.likedByMe, likes: r.likes + (r.likedByMe ? -1 : 1) }
              : r,
          ),
        })),
      createThread: (gameId, title, text) =>
        setState((s) => ({
          ...s,
          threads: [
            {
              id: uid(), gameId, title, author: s.username, date: today(),
              posts: [{ id: uid(), author: s.username, text, date: today(), isMine: true }],
            },
            ...s.threads,
          ],
        })),
      replyToThread: (threadId, text) =>
        setState((s) => ({
          ...s,
          threads: s.threads.map((t) =>
            t.id === threadId
              ? { ...t, posts: [...t.posts, { id: uid(), author: s.username, text, date: today(), isMine: true }] }
              : t,
          ),
        })),
      toggleGroupMembership: (groupId) =>
        setState((s) => ({
          ...s,
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, joined: !g.joined, members: g.members + (g.joined ? -1 : 1) } : g,
          ),
        })),
      postToGroup: (groupId, text) =>
        setState((s) => ({
          ...s,
          groups: s.groups.map((g) =>
            g.id === groupId
              ? { ...g, posts: [...g.posts, { id: uid(), author: s.username, text, date: today(), isMine: true }] }
              : g,
          ),
        })),
      toggleFavorite: (gameId) =>
        setState((s) => {
          if (s.favorites.includes(gameId)) return { ...s, favorites: s.favorites.filter((f) => f !== gameId) };
          if (s.favorites.length >= 3) return s;
          return { ...s, favorites: [...s.favorites, gameId] };
        }),
      importSteam: () =>
        setState((s) => {
          if (s.steamImported) return s;
          let library = [...s.library];
          for (const item of STEAM_IMPORT) {
            const existing = library.find((e) => e.gameId === item.gameId);
            library = existing
              ? library.map((e) => (e.gameId === item.gameId ? { ...e, hoursPlayed: item.hours, fromSteam: true } : e))
              : [...library, { gameId: item.gameId, status: 'played' as PlayStatus, rating: null, hoursPlayed: item.hours, addedAt: today(), fromSteam: true }];
          }
          return { ...s, library, steamImported: true };
        }),
      // Renaming also re-attributes everything you've written, so your
      // identity stays consistent across reviews, threads, and boards.
      setUsername: (name) =>
        setState((s) => ({
          ...s,
          username: name,
          reviews: s.reviews.map((r) => (r.isMine ? { ...r, author: name } : r)),
          threads: s.threads.map((t) => ({
            ...t,
            author: t.posts[0]?.isMine ? name : t.author,
            posts: t.posts.map((p) => (p.isMine ? { ...p, author: name } : p)),
          })),
          groups: s.groups.map((g) => ({
            ...g,
            posts: g.posts.map((p) => (p.isMine ? { ...p, author: name } : p)),
          })),
        })),
      linkSteam: (steamId, personaName) =>
        setState((s) => ({
          ...s,
          connections: {
            ...s.connections,
            steam: { steamId, personaName, linkedAt: today(), lastImport: s.connections.steam?.lastImport ?? null },
          },
        })),
      unlinkSteam: () =>
        setState((s) => ({ ...s, connections: { ...s.connections, steam: null } })),
      linkUbisoft: (username) =>
        setState((s) => ({ ...s, connections: { ...s.connections, ubisoft: { username, linkedAt: today() } } })),
      unlinkUbisoft: () =>
        setState((s) => ({ ...s, connections: { ...s.connections, ubisoft: null } })),
      applySteamLibrary: (items, unmatched) =>
        setState((s) => {
          let library = [...s.library];
          for (const item of items) {
            const existing = library.find((e) => e.gameId === item.gameId);
            library = existing
              ? library.map((e) => (e.gameId === item.gameId ? { ...e, hoursPlayed: item.hours, fromSteam: true } : e))
              : [...library, { gameId: item.gameId, status: 'played' as PlayStatus, rating: null, hoursPlayed: item.hours, addedAt: today(), fromSteam: true }];
          }
          const steam = s.connections.steam
            ? { ...s.connections.steam, lastImport: { matched: items.length, unmatched, date: today() } }
            : s.connections.steam;
          return { ...s, library, steamImported: true, connections: { ...s.connections, steam } };
        }),
    };
  }, []);

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
