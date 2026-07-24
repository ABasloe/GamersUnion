import { GAMES } from '../data/games';
import type { Game, LibraryEntry } from '../types';

export interface Recommendation {
  game: Game;
  score: number; // 0-100
  matchedTags: string[];
}

/**
 * Tag-based similarity: builds a weighted tag profile from the user's library
 * (rating-weighted; unrated entries count as a mild positive) and scores every
 * game the user doesn't already have by tag overlap, blended with community rating.
 */
export function getRecommendations(library: LibraryEntry[], favorites: string[]): Recommendation[] {
  const owned = new Set(library.map((e) => e.gameId));
  const tagWeights = new Map<string, number>();

  const addTags = (gameId: string, weight: number) => {
    const game = GAMES.find((g) => g.id === gameId);
    if (!game) return;
    for (const tag of game.tags) tagWeights.set(tag, (tagWeights.get(tag) ?? 0) + weight);
  };

  for (const entry of library) {
    const weight = entry.rating != null ? (entry.rating - 5) / 5 : 0.3; // -0.8..1, dislikes push tags negative
    addTags(entry.gameId, weight);
  }
  for (const fav of favorites) addTags(fav, 1);

  if (tagWeights.size === 0) return [];

  const maxWeight = Math.max(...[...tagWeights.values()].map(Math.abs), 1);

  const recs: Recommendation[] = GAMES.filter((g) => !owned.has(g.id)).map((game) => {
    let raw = 0;
    const matchedTags: string[] = [];
    for (const tag of game.tags) {
      const w = tagWeights.get(tag);
      if (w !== undefined) {
        raw += w / maxWeight;
        if (w > 0) matchedTags.push(tag);
      }
    }
    const tagScore = Math.max(0, Math.min(1, raw / game.tags.length + 0.5)) * 0.75;
    const qualityScore = (game.communityRating / 10) * 0.25;
    return { game, score: Math.round((tagScore + qualityScore) * 100), matchedTags };
  });

  return recs.filter((r) => r.matchedTags.length > 0).sort((a, b) => b.score - a.score);
}
