import Image from 'next/image';

import { DualCta } from '../shared/DualCta';
import { ActyonSpecList } from './ActyonSpecList';

interface ActyonSpecCardProps {
  imageSrc: string;
  imageAlt: string;
  modelName: string;
  price: string;
  specs: readonly string[];
  outlineLabel: string;
  solidLabel: string;
  onOutlineClick: () => void;
  onSolidClick: () => void;
}

export const ActyonSpecCard = ({
  imageSrc,
  imageAlt,
  modelName,
  price,
  specs,
  outlineLabel,
  solidLabel,
  onOutlineClick,
  onSolidClick,
}: ActyonSpecCardProps): JSX.Element => (
  <div className="flex w-full flex-col gap-5 rounded-3xl bg-kgm-purple-800 p-5">
    <div className="flex items-center gap-4">
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={64}
        height={64}
        className="rounded-lg object-cover"
      />
      <div className="flex flex-col gap-1">
        <p className="text-[14px] font-bold text-white">{modelName}</p>
        <p className="text-[26px] font-bold leading-[38px] text-white">{price}</p>
      </div>
    </div>
    <div className="h-px w-full bg-kgm-purple-600" aria-hidden="true" />
    <ActyonSpecList specs={specs} />
    <DualCta
      outlineLabel={outlineLabel}
      solidLabel={solidLabel}
      onOutlineClick={onOutlineClick}
      onSolidClick={onSolidClick}
    />
  </div>
);
