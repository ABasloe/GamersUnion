import type { DesignDefinition } from '../types';
import { Layout } from './Layout';
import { Home } from './Home';
import { Browse } from './Browse';
import { GameDetail } from './GameDetail';
import { Library } from './Library';
import { Groups, GroupDetail } from './Fires';
import { Profile } from './Profile';
import { Deck } from './Deck';

/** Union — the flagship: angular river home, campfire forums, deck feed. */
export const union: DesignDefinition = {
  id: 'union',
  label: 'Union',
  blurb: 'Flagship — angular river, fires, deck',
  pages: { Layout, Home, Browse, GameDetail, Library, Groups, GroupDetail, Profile },
  extras: [{ path: '/deck', Component: Deck }],
};
