import type { HTMLAttributes, ComponentType } from 'react';

import { ARFlag } from './ARFlag';
import { BRFlag } from './BRFlag';
import { CAFlag } from './CAFlag';
import { DEFlag } from './DEFlag';
import { ESFlag } from './ESFlag';
import { FRFlag } from './FRFlag';
import { GBFlag } from './GBFlag';
import { MXFlag } from './MXFlag';
import { PTFlag } from './PTFlag';
import { USFlag } from './USFlag';

export type Language =
  | 'pt-BR'
  | 'en-US'
  | 'pt-PT'
  | 'en-GB'
  | 'de-DE'
  | 'fr-FR'
  | 'es-ES'
  | 'es-AR'
  | 'es-MX'
  | 'en-CA'
  | 'fr-CA';

export type LanguageFlagComponent = ComponentType<
  HTMLAttributes<HTMLSpanElement> & { width?: number; height?: number }
>;

export const LANGUAGE_FLAG_COMPONENTS: Record<Language, LanguageFlagComponent> = {
  'pt-BR': BRFlag,
  'en-US': USFlag,
  'pt-PT': PTFlag,
  'en-GB': GBFlag,
  'de-DE': DEFlag,
  'fr-FR': FRFlag,
  'es-ES': ESFlag,
  'es-AR': ARFlag,
  'es-MX': MXFlag,
  'en-CA': CAFlag,
  'fr-CA': CAFlag,
};

/** ISO 3166-1 alpha-2 → SVG flag (BemTV seeded countries). */
export const COUNTRY_FLAG_COMPONENTS: Record<string, LanguageFlagComponent> = {
  BR: BRFlag,
  US: USFlag,
  PT: PTFlag,
  GB: GBFlag,
  DE: DEFlag,
  FR: FRFlag,
  ES: ESFlag,
  AR: ARFlag,
  MX: MXFlag,
  CA: CAFlag,
};

export { ARFlag, BRFlag, CAFlag, DEFlag, ESFlag, FRFlag, GBFlag, MXFlag, PTFlag, USFlag };
