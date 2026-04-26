import Image from 'next/image';

interface VehiclePriceCardProps {
  src: string;
  alt: string;
  price: string;
}

interface TorresPriceCompareVisualProps {
  tivoliSrc: string;
  tivoliAlt: string;
  tivoliPrice: string;
  torresSrc: string;
  torresAlt: string;
  torresPrice: string;
  arrowIconSrc: string;
}

export const TorresPriceCompareVisual = ({
  tivoliSrc,
  tivoliAlt,
  tivoliPrice,
  torresSrc,
  torresAlt,
  torresPrice,
  arrowIconSrc,
}: TorresPriceCompareVisualProps): JSX.Element => (
  <div className="flex w-full items-center justify-center gap-3">
    <VehiclePriceCard src={tivoliSrc} alt={tivoliAlt} price={tivoliPrice} />
    <Image
      src={arrowIconSrc}
      alt=""
      aria-hidden="true"
      width={16}
      height={16}
      className="shrink-0"
    />
    <VehiclePriceCard src={torresSrc} alt={torresAlt} price={torresPrice} />
  </div>
);

const VehiclePriceCard = ({ src, alt, price }: VehiclePriceCardProps): JSX.Element => (
  <div className="relative size-[100px] shrink-0">
    <Image
      src={src}
      alt={alt}
      width={100}
      height={100}
      className="size-full object-contain"
    />
    <div className="absolute left-1/2 top-[66px] -translate-x-1/2 whitespace-nowrap rounded-lg bg-white/10 px-3 py-2 text-center text-[14px] font-bold leading-[18px] text-white">
      {price}
    </div>
  </div>
);
