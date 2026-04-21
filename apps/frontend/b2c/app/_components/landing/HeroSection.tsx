'use client';

import Image from 'next/image';
import { LANDING_CONTENT } from '../../_content/landing';

export const HeroSection = (): JSX.Element => {
  const { hero } = LANDING_CONTENT;

  const handleCtaClick = () => {
    if (typeof window !== 'undefined') {
      window.console.debug('hero-cta');
    }
  };

  return (
    <section
      data-node-id="7:7764"
      className="relative w-full bg-gray-100"
      style={{ aspectRatio: '375 / 492' }}
    >
      <Image
        src={hero.bgImage}
        alt=""
        fill
        priority
        sizes="(max-width: 540px) 100vw, 540px"
        className="pointer-events-none select-none object-cover object-center"
      />
      <div className="relative z-10 flex h-full flex-col items-center gap-6 px-5 pb-[200px] pt-20">
        <div className="flex w-full flex-col items-center gap-2 text-center text-gray-900">
          <p className="text-[14px] font-bold leading-[18px]">{hero.eyebrow}</p>
          <p className="whitespace-pre-wrap text-[26px] font-bold leading-[38px]">
            {hero.titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCtaClick}
          style={{ backgroundColor: '#2e2c4b' }}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-kgm-purple-600 px-6 text-[15px] font-medium text-white shadow-lg transition-opacity hover:opacity-90"
        >
          {hero.cta}
        </button>
      </div>
    </section>
  );
};
