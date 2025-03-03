import { linked, type ObservableParam } from "@legendapp/state";

export const numberAsString = (num$: ObservableParam<number>) =>
  linked({
    get: () => num$.get() + "",
    set: ({ value }) => {
      num$?.set(+value);
    },
  });
