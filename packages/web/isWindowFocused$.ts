/**
 * Legend Kit - A collection of utilities for Legend State, Legend List, and Legend Motion
 * https://legendapp.com/kit/
 *
 * Open source package from the Legend Kit ecosystem
 * See LICENSE file in https://github.com/LegendApp/legend-kit for more information
 */

import { observable } from "@legendapp/state";

// Get current focus state of the window
const hasFocus = () => typeof document !== "undefined" && document.hasFocus();

// An observable with the current value of whether the window is focused
const isWindowFocused$ = observable<boolean>(() => {
  // Setup the window focus event listeners, once when the observable is first accessed.
  const onFocus = () => {
    isWindowFocused$.set(true);
  };
  const onBlur = () => {
    isWindowFocused$.set(false);
  };
  window.addEventListener("focus", onFocus);
  window.addEventListener("blur", onBlur);

  // Return the current focused state
  return hasFocus();
});
