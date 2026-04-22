import Image from 'next/image';

interface HeroLineupImageProps {
  src: string;
  alt?: string;
}

export const HeroLineupImage = ({ src, alt = '' }: HeroLineupImageProps): JSX.Element => {
  return (
    <div
      data-node-id="20:796"
      className="relative h-[180px] w-full overflow-hidden bg-black"
      role="presentation"
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 540px) 100vw, 540px"
        priority={false}
        className="pointer-events-none select-none object-cover object-center"
      />
    </div>
  );
};
