import Vuex from "vuex";
import type { Store as VuexStore } from "vuex/types/index.d.ts";
import { eventBus } from "../shared/events";

export const vuexToPiniaPlugin = (store: VuexStore<any>) => {
  const closeBridge = store.subscribe((mutation, state) => {
    const serialized = JSON.parse(JSON.stringify(state));
    eventBus.vuexChange({ ...serialized });
  });

  eventBus.onPiniaChange((payload) => {
    store.replaceState(payload);
  });

  return closeBridge;
};

let _sampleVuexStore = null as unknown as VuexStore<any>;
export const sampleVuexStore = (): VuexStore<any> => {
  if (!_sampleVuexStore) {
    _sampleVuexStore = new Vuex.Store({
      plugins: [vuexToPiniaPlugin],
      state: {
        count: 0,
        user: {
          name: "Vuex User",
          age: 30,
        },
      },
      mutations: {
        increment(state: any) {
          state.count++;
        },
        decrement(state: any) {
          state.count--;
        },
        reset(state: any) {
          state.count = 0;
        },
      },
    });
  }
  return _sampleVuexStore;
};