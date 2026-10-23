import { useEffect, useState } from "react";
import { APPROVALS_CHANGED, fetchApprovalCount } from "./dayCloseApi";

const REFRESH_MS = 60_000;

// Last known count, kept across page changes so the bell doesn't flash back to empty
let cached = { count: 0, at: 0 };

// Pending approvals (sales, returns, unloads) for the header bell
export const useApprovalCount = () => {
  const [count, setCount] = useState(cached.count);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const n = await fetchApprovalCount();
        cached = { count: n, at: Date.now() };
        if (!cancelled) setCount(n);
      } catch (e) {
        console.error("fetchApprovalCount:", e);
      }
    };
    if (Date.now() - cached.at > REFRESH_MS / 2) load();
    const timer = setInterval(load, REFRESH_MS);
    window.addEventListener(APPROVALS_CHANGED, load);
    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener(APPROVALS_CHANGED, load);
    };
  }, []);

  return count;
};
