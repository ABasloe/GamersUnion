import type { Group, NewsItem, Review, Thread } from '../types';

export const NEWS: NewsItem[] = [
  { id: 'n1', title: 'Hades II leaves Early Access with the Unseen Update', blurb: 'Supergiant ships the final act, a new weapon aspect system, and a fully voiced true ending.', date: '2026-07-21', tag: 'Release' },
  { id: 'n2', title: "Baldur's Gate 3 Patch 9 adds cross-platform mod sync", blurb: 'Larian keeps giving. Console players finally get parity with PC mod support.', date: '2026-07-19', tag: 'Update' },
  { id: 'n3', title: 'Summer Games Fest breaks viewership records', blurb: 'Over 40 world premieres, including a shadow-dropped Metroidvania that is already trending here.', date: '2026-07-15', tag: 'Event' },
  { id: 'n4', title: 'Steam Summer Sale enters final week', blurb: 'Backlogs everywhere brace for impact. Our community "want to play" lists grew 34% overnight.', date: '2026-07-12', tag: 'Sale' },
  { id: 'n5', title: 'FromSoftware teases next project with 20-second trailer', blurb: 'The internet has already produced 400 hours of lore analysis from a single foggy doorway.', date: '2026-07-10', tag: 'Announcement' },
];

export const SEED_REVIEWS: Review[] = [
  { id: 'r1', gameId: 'elden-ring', author: 'TarnishedTom', rating: 10, text: 'Put 300 hours in and still finding new dungeons. The open world design ruined every other open world for me.', date: '2026-06-30', likes: 214 },
  { id: 'r2', gameId: 'elden-ring', author: 'MaidenlessBehavior', rating: 8, text: 'Masterpiece, but the last third recycles bosses a bit. Still cried when I beat Malenia after 6 hours.', date: '2026-07-02', likes: 98 },
  { id: 'r3', gameId: 'bg3', author: 'CriticalMissy', rating: 10, text: 'Act 3 alone has more reactivity than most full games. Karlach is the best companion ever written.', date: '2026-07-05', likes: 331 },
  { id: 'r4', gameId: 'bg3', author: 'SaveScummer', rating: 9, text: 'I have 4 unfinished playthroughs because I keep restarting to try new builds. Send help.', date: '2026-07-11', likes: 156 },
  { id: 'r5', gameId: 'hades-2', author: 'NyxEnjoyer', rating: 9, text: 'The sequel is bigger and moodier. Melinoë might be a better protagonist than Zagreus, don\'t @ me.', date: '2026-07-18', likes: 87 },
  { id: 'r6', gameId: 'stardew', author: 'JunimoJim', rating: 10, text: 'The most comforting game ever made. 1.6 update turned a 10/10 into an 11/10.', date: '2026-05-20', likes: 402 },
  { id: 'r7', gameId: 'hollow-knight', author: 'PaleKingStan', rating: 10, text: 'Bought it for $15, got 60 hours of the best metroidvania ever. Silksong copium levels remain critical.', date: '2026-06-14', likes: 267 },
  { id: 'r8', gameId: 'balatro', author: 'JimboJokers', rating: 9, text: 'I told myself "one more run" at 11pm. It is now legally tomorrow. Do not buy this on mobile.', date: '2026-07-14', likes: 189 },
  { id: 'r9', gameId: 'outer-wilds', author: 'NomaiScholar', rating: 10, text: 'The only game I would erase my memory to play again. Go in blind. Trust me.', date: '2026-04-22', likes: 512 },
  { id: 'r10', gameId: 'cyberpunk', author: 'ChromeDome', rating: 8, text: 'Redemption arc complete. Phantom Liberty is some of the best content CDPR has ever made.', date: '2026-06-08', likes: 143 },
];

export const SEED_THREADS: Thread[] = [
  {
    id: 't1', gameId: 'elden-ring', title: 'Best build for a first playthrough?', author: 'FreshTarnished', date: '2026-07-15',
    posts: [
      { id: 'p1', author: 'FreshTarnished', text: 'Just started, getting destroyed by the Tree Sentinel. What should I be building toward?', date: '2026-07-15' },
      { id: 'p2', author: 'MaidenlessBehavior', text: 'Vagabond into quality build is the classic. Also: you\'re not supposed to fight Tree Sentinel first, ride past him lol.', date: '2026-07-15' },
      { id: 'p3', author: 'TarnishedTom', text: 'Grab the Flask of Wondrous Physick early and level Vigor. Everyone skips Vigor and regrets it.', date: '2026-07-16' },
    ],
  },
  {
    id: 't2', gameId: 'bg3', title: 'Act 2 spoilers — that Shadowfell choice', author: 'CriticalMissy', date: '2026-07-10',
    posts: [
      { id: 'p4', author: 'CriticalMissy', text: 'I cannot believe the game let me do that. Larian really said "every choice is canon."', date: '2026-07-10' },
      { id: 'p5', author: 'SaveScummer', text: 'I quicksaved before it and tried all four outcomes. All of them hurt.', date: '2026-07-11' },
    ],
  },
  {
    id: 't3', gameId: 'balatro', title: 'Flush builds are secretly overrated', author: 'JimboJokers', date: '2026-07-17',
    posts: [
      { id: 'p6', author: 'JimboJokers', text: 'Hear me out: past gold stake, pairs scale way harder with the right jokers.', date: '2026-07-17' },
      { id: 'p7', author: 'AnteUpAndy', text: 'This is heresy but you might be right. Photograph + Hanging Chad carried my last win.', date: '2026-07-18' },
    ],
  },
  {
    id: 't4', gameId: 'helldivers-2', title: 'LFG: Super Helldive squad, weeknights EST', author: 'DemocracyOfficer', date: '2026-07-20',
    posts: [
      { id: 'p8', author: 'DemocracyOfficer', text: 'Need 2 more for difficulty 10 bug missions. Mic required, friendly fire forgiveness mandatory.', date: '2026-07-20' },
    ],
  },
];

export const SEED_GROUPS: Group[] = [
  {
    id: 'g1', name: 'Souls-like Support Group', description: 'For those who die a lot and pretend it\'s fun (it is). Boss help, build talk, and co-op signups.', tags: ['Souls-like', 'Difficult', 'Action'], members: 4821, joined: false,
    posts: [
      { id: 'gp1', author: 'MaidenlessBehavior', text: 'Weekly co-op night is Thursday. This week: helping newbies past Margit.', date: '2026-07-18' },
      { id: 'gp2', author: 'ParryKing', text: 'Sekiro charmless run complete. I feel nothing and everything at once.', date: '2026-07-19' },
    ],
  },
  {
    id: 'g2', name: 'Cozy Corner', description: 'Farming sims, relaxing games, and zero discourse. Screenshot your farms and be nice.', tags: ['Relaxing', 'Farming Sim', 'Indie'], members: 7203, joined: false,
    posts: [
      { id: 'gp3', author: 'JunimoJim', text: 'Year 3 greenhouse layout — full ancient fruit, 8 iridium sprinklers. AMA.', date: '2026-07-17' },
    ],
  },
  {
    id: 'g3', name: 'Roguelike Runners', description: 'One more run. Balatro, Hades, Spire, and everything procedurally generated.', tags: ['Roguelike', 'Card Game', 'Indie'], members: 3544, joined: false,
    posts: [
      { id: 'gp4', author: 'AnteUpAndy', text: 'Community challenge: Hades II, no death defiance, Fear 16. Post your clears.', date: '2026-07-20' },
    ],
  },
  {
    id: 'g4', name: 'Co-op Crew Finder', description: 'Find friends for Helldivers, BG3 honor mode, Terraria worlds and more. Post your timezone!', tags: ['Co-op', 'Multiplayer', 'Shooter'], members: 6110, joined: false,
    posts: [
      { id: 'gp5', author: 'DemocracyOfficer', text: 'Helldivers weeknight squad has 2 open slots — see the game discussion board to sign up.', date: '2026-07-20' },
    ],
  },
  {
    id: 'g5', name: 'Story Rich Book Club', description: 'We play one narrative game a month and discuss it like literature. July: Disco Elysium.', tags: ['Story Rich', 'RPG', 'Detective'], members: 2189, joined: false,
    posts: [
      { id: 'gp6', author: 'NomaiScholar', text: 'July discussion thread: is Harry a good detective, or just a lucky disaster?', date: '2026-07-19' },
    ],
  },
];

export const STEAM_IMPORT: { gameId: string; hours: number }[] = [
  { gameId: 'elden-ring', hours: 187 },
  { gameId: 'balatro', hours: 96 },
  { gameId: 'factorio', hours: 412 },
  { gameId: 'helldivers-2', hours: 63 },
  { gameId: 'terraria', hours: 234 },
  { gameId: 'slay-the-spire', hours: 158 },
];
