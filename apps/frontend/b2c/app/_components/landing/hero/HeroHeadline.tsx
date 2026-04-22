'use client';

import { LogoKgmWithRide } from './LogoKgmWithRide';

interface HeroHeadlineProps {
  titleLines: readonly string[];
  cta: string;
  onCtaClick: () => void;
}

const HEADLINE_GRADIENT =
  'linear-gradient(115.96deg, #ffffff 5.17%, #b2cbff 92.35%)';
const UNDERLINE_GRADIENT_TORRES =
  'linear-gradient(226.24deg, #100f21 2.99%, #262a8e 86.77%)';
const UNDERLINE_GRADIENT_ACTYON =
  'linear-gradient(203.12deg, #100f21 2.99%, #262a8e 86.77%)';

const DECORATION = {
  underlineTorres: { top: '29px', left: '222px', width: '92px', height: '13px' },
  underlineActyon: { top: '127px', left: '54px', width: '225px', height: '13px' },
  dotHan: { top: '49px', left: '162px' },
  dotJan: { top: '49px', left: '196px' },
} as const;

export const HeroHeadline = ({
  titleLines,
  cta,
  onCtaClick,
}: HeroHeadlineProps): JSX.Element => {
  return (
    <div
      data-node-id="20:782"
      className="flex w-full flex-col items-center gap-8 bg-kgm-purple-dark px-5 pb-8 pt-16 text-white"
    >
      <LogoKgmWithRide className="h-5 w-[62px]" />

      <div className="relative mx-auto w-[335px]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            top: DECORATION.underlineTorres.top,
            left: DECORATION.underlineTorres.left,
            width: DECORATION.underlineTorres.width,
            height: DECORATION.underlineTorres.height,
            backgroundImage: UNDERLINE_GRADIENT_TORRES,
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            top: DECORATION.underlineActyon.top,
            left: DECORATION.underlineActyon.left,
            width: DECORATION.underlineActyon.width,
            height: DECORATION.underlineActyon.height,
            backgroundImage: UNDERLINE_GRADIENT_ACTYON,
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute h-1 w-1 rounded-full bg-white"
          style={{ top: DECORATION.dotHan.top, left: DECORATION.dotHan.left }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute h-1 w-1 rounded-full bg-white"
          style={{ top: DECORATION.dotJan.top, left: DECORATION.dotJan.left }}
        />

        <h1
          data-node-id="20:787"
          className="relative bg-clip-text text-center font-gmarket text-[28px] font-bold leading-[48px] text-transparent"
          style={{ backgroundImage: HEADLINE_GRADIENT }}
        >
          {titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
      </div>

      <button
        type="button"
        onClick={onCtaClick}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-kgm-blue-600 px-6 text-[15px] font-medium text-white shadow-lg transition-opacity hover:opacity-90"
      >
        {cta}
      </button>
    </div>
  );
};
