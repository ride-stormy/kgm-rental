import { LANDING_CONTENT } from '../../_content/landing';
import { LogoKgmWithRide } from './hero/LogoKgmWithRide';

export const HeroSection = (): JSX.Element => {
  const { hero } = LANDING_CONTENT;

  return (
    <section
      data-node-id="31:913"
      className="relative aspect-[375/420] w-full overflow-hidden bg-kgm-purple-dark"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static hero bg, decorative */}
      <img
        src={hero.bgImage}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        data-node-id="31:1344"
        className="pointer-events-none absolute inset-x-0 top-0 h-[260px]"
        style={{
          background:
            'linear-gradient(180deg, #100f21 0%, rgba(16,15,33,0.85) 45%, rgba(16,15,33,0) 100%)',
        }}
      />
      <div
        data-node-id="31:1313"
        className="absolute inset-x-0 top-[64px] flex flex-col items-center gap-4 px-5"
      >
        <LogoKgmWithRide className="h-5 w-[62px]" />
        <div className="text-center font-gmarket text-[28px] font-bold text-white">
          {hero.titleLines.map((line) => (
            <p key={line} className="leading-[48px]">
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};
