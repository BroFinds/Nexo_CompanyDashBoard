import { useEffect, useRef } from "react";

// Observes a sentinel element and calls onLoadMore when it scrolls into view.
// rootMargin lets us pre-fetch the next page slightly before the user reaches the end.
export const useInfiniteScroll = ({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = "200px",
  enabled = true,
  root = null,
}) => {
  const sentinelRef = useRef(null);
  const loadMoreRef = useRef(onLoadMore);
  loadMoreRef.current = onLoadMore;

  useEffect(() => {
    if (!enabled) return;
    const node = sentinelRef.current;
    if (!node) return;

    const rootEl = root && "current" in root ? root.current : root;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreRef.current?.();
        }
      },
      { root: rootEl ?? null, rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, enabled, rootMargin, root]);

  return sentinelRef;
};

export default useInfiniteScroll;
