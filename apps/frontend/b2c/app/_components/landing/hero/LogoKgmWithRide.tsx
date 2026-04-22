interface LogoKgmWithRideProps {
  className?: string;
}

export const LogoKgmWithRide = ({ className }: LogoKgmWithRideProps): JSX.Element => {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static 3.6KB SVG, next/image adds overhead
    <img
      src="/images/landing/logo/KGMwithRIDE.svg"
      alt="KGM with RIDE"
      width={62}
      height={20}
      className={className}
    />
  );
};
