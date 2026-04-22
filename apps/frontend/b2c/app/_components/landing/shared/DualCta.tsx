interface DualCtaProps {
  outlineLabel: string;
  solidLabel: string;
  onOutlineClick: () => void;
  onSolidClick: () => void;
  className?: string;
}

export const DualCta = ({
  outlineLabel,
  solidLabel,
  onOutlineClick,
  onSolidClick,
  className,
}: DualCtaProps): JSX.Element => (
  <div className={`flex w-full items-stretch gap-2 ${className ?? ''}`}>
    <button
      type="button"
      onClick={onOutlineClick}
      className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-kgm-purple-800 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
    >
      {outlineLabel}
    </button>
    <button
      type="button"
      onClick={onSolidClick}
      className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-kgm-blue-600 text-[14px] font-medium text-white shadow-lg transition-opacity hover:opacity-90"
    >
      {solidLabel}
    </button>
  </div>
);
