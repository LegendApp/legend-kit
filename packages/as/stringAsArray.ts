import { linked, type ObservableParam } from "@legendapp/state";

export const stringAsArray = (str$: ObservableParam<string>) =>
  linked({
    get: () => JSON.parse(str$?.get() || "[]") as string[],
    set: ({ value }) => {
      str$?.set(JSON.stringify(value));
    },
  });
