/**
 * Legend Kit - A collection of utilities for Legend State, Legend List, and Legend Motion
 * https://legendapp.com/kit/
 *
 * Open source package from the Legend Kit ecosystem
 * See LICENSE file in https://github.com/LegendApp/legend-kit for more information
 */

import type { Observable } from "@legendapp/state";
import { useMount, useObservable } from "@legendapp/state/react";
import type { RefObject } from "react";

export function useElementScroll(
  target: RefObject<HTMLElement> | HTMLElement,
  field: "scrollTop" | "scrollLeft" = "scrollTop",
): Observable<number> {
  // Create an observable to store the scroll value
  const obs$ = useObservable<number>(undefined);

  useMount(() => {
    const element: HTMLElement =
      target instanceof HTMLElement ? target : target.current;

    // Handle element scroll and set it on the observable
    const handleScroll = () => {
      const scroll = element[field];
      if (scroll !== obs$.peek()) {
        obs$.set(scroll);
      }
    };

    element.addEventListener("scroll", handleScroll);
    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  });

  return obs$;
}
