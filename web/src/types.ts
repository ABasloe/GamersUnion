export interface Game {
  id: string;
  title: string;
  year: number;
  developer: string;
  platforms: string[];
  tags: string[];
  description: string;
  steamAppId?: number;
  communityRating: number; // 0-10
  ratingsCount: number;
  trendingScore: number;
  cover: { from: string; to: string; emoji: string };
}

export type PlayStatus = 'playing' | 'played' | 'want' | 'dropped' | 'on-hold';

export interface LibraryEntry {
  gameId: string;
  status: PlayStatus;
  rating: number | null; // 1-10
  hoursPlayed: number | null;
  addedAt: string;
  fromSteam?: boolean;
}

export interface Review {
  id: string;
  gameId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  likes: number;
  likedByMe?: boolean;
  isMine?: boolean;
}

export interface ThreadPost {
  id: string;
  author: string;
  text: string;
  date: string;
  isMine?: boolean;
}

export interface Thread {
  id: string;
  gameId: string;
  title: string;
  author: string;
  date: string;
  posts: ThreadPost[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  tags: string[];
  members: number;
  joined: boolean;
  posts: ThreadPost[];
}

export interface SteamConnection {
  steamId: string;
  personaName?: string;
  linkedAt: string;
  lastImport?: { matched: number; unmatched: number; date: string } | null;
}

export interface UbisoftConnection {
  username: string;
  linkedAt: string;
}

export interface Connections {
  steam: SteamConnection | null;
  ubisoft: UbisoftConnection | null;
}

export interface NewsItem {
  id: string;
  title: string;
  blurb: string;
  date: string;
  tag: string;
}
