/**
 * Legend Kit - A collection of utilities for Legend State, Legend List, and Legend Motion
 * https://legendapp.com/kit/
 *
 * Open source package from the Legend Kit ecosystem
 * See LICENSE file in https://github.com/LegendApp/legend-kit for more information
 */

import { linked, type ObservableParam } from "@legendapp/state";

export const stringAsArray = (str$: ObservableParam<string>) =>
  linked({
    get: () => JSON.parse(str$?.get() || "[]") as string[],
    set: ({ value }) => {
      str$?.set(JSON.stringify(value));
    },
  });
