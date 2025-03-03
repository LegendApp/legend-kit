import { linked, type ObservableParam } from "@legendapp/state";

export const stringAsRecord = (str$: ObservableParam<string>) =>
  linked({
    get: () => {
      return JSON.parse(str$?.get() || "{}") as Record<string, string>;
    },
    set: ({ value }) => {
      str$?.set(JSON.stringify(value));
    },
  });
