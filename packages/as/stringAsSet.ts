import { linked, type ObservableParam } from "@legendapp/state";

export const stringAsSet = (str$: ObservableParam<string>) =>
  linked({
    get: () => new Set<string>(JSON.parse(str$?.get() || "[]")),
    set: ({ value }) => {
      str$?.set(JSON.stringify(Array.from(value)));
    },
  });
