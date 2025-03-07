/**
 * Legend Kit - A collection of utilities for Legend State, Legend List, and Legend Motion
 * https://legendapp.com/kit/
 *
 * Open source package from the Legend Kit ecosystem
 * See LICENSE file in https://github.com/LegendApp/legend-kit for more information
 */

import { Observable } from "@legendapp/state";
import { useMount, useObservable } from "@legendapp/state/react";
import type { RefObject } from "react";

export function useElementIsScrolled(
  target: RefObject<HTMLElement> | HTMLElement,
  field: "scrollTop" | "scrollLeft" = "scrollTop",
): Observable<boolean> {
  // Create an observable to store the isScrolled value
  const obs$ = useObservable(false);

  useMount(() => {
    const element: HTMLElement =
      target instanceof HTMLElement ? target : target.current;

    // Handle element scroll and set it on the observable
    const handleScroll = () => {
      const isScrolled = element[field] > 0;
      if (isScrolled !== obs$.peek()) {
        obs$.set(isScrolled);
      }
    };

    element.addEventListener("scroll", handleScroll);
    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  });

  return obs$;
}
