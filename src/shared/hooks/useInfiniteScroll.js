import { useEffect, useRef } from "react";

// Walks up the DOM looking for the nearest scrollable ancestor so the
// IntersectionObserver root matches whichever container actually scrolls.
const findScrollParent = (node) => {
  let el = node?.parentElement;
  while (el) {
    const { overflowY } = getComputedStyle(el);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight
    ) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
};

// Observes a sentinel element and calls onLoadMore when it scrolls into view.
// rootMargin lets us pre-fetch the next page slightly before the user reaches the end.
export const useInfiniteScroll = ({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = "200px",
  enabled = true,
  root,
}) => {
  const sentinelRef = useRef(null);
  const loadMoreRef = useRef(onLoadMore);
  loadMoreRef.current = onLoadMore;

  useEffect(() => {
    if (!enabled) return;
    const node = sentinelRef.current;
    if (!node) return;

    const explicitRoot =
      root && typeof root === "object" && "current" in root
        ? root.current
        : root;
    const rootEl =
      explicitRoot === undefined ? findScrollParent(node) : explicitRoot;

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
