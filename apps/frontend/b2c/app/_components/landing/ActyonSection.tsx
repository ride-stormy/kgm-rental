'use client';

import { useRouter } from 'next/navigation';
import { LANDING_CONTENT } from '../../_content/landing';
import { AnimateNumber } from '@/components/ui/animate-number/animate-number';
import { ActyonSpecCard } from './actyon/ActyonSpecCard';
import { SectionChip } from './shared/SectionChip';

export const ActyonSection = (): JSX.Element => {
  const { actyon } = LANDING_CONTENT;
  const router = useRouter();

  const handleCalcClick = () => {
    router.push('/products/actyon-hev?term=36&km=10000&prepaid=30');
  };

  const handleConsultClick = () => {
    // 상담 신청 플로우는 별도 구현 예정
  };

  return (
    <section
      data-node-id="20:908"
      className="flex w-full flex-col items-center gap-5 bg-kgm-purple-dark px-5 py-10 text-white"
    >
      <SectionChip label={actyon.chip} />
      <h2 className="text-center font-gmarket text-[28px] font-bold leading-[40px] text-white">
        {actyon.titleLines.map((line, index) =>
          index === 0 ? (
            <span key={line} className="block" aria-label={line}>
              월{' '}
              <AnimateNumber
                value={180550}
                fontSize="28px"
                fontWeight="bold"
                color="currentColor"
                showComma
              />
              원
            </span>
          ) : (
            <span key={line} className="block">
              {line}
            </span>
          ),
        )}
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
