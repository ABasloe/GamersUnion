import type { PlayStatus } from '../types';

export const STATUS_LABELS: Record<PlayStatus, string> = {
  playing: 'Playing',
  played: 'Played',
  want: 'Want to Play',
  'on-hold': 'On Hold',
  dropped: 'Dropped',
};

export const STATUS_ORDER: PlayStatus[] = ['playing', 'played', 'want', 'on-hold', 'dropped'];
