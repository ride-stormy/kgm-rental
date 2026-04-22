'use client';

import { LANDING_CONTENT } from '../../_content/landing';
import { HeroEventBand } from './hero/HeroEventBand';
import { HeroHeadline } from './hero/HeroHeadline';
import { HeroLineupImage } from './hero/HeroLineupImage';

export const HeroSection = (): JSX.Element => {
  const { hero } = LANDING_CONTENT;

  const handleCtaClick = () => {
    if (typeof window !== 'undefined') {
      window.console.debug('hero-cta');
    }
  };

  return (
    <section data-node-id="20:781" className="flex w-full flex-col">
      <HeroHeadline
        titleLines={hero.titleLines}
        cta={hero.cta}
        onCtaClick={handleCtaClick}
      />
      <HeroEventBand text={hero.eyebrow} />
      <HeroLineupImage src="/images/landing/carlineup.png" />
    </section>
  );
};
