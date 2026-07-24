import type { DesignDefinition } from './types';
import { signal } from './signal';
import { atlas } from './atlas';
import { holo } from './holo';

export const DESIGNS: DesignDefinition[] = [signal, atlas, holo];
export const DEFAULT_DESIGN_ID = 'signal';
