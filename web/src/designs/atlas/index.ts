import type { DesignDefinition } from '../types';
import { Layout } from './Layout';
import { Home } from './Home';
import { Browse } from './Browse';
import { GameDetail } from './GameDetail';
import { Library } from './Library';
import { Groups } from './Groups';
import { GroupDetail } from './GroupDetail';
import { Profile } from './Profile';

/** Atlas — professional editorial light design: paper, serif mastheads, hairline rules. */
export const atlas: DesignDefinition = {
  id: 'atlas',
  label: '📖 Atlas',
  blurb: 'Editorial light — literary and calm',
  pages: { Layout, Home, Browse, GameDetail, Library, Groups, GroupDetail, Profile },
};
