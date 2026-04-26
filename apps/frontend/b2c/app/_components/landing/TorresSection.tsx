'use client';

import { useRouter } from 'next/navigation';
import { LANDING_CONTENT } from '../../_content/landing';
import { DualCta } from './shared/DualCta';
import { SectionChip } from './shared/SectionChip';
import { TorresComparisonTable } from './torres/TorresComparisonTable';
import { TorresFeatureBullets } from './torres/TorresFeatureBullets';
import { TorresPriceCompareVisual } from './torres/TorresPriceCompareVisual';

const ARROW_RIGHT_ICON_SRC = '/images/landing/arrow-right.svg';

export const TorresSection = (): JSX.Element => {
  const { torres } = LANDING_CONTENT;
  const router = useRouter();

  const handleCalcClick = () => {
    router.push('/products/2025-torres');
  };

  const handleConsultClick = () => {
    // 상담 신청 플로우는 별도 구현 예정
  };

  return (
    <section
      data-node-id="23:1089"
      className="flex w-full flex-col items-center gap-6 bg-kgm-purple-dark px-5 py-8 text-white"
    >
      <SectionChip label={torres.chip} />
      <h2 className="text-center font-gmarket text-[28px] font-bold leading-[40px] text-white">
        {torres.titleLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h2>
      <TorresFeatureBullets items={torres.features} />
      <TorresPriceCompareVisual
        tivoliSrc={torres.priceCompare.tivoliSrc}
        tivoliAlt={torres.priceCompare.tivoliAlt}
        tivoliPrice={torres.priceCompare.tivoliPrice}
        torresSrc={torres.priceCompare.torresSrc}
        torresAlt={torres.priceCompare.torresAlt}
        torresPrice={torres.priceCompare.torresPrice}
        arrowIconSrc={ARROW_RIGHT_ICON_SRC}
      />
      <div className="flex w-full flex-col items-center gap-3">
        <TorresComparisonTable headers={torres.tableHeaders} rows={torres.tableRows} />
        <p className="text-center text-[14px] font-medium leading-[18px] text-kgm-purple-400">
          {torres.footnote}
        </p>
      </div>
      <DualCta
        outlineLabel={torres.ctaOutline}
        solidLabel={torres.ctaSolid}
        onOutlineClick={handleCalcClick}
        onSolidClick={handleConsultClick}
      />
    </section>
  );
};
