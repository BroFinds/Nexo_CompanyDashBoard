import { useEffect, useRef } from "react";

// Returns an `isFresh(id)` predicate that flags ids absent from the previous
// render's snapshot — used to apply a stronger entrance animation to items
// appended via infinite scroll (without re-animating items already on screen).
export const useFreshItems = (ids) => {
  const seenRef = useRef(new Set());
  const previousIds = seenRef.current;

  const isFresh = (id) => previousIds.size > 0 && !previousIds.has(id);

  useEffect(() => {
    seenRef.current = new Set(ids);
  });

  return isFresh;
};

export default useFreshItems;
