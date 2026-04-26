interface TorresFeatureBulletsProps {
  items: readonly string[];
}

export const TorresFeatureBullets = ({ items }: TorresFeatureBulletsProps): JSX.Element => (
  <div className="flex w-full items-center justify-center gap-[13px]">
    {items.map((label) => (
      <p key={label} className="text-center text-[14px] font-bold leading-[18px] text-white">
        {label}
      </p>
    ))}
  </div>
);
