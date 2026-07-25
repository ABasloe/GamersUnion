import type { PlayStatus } from '../types';

export interface CommunityUser {
  name: string;
  joined: string;
  tagline: string;
  favorites: string[]; // game ids, up to 3
  library: { gameId: string; status: PlayStatus; rating: number | null; hours: number | null }[];
}

/** Seeded community members — the authors behind the seeded reviews/posts. */
export const COMMUNITY_USERS: CommunityUser[] = [
  { name: 'TarnishedTom', joined: '2025-11-02', tagline: 'Vigor first. Always vigor first.', favorites: ['elden-ring', 'sekiro', 'hollow-knight'], library: [
    { gameId: 'elden-ring', status: 'played', rating: 10, hours: 312 }, { gameId: 'sekiro', status: 'played', rating: 9, hours: 88 }, { gameId: 'hollow-knight', status: 'played', rating: 9, hours: 64 }, { gameId: 'bg3', status: 'playing', rating: null, hours: 41 } ] },
  { name: 'MaidenlessBehavior', joined: '2025-12-14', tagline: 'I help newbies past Margit on Thursdays.', favorites: ['elden-ring', 'bg3'], library: [
    { gameId: 'elden-ring', status: 'played', rating: 8, hours: 205 }, { gameId: 'bg3', status: 'played', rating: 9, hours: 130 }, { gameId: 'helldivers-2', status: 'playing', rating: null, hours: 55 } ] },
  { name: 'CriticalMissy', joined: '2025-10-21', tagline: 'Karlach did nothing wrong.', favorites: ['bg3', 'disco-elysium', 'outer-wilds'], library: [
    { gameId: 'bg3', status: 'played', rating: 10, hours: 388 }, { gameId: 'disco-elysium', status: 'played', rating: 9, hours: 52 }, { gameId: 'outer-wilds', status: 'played', rating: 10, hours: 30 }, { gameId: 'ff7-rebirth', status: 'want', rating: null, hours: null } ] },
  { name: 'SaveScummer', joined: '2026-01-09', tagline: 'Four unfinished playthroughs and counting.', favorites: ['bg3', 'slay-the-spire'], library: [
    { gameId: 'bg3', status: 'playing', rating: 9, hours: 176 }, { gameId: 'slay-the-spire', status: 'played', rating: 8, hours: 210 }, { gameId: 'balatro', status: 'playing', rating: null, hours: 44 } ] },
  { name: 'NyxEnjoyer', joined: '2026-02-17', tagline: 'Melinoë supremacy.', favorites: ['hades-2', 'celeste'], library: [
    { gameId: 'hades-2', status: 'playing', rating: 9, hours: 95 }, { gameId: 'celeste', status: 'played', rating: 9, hours: 38 } ] },
  { name: 'JunimoJim', joined: '2025-09-30', tagline: 'Year 3 greenhouse consultant.', favorites: ['stardew', 'terraria', 'minecraft'], library: [
    { gameId: 'stardew', status: 'playing', rating: 10, hours: 640 }, { gameId: 'terraria', status: 'played', rating: 9, hours: 320 }, { gameId: 'minecraft', status: 'on-hold', rating: 9, hours: 800 } ] },
  { name: 'PaleKingStan', joined: '2025-11-25', tagline: 'Silksong copium supplier.', favorites: ['hollow-knight', 'animal-well'], library: [
    { gameId: 'hollow-knight', status: 'played', rating: 10, hours: 112 }, { gameId: 'animal-well', status: 'playing', rating: 9, hours: 22 }, { gameId: 'celeste', status: 'played', rating: 8, hours: 25 } ] },
  { name: 'JimboJokers', joined: '2026-03-05', tagline: 'It is legally tomorrow.', favorites: ['balatro', 'slay-the-spire'], library: [
    { gameId: 'balatro', status: 'playing', rating: 9, hours: 260 }, { gameId: 'slay-the-spire', status: 'played', rating: 9, hours: 340 } ] },
  { name: 'NomaiScholar', joined: '2025-08-12', tagline: 'Would erase my memory for one more first playthrough.', favorites: ['outer-wilds', 'disco-elysium', 'animal-well'], library: [
    { gameId: 'outer-wilds', status: 'played', rating: 10, hours: 41 }, { gameId: 'disco-elysium', status: 'played', rating: 9, hours: 60 }, { gameId: 'animal-well', status: 'played', rating: 9, hours: 30 } ] },
  { name: 'ChromeDome', joined: '2026-01-28', tagline: 'Night City tour guide.', favorites: ['cyberpunk', 'ff7-rebirth'], library: [
    { gameId: 'cyberpunk', status: 'played', rating: 8, hours: 145 }, { gameId: 'ff7-rebirth', status: 'playing', rating: null, hours: 33 } ] },
  { name: 'FreshTarnished', joined: '2026-07-01', tagline: 'Still fighting Tree Sentinel. Do not ask.', favorites: ['elden-ring'], library: [
    { gameId: 'elden-ring', status: 'playing', rating: null, hours: 9 } ] },
  { name: 'AnteUpAndy', joined: '2026-04-11', tagline: 'Photograph + Hanging Chad believer.', favorites: ['balatro', 'hades-2'], library: [
    { gameId: 'balatro', status: 'playing', rating: 9, hours: 180 }, { gameId: 'hades-2', status: 'played', rating: 8, hours: 70 } ] },
  { name: 'DemocracyOfficer', joined: '2026-02-02', tagline: 'Mic required. Forgiveness mandatory.', favorites: ['helldivers-2', 'factorio'], library: [
    { gameId: 'helldivers-2', status: 'playing', rating: 9, hours: 220 }, { gameId: 'factorio', status: 'on-hold', rating: 10, hours: 510 } ] },
  { name: 'ParryKing', joined: '2025-12-01', tagline: 'Charmless. Feel nothing. Would repeat.', favorites: ['sekiro', 'elden-ring'], library: [
    { gameId: 'sekiro', status: 'played', rating: 10, hours: 160 }, { gameId: 'elden-ring', status: 'played', rating: 9, hours: 190 } ] },
];

export const getCommunityUser = (name: string) =>
  COMMUNITY_USERS.find((u) => u.name.toLowerCase() === name.toLowerCase());
