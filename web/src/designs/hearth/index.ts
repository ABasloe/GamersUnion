import type { DesignDefinition } from '../types';
import { Layout } from './Layout';
import { Home } from './Home';
import { Browse } from './Browse';
import { GameDetail } from './GameDetail';
import { Library } from './Library';
import { Groups, GroupDetail } from './Fires';
import { Profile } from './Profile';
import { Deck } from './Deck';

/** Hearth — river home, campfire forums, one-card deck feed. */
export const hearth: DesignDefinition = {
  id: 'hearth',
  label: '🔥 Hearth',
  blurb: 'River home, campfire forums, deck feed',
  pages: { Layout, Home, Browse, GameDetail, Library, Groups, GroupDetail, Profile },
  extras: [{ path: '/deck', Component: Deck }],
};
