import '@commons/ui/index.js';

import Vue from 'vue';
import App from './App.vue';

const app = new Vue({
  render: (h) => h(App),
});
app.$mount('#app');