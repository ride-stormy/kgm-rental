interface ExperienceCenterReserveLinkProps {
  href: string;
  label: string;
}

export const ExperienceCenterReserveLink = ({
  href,
  label,
}: ExperienceCenterReserveLinkProps) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-8 items-center justify-center self-start rounded-[8px] bg-gray-900 px-3 text-[13px] font-medium leading-[18px] text-white transition-opacity hover:opacity-90"
    >
      {label}
    </a>
  );
};
