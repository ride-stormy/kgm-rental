import Image from 'next/image';
import { ExperienceCenterReserveLink } from './ExperienceCenterReserveLink';
import type { ExperienceCenter } from '../../../_content/landing';

interface ExperienceCenterCardProps {
  center: ExperienceCenter;
}

export const ExperienceCenterCard = ({ center }: ExperienceCenterCardProps) => {
  return (
    <article className="flex w-full items-stretch overflow-clip rounded-[16px]">
      <div className="relative aspect-[126/164] w-[37.6%] shrink-0 self-stretch">
        <Image
          src={center.imageSrc}
          alt={center.imageAlt}
          fill
          sizes="(max-width: 540px) 38vw, 203px"
          className="object-cover"
          style={{ objectPosition: center.imagePosition }}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-3 bg-gray-100 p-4">
        <div className="flex w-full flex-col items-start gap-1.5 text-gray-900">
          <p className="text-[11px] font-bold leading-[16px]">{center.label}</p>
          <h3 className="whitespace-pre-wrap text-[15px] font-bold leading-[20px]">
            {center.titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h3>
          <p className="text-[11px] font-medium leading-[16px]">{center.address}</p>
        </div>
        <ExperienceCenterReserveLink href={center.reserveUrl} label={center.buttonLabel} />
      </div>
    </article>
  );
};
