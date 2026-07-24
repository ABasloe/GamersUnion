import type { DesignDefinition } from '../types';
import { Layout } from '../../components/Layout';
import { Home } from '../../pages/Home';
import { Browse } from '../../pages/Browse';
import { GameDetail } from '../../pages/GameDetail';
import { Library } from '../../pages/Library';
import { Groups } from '../../pages/Groups';
import { GroupDetail } from '../../pages/GroupDetail';
import { Profile } from '../../pages/Profile';

/** Signal — the original angular dark design (custom CSS in index.css). */
export const signal: DesignDefinition = {
  id: 'signal',
  label: 'Signal',
  blurb: 'Angular dark — sharp notched edges',
  pages: { Layout, Home, Browse, GameDetail, Library, Groups, GroupDetail, Profile },
};
