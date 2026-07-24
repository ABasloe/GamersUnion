import type { DesignDefinition } from './types';
import { union } from './union';
import { signal } from './signal';
import { atlas } from './atlas';
import { holo } from './holo';
import { hearth } from './hearth';

export const DESIGNS: DesignDefinition[] = [union, signal, atlas, holo, hearth];
export const DEFAULT_DESIGN_ID = 'union';
