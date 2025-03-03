// Empty file for isWindowFocused
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
