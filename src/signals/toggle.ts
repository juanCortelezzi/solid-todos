import { createSignal } from "solid-js";

export type Toggle = ReturnType<typeof createToggle>;
export const createToggle = (initialState?: boolean) => {
  const [isOn, setIsOn] = createSignal(initialState ?? false);
  const turnOn = () => setIsOn(true);
  const turnOff = () => setIsOn(false);
  const toggle = () => setIsOn((x) => !x);

  return { isOn, toggle, turnOn, turnOff };
};
