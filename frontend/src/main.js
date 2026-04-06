import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import "./assets/main.css";

const vueApplication = createApp(App);

vueApplication.use(createPinia());
vueApplication.use(router);
vueApplication.mount("#app");
