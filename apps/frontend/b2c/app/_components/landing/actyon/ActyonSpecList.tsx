import Image from 'next/image';

interface ActyonSpecListProps {
  specs: readonly string[];
}

export const ActyonSpecList = ({ specs }: ActyonSpecListProps): JSX.Element => (
  <ul className="flex flex-col gap-2">
    {specs.map((spec) => (
      <li key={spec} className="flex items-start gap-1 text-[13px] leading-[18px] text-kgm-purple-300">
        <Image
          src="/images/landing/check.svg"
          alt=""
          width={18}
          height={18}
          aria-hidden="true"
          className="mt-0.5 shrink-0"
        />
        <span>{spec}</span>
      </li>
    ))}
  </ul>
);
