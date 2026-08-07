import { useEffect, useState } from "react";

export function useIsMobile(breakpointPx: number): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(`(max-width: ${breakpointPx}px)`).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const query = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    const sync = (): void => {
      setIsMobile(query.matches);
    };

    sync();
    query.addEventListener("change", sync);
    return () => {
      query.removeEventListener("change", sync);
    };
  }, [breakpointPx]);

  return isMobile;
}
