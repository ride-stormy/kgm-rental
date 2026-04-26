import { MODEL_DISPLAY } from '@/app/_content/landing';
import { MODEL_SLUGS } from '@/lib/inventory/slug-mapper';
import type { ModelSlug } from '@/lib/inventory/slug-mapper';

export const isModelSlug = (value: string): value is ModelSlug =>
  (MODEL_SLUGS as readonly string[]).includes(value);

export const resolveThumbnail = (slug: ModelSlug): string =>
  MODEL_DISPLAY[slug].thumbnail;
