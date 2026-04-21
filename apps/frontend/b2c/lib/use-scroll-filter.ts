'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export const ALL_SLUG = 'all' as const;

export type ActiveSlug = string | typeof ALL_SLUG;

interface UseScrollFilterProps {
  modelSlugs: readonly string[];
  containerRef: RefObject<HTMLElement | null>;
  filterBarRef: RefObject<HTMLElement | null>;
}

interface UseScrollFilterResult {
  activeSlug: ActiveSlug;
  isFilterPinned: boolean;
  scrollToSlug: (slug: ActiveSlug) => void;
}

const TOP_SENTINEL_ID = 'landing-products-top';
const END_SENTINEL_ID = 'landing-products-end';

const isBrowser = typeof window !== 'undefined';
const hasIntersectionObserver =
  isBrowser && typeof window.IntersectionObserver === 'function';

export const useScrollFilter = ({
  modelSlugs,
  containerRef,
  filterBarRef,
}: UseScrollFilterProps): UseScrollFilterResult => {
  const [activeSlug, setActiveSlug] = useState<ActiveSlug>(ALL_SLUG);
  const [isFilterPinned, setIsFilterPinned] = useState<boolean>(true);
  const activeEntriesRef = useRef<Map<string, IntersectionObserverEntry>>(new Map());

  useEffect(() => {
    if (!hasIntersectionObserver) return;
    const container = containerRef.current;
    if (!container) return;
    const entryMap = activeEntriesRef.current;

    const slugObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const slug = entry.target.getAttribute('data-model-slug');
          if (!slug) return;
          if (entry.isIntersecting) {
            entryMap.set(slug, entry);
          } else {
            entryMap.delete(slug);
          }
        });

        if (entryMap.size === 0) return;

        const firstVisible = modelSlugs.find((s) => entryMap.has(s));
        if (firstVisible) setActiveSlug(firstVisible);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );

    const items = container.querySelectorAll<HTMLElement>('[data-model-slug]');
    items.forEach((item) => slugObserver.observe(item));

    const topEl = document.getElementById(TOP_SENTINEL_ID);
    const endEl = document.getElementById(END_SENTINEL_ID);

    const boundaryObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id === TOP_SENTINEL_ID) {
            if (entry.isIntersecting) {
              setActiveSlug(ALL_SLUG);
            }
          }
          if (entry.target.id === END_SENTINEL_ID) {
            setIsFilterPinned(!entry.isIntersecting);
            if (entry.isIntersecting && modelSlugs.length > 0) {
              setActiveSlug(modelSlugs[modelSlugs.length - 1]);
            }
          }
        });
      },
      { threshold: 0 },
    );

    if (topEl) boundaryObserver.observe(topEl);
    if (endEl) boundaryObserver.observe(endEl);

    return () => {
      slugObserver.disconnect();
      boundaryObserver.disconnect();
      entryMap.clear();
    };
  }, [containerRef, modelSlugs]);

  const scrollToSlug = useCallback(
    (slug: ActiveSlug) => {
      const targetId = slug === ALL_SLUG ? TOP_SENTINEL_ID : slug;
      const target = document.getElementById(targetId);
      if (!target) return;

      const filterHeight = filterBarRef.current?.offsetHeight ?? 0;
      const rect = target.getBoundingClientRect();
      const absoluteTop = rect.top + window.scrollY - filterHeight - 8;
      window.scrollTo({ top: absoluteTop, behavior: 'smooth' });
    },
    [filterBarRef],
  );

  return { activeSlug, isFilterPinned, scrollToSlug };
};
