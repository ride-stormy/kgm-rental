import { LANDING_CONTENT } from '../../_content/landing';
import { ExperienceCenterCard } from './experience-center/ExperienceCenterCard';

export const ExperienceCenterSection = () => {
  const { experienceCenter } = LANDING_CONTENT;
  return (
    <section
      id="experience-center"
      data-node-id="31:1097"
      className="flex w-full flex-col items-center gap-5 bg-white p-5"
    >
      <h2 className="w-full text-center text-[22px] font-bold leading-[34px] text-gray-900">
        {experienceCenter.titleLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h2>
      <div className="flex w-full flex-col items-center gap-4">
        {experienceCenter.centers.map((center) => (
          <ExperienceCenterCard key={center.reserveUrl} center={center} />
        ))}
      </div>
    </section>
  );
};
