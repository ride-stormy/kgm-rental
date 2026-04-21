'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';
import { LANDING_CONTENT, MODEL_DISPLAY } from '../../_content/landing';
import type { ModelSlug } from '../../_content/landing';
import { ALL_SLUG } from '@/lib/use-scroll-filter';
import type { ActiveSlug } from '@/lib/use-scroll-filter';

interface FilterTabsProps {
  modelSlugs: readonly ModelSlug[];
  activeSlug: ActiveSlug;
  isFilterPinned: boolean;
  onSelect: (slug: ActiveSlug) => void;
}

export const FilterTabs = forwardRef<HTMLDivElement, FilterTabsProps>(
  ({ modelSlugs, activeSlug, isFilterPinned, onSelect }, ref) => {
    const { filterTabs } = LANDING_CONTENT;

    return (
      <div
        ref={ref}
        data-node-id="7:7772"
        className={cn(
          'z-20 bg-gray-100',
          isFilterPinned ? 'sticky top-0' : 'relative',
        )}
      >
        <div className="flex items-center gap-2 overflow-x-auto px-5 py-3 [&::-webkit-scrollbar]:hidden">
          <FilterTab
            isActive={activeSlug === ALL_SLUG}
            label={filterTabs.allLabel}
            onClick={() => onSelect(ALL_SLUG)}
          />
          {modelSlugs.map((slug) => (
            <FilterTab
              key={slug}
              isActive={activeSlug === slug}
              label={MODEL_DISPLAY[slug].name}
              onClick={() => onSelect(slug)}
            />
          ))}
        </div>
      </div>
    );
  },
);

FilterTabs.displayName = 'FilterTabs';

interface FilterTabProps {
  isActive: boolean;
  label: string;
  onClick: () => void;
}

const FilterTab = ({ isActive, label, onClick }: FilterTabProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={isActive}
    className={cn(
      'shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold leading-[18px] transition-colors',
      isActive ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600',
    )}
  >
    {label}
  </button>
);
