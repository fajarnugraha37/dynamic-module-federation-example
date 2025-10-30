import '@commons/ui/index.js';

import Vue from 'vue';
import Vuex from 'vuex';

import App from './App.vue';
import { sampleVuexStore } from '@commons/components/stores.vuex';

Vue.use(Vuex);
const app = new Vue({
  render: (h) => h(App),
  store: sampleVuexStore(),
});
app.$mount('#app');