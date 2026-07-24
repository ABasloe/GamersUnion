import type { Express, Request, Response } from 'express';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Supporter rewards: watching ads earns raffle tickets (for Steam-key
 * giveaways we fund manually) and points (redeemable for gift cards and
 * account badges). Supporters are identified by an anonymous client-generated
 * id — no accounts required. Gift-card/key fulfillment is manual for now:
 * redemptions and raffle draws are recorded server-side for the operator.
 */

const TICKETS_PER_COMPLETE = 1;
const POINTS_PER_COMPLETE = 10;

export const GIVEAWAYS = [
  {
    id: 'weekly-indie',
    title: 'Weekly indie key raffle',
    prize: 'A random indie Steam key (Balatro, Animal Well, Celeste tier)',
    endsAt: '2026-07-30',
  },
  {
    id: 'monthly-headliner',
    title: 'Monthly headliner raffle',
    prize: 'One big-release Steam key, winner picks from the month\'s pool',
    endsAt: '2026-08-15',
  },
];

export const CATALOG = [
  { id: 'badge-first-light', kind: 'badge', title: 'First Light badge', description: 'Marks the earliest supporters.', cost: 50 },
  { id: 'badge-ember-patron', kind: 'badge', title: 'Ember Patron badge', description: 'You kept a fire burning.', cost: 200 },
  { id: 'badge-keeper', kind: 'badge', title: 'Keeper of the Flame badge', description: 'Reserved for relentless supporters.', cost: 750 },
  { id: 'giftcard-5', kind: 'giftcard', title: '$5 Steam gift card', description: 'Fulfilled manually within a few days.', cost: 5000 },
  { id: 'giftcard-20', kind: 'giftcard', title: '$20 Steam gift card', description: 'Fulfilled manually within a few days.', cost: 18000 },
];

interface Supporter {
  points: number;
  tickets: number;
  badges: string[];
  entries: Record<string, number>;
  redemptions: { itemId: string; at: string; status: 'granted' | 'pending' }[];
}

interface RewardsData {
  supporters: Record<string, Supporter>;
}

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const REWARDS_FILE = path.join(DATA_DIR, 'rewards.json');

let data: RewardsData = { supporters: {} };
let loaded = false;
let persistQueue: Promise<void> = Promise.resolve();

async function load() {
  if (loaded) return;
  try {
    data = JSON.parse(await fs.readFile(REWARDS_FILE, 'utf8')) as RewardsData;
  } catch {
    data = { supporters: {} };
  }
  loaded = true;
}

function persist() {
  persistQueue = persistQueue
    .then(async () => {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(REWARDS_FILE, JSON.stringify(data, null, 2));
    })
    .catch((err) => console.error('Failed to persist rewards:', err));
}

const SUPPORTER_ID = /^[a-z0-9-]{8,64}$/;

function getSupporter(id: string): Supporter {
  let s = data.supporters[id];
  if (!s) {
    s = { points: 0, tickets: 0, badges: [], entries: {}, redemptions: [] };
    data.supporters[id] = s;
  }
  return s;
}

function publicState(s: Supporter) {
  return { points: s.points, tickets: s.tickets, badges: s.badges, entries: s.entries, redemptions: s.redemptions };
}

/** Called from the ads route when a completed view carries a supporter id. */
export async function awardAdComplete(supporterId: unknown): Promise<void> {
  if (typeof supporterId !== 'string' || !SUPPORTER_ID.test(supporterId)) return;
  await load();
  const s = getSupporter(supporterId);
  s.tickets += TICKETS_PER_COMPLETE;
  s.points += POINTS_PER_COMPLETE;
  persist();
}

export function registerRewards(app: Express) {
  const withSupporter = async (req: Request, res: Response): Promise<Supporter | null> => {
    const id = (req.params.supporterId ?? (req.body as { supporterId?: string } | undefined)?.supporterId) as
      | string
      | undefined;
    if (!id || !SUPPORTER_ID.test(id)) {
      res.status(400).json({ error: 'invalid_supporter_id', message: 'supporterId must be 8-64 chars of a-z, 0-9, dashes.' });
      return null;
    }
    await load();
    return getSupporter(id);
  };

  app.get('/api/rewards/config', async (_req, res) => {
    await load();
    res.json({
      giveaways: GIVEAWAYS,
      catalog: CATALOG,
      earning: { ticketsPerAd: TICKETS_PER_COMPLETE, pointsPerAd: POINTS_PER_COMPLETE },
    });
  });

  app.get('/api/rewards/state/:supporterId', async (req, res) => {
    const s = await withSupporter(req, res);
    if (!s) return;
    persist();
    res.json(publicState(s));
  });

  app.post('/api/rewards/giveaways/:giveawayId/enter', async (req, res) => {
    const s = await withSupporter(req, res);
    if (!s) return;
    const { giveawayId } = req.params;
    const giveaway = GIVEAWAYS.find((g) => g.id === giveawayId);
    if (!giveaway) {
      res.status(404).json({ error: 'unknown_giveaway' });
      return;
    }
    const tickets = Number((req.body as { tickets?: number } | undefined)?.tickets ?? 1);
    if (!Number.isInteger(tickets) || tickets < 1) {
      res.status(400).json({ error: 'invalid_tickets', message: 'tickets must be a positive whole number.' });
      return;
    }
    if (s.tickets < tickets) {
      res.status(409).json({ error: 'not_enough_tickets', message: `You have ${s.tickets} ticket(s).` });
      return;
    }
    s.tickets -= tickets;
    s.entries[giveawayId] = (s.entries[giveawayId] ?? 0) + tickets;
    persist();
    res.json(publicState(s));
  });

  app.post('/api/rewards/redeem', async (req, res) => {
    const s = await withSupporter(req, res);
    if (!s) return;
    const itemId = (req.body as { itemId?: string } | undefined)?.itemId;
    const item = CATALOG.find((c) => c.id === itemId);
    if (!item) {
      res.status(404).json({ error: 'unknown_item' });
      return;
    }
    if (item.kind === 'badge' && s.badges.includes(item.id)) {
      res.status(409).json({ error: 'already_owned', message: 'You already have this badge.' });
      return;
    }
    if (s.points < item.cost) {
      res.status(409).json({ error: 'not_enough_points', message: `Costs ${item.cost}, you have ${s.points}.` });
      return;
    }
    s.points -= item.cost;
    if (item.kind === 'badge') {
      s.badges.push(item.id);
      s.redemptions.push({ itemId: item.id, at: new Date().toISOString(), status: 'granted' });
    } else {
      s.redemptions.push({ itemId: item.id, at: new Date().toISOString(), status: 'pending' });
    }
    persist();
    res.json(publicState(s));
  });
}
