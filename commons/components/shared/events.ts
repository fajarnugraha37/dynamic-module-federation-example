import mitt from "mitt";

const mittInstance = mitt();

mittInstance.on("*", (key, payload) => {
  console.log(`Event emitted: ${String(key)}`, payload);
});

export const eventBus = {
  piniaChange: (payload: any) => {
    mittInstance.emit("pinia.change", payload);
  },
  vuexChange: (payload: any) => {
    mittInstance.emit("vuex.change", payload);
  },
  onPiniaChange: (handler: (payload: any) => void) => {
    const close = mittInstance.on("pinia.change", handler);
    return close;
  },
  onVuexChange: (handler: (payload: any) => void) => {
    const close = mittInstance.on("vuex.change", handler);
    return close;
  },
};
