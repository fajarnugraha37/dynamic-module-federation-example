import { defineStore, type PiniaPlugin } from "pinia";
import { eventBus } from "../shared";

export const piniaToVuexPlugin: PiniaPlugin = (context) => {
  const closeBridge = context.store.$subscribe(() => {
    const serialized = JSON.parse(JSON.stringify(context.store.$state));
    eventBus.piniaChange(serialized);
  });

  eventBus.onVuexChange((payload) => {
    context.store.$patch(payload);
  });

  return closeBridge;
};

export const useCounterStore = defineStore("counter", {
  state: () => {
    return { count: 0 };
  },
  // could also be defined as
  // state: () => ({ count: 0 })
  actions: {
    increment() {
      this.count++;
    },
    decrement() {
      this.count--;
    },
    reset() {
      this.count = 0;
    }
  },
});
