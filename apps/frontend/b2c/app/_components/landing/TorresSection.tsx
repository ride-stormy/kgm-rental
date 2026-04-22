'use client';

import { LANDING_CONTENT } from '../../_content/landing';
import { DualCta } from './shared/DualCta';
import { SectionChip } from './shared/SectionChip';
import { TorresComparisonTable } from './torres/TorresComparisonTable';

export const TorresSection = (): JSX.Element => {
  const { torres } = LANDING_CONTENT;

  const handleCalcClick = () => {
    if (typeof window !== 'undefined') {
      window.console.debug('torres-calc');
    }
  };

  const handleConsultClick = () => {
    if (typeof window !== 'undefined') {
      window.console.debug('torres-consult');
    }
  };

  return (
    <section
      data-node-id="23:1089"
      className="flex w-full flex-col items-center gap-5 bg-kgm-purple-dark px-5 py-10 text-white"
    >
      <SectionChip label={torres.chip} />
      <h2 className="text-center font-gmarket text-[28px] font-bold leading-[40px] text-white">
        {torres.titleLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h2>
      <TorresComparisonTable headers={torres.tableHeaders} rows={torres.tableRows} />
      <DualCta
        outlineLabel={torres.ctaOutline}
        solidLabel={torres.ctaSolid}
        onOutlineClick={handleCalcClick}
        onSolidClick={handleConsultClick}
      />
    </section>
  );
};
