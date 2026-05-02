import { useEffect, useState } from "react";

// Keeps `value` true for at least `minMs` after it first turns true so brief
// loading flickers stay on screen long enough to be perceived.
export const useStickyFlag = (value, minMs = 600) => {
  const [sticky, setSticky] = useState(value);

  useEffect(() => {
    if (value) {
      setSticky(true);
      return;
    }
    const t = setTimeout(() => setSticky(false), minMs);
    return () => clearTimeout(t);
  }, [value, minMs]);

  return sticky;
};

export default useStickyFlag;
