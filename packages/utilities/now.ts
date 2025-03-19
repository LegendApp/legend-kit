/**
 * Legend Kit - A collection of utilities for Legend State, Legend List, and Legend Motion
 * https://legendapp.com/kit/
 *
 * Open source package from the Legend Kit ecosystem
 * See LICENSE file in https://github.com/LegendApp/legend-kit for more information
 */

import { observable } from "@legendapp/state";

const MSPerMinute = 60000;

function clearTime(date: Date | number) {
  date = new Date(date);
  date.setHours(0, 0, 0, 0);
  return date;
}

let time = new Date();
const time$ = observable(time);
const hour$ = observable(time);
const day$ = observable(clearTime(time));
const timeToSecond = (60 - time.getSeconds() + 1) * 1000;
function update() {
  const now = new Date();
  time$.set(now);

  if (now.getHours() !== time.getHours()) {
    hour$.set(now);
  }

  if (now.getDate() !== time.getDate()) {
    day$.set(clearTime(now));
  }

  time = now;
}
setTimeout(() => {
  update();
  setInterval(update, MSPerMinute);
}, timeToSecond);

export { time$, hour$, day$ };

/**
Usage Examples:

These observables provide reactive date/time values that update automatically.

Example 1: Using with observe to react to changes

import { observe } from "@legendapp/state";
import { time$, hour$, day$ } from "@legendapp/kit/utilities/now";

// Re-runs when the minute changes
observe(() => {
  const now = time$.get();
  console.log(`Current time: ${now.toLocaleTimeString()}`);
});

// Re-runs when the hour changes
observe(() => {
  const hour = hour$.get();
  console.log(`Hour changed to: ${hour.getHours()}`);
});

// Re-runs when the day changes
observe(() => {
  const day = day$.get();
  console.log(`Day changed to: ${day.toLocaleDateString()}`);
});

Example 2: Using in React components

import { use$ } from "@legendapp/state/react";
import { time$, day$ } from "@legendapp/kit/utilities/now";

function Clock() {
  // Component re-renders every minute
  const currentTime = use$(time$);

  return (
    <div>
      <h2>Current Time</h2>
      <p>{currentTime.toLocaleTimeString()}</p>
    </div>
  );
}

function DateDisplay() {
  // Component re-renders only when the day changes
  const today = use$(day$);

  return (
    <div>
      <h2>Today's Date</h2>
      <p>{today.toLocaleDateString()}</p>
    </div>
  );
}
*/
