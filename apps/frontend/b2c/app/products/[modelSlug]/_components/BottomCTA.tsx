'use client';

export const BottomCTA = () => {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-20 flex h-[84px] flex-col bg-white">
      <div
        aria-hidden
        className="h-2 w-full"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, #FFFFFF 100%)',
        }}
      />
      <div className="flex flex-col items-center bg-white px-5">
        <button
          type="button"
          onClick={() => {}}
          className="h-14 w-full rounded-[14px] bg-kgm-purple-600 text-[17px] font-medium leading-[24px] text-white"
        >
          이 조건으로 상담 신청
        </button>
      </div>
      <div aria-hidden className="h-5 w-full bg-white" />
    </div>
  );
};
