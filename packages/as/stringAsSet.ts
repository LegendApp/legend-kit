/**
 * Legend Kit - A collection of utilities for Legend State, Legend List, and Legend Motion
 * https://legendapp.com/kit/
 *
 * Open source package from the Legend Kit ecosystem
 * See LICENSE file in https://github.com/LegendApp/legend-kit for more information
 */

import { linked, type ObservableParam } from "@legendapp/state";

export const stringAsSet = (str$: ObservableParam<string>) =>
  linked({
    get: () => new Set<string>(JSON.parse(str$?.get() || "[]")),
    set: ({ value }) => {
      str$?.set(JSON.stringify(Array.from(value)));
    },
  });
