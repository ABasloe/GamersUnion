import type { DesignDefinition } from '../types';
import { Layout } from './Layout';
import { Home } from './Home';
import { Browse } from './Browse';
import { GameDetail } from './GameDetail';
import { Library } from './Library';
import { Groups, GroupDetail } from './Groups';
import { Profile } from './Profile';

/** Holo — futuristic dashboard: left sidebar, glassy bento panels, violet→cyan accent. */
export const holo: DesignDefinition = {
  id: 'holo',
  label: '🛰️ Holo',
  blurb: 'Futuristic dashboard — sidebar and panels',
  pages: { Layout, Home, Browse, GameDetail, Library, Groups, GroupDetail, Profile },
};
