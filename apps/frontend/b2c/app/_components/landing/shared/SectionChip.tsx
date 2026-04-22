interface SectionChipProps {
  label: string;
  className?: string;
}

export const SectionChip = ({ label, className }: SectionChipProps): JSX.Element => (
  <span
    className={`inline-flex items-center justify-center rounded-full bg-kgm-blue-900 px-3 py-1.5 text-[11px] font-bold leading-[16px] text-white ${className ?? ''}`}
  >
    {label}
  </span>
);
