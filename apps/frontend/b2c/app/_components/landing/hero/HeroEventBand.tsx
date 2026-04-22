interface HeroEventBandProps {
  text: string;
}

export const HeroEventBand = ({ text }: HeroEventBandProps): JSX.Element => {
  return (
    <div
      data-node-id="20:792"
      className="flex w-full items-center gap-3 bg-black px-5 py-[13px]"
    >
      <span
        aria-hidden="true"
        className="h-[2px] flex-1 rounded-lg"
        style={{ backgroundImage: 'linear-gradient(to right, #000000 0%, #ffffff 100%)' }}
      />
      <p className="shrink-0 whitespace-nowrap text-center text-[14px] font-bold leading-[18px] text-white">
        {text}
      </p>
      <span
        aria-hidden="true"
        className="h-[2px] flex-1 rounded-lg"
        style={{ backgroundImage: 'linear-gradient(to right, #ffffff 0%, #000000 100%)' }}
      />
    </div>
  );
};
