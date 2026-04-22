'use client';

import { LANDING_CONTENT } from '../../_content/landing';
import { ActyonSpecCard } from './actyon/ActyonSpecCard';
import { SectionChip } from './shared/SectionChip';

export const ActyonSection = (): JSX.Element => {
  const { actyon } = LANDING_CONTENT;

  const handleCalcClick = () => {
    if (typeof window !== 'undefined') {
      window.console.debug('actyon-calc');
    }
  };

  const handleConsultClick = () => {
    if (typeof window !== 'undefined') {
      window.console.debug('actyon-consult');
    }
  };

  return (
    <section
      data-node-id="20:908"
      className="flex w-full flex-col items-center gap-5 bg-kgm-purple-dark px-5 py-10 text-white"
    >
      <SectionChip label={actyon.chip} />
      <h2 className="text-center font-gmarket text-[28px] font-bold leading-[40px] text-white">
        {actyon.titleLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h2>
      <ActyonSpecCard
        imageSrc={actyon.imageSrc}
        imageAlt={actyon.imageAlt}
        modelName={actyon.modelName}
        price={actyon.price}
        specs={actyon.specs}
        outlineLabel={actyon.ctaOutline}
        solidLabel={actyon.ctaSolid}
        onOutlineClick={handleCalcClick}
        onSolidClick={handleConsultClick}
      />
    </section>
  );
};
