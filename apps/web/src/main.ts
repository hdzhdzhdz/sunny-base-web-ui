import { createApp } from "vue";
import ArcoVue from "@arco-design/web-vue";
import "element-plus/dist/index.css";
import "@arco-design/web-vue/dist/arco.css";
import "./style.css";
import App from "./App.vue";
import VxeUIBase from 'vxe-pc-ui'
import VxeUITable from 'vxe-table'

const app = createApp(App);
app.use(ArcoVue);
app.use(VxeUIBase);
app.use(VxeUITable);
app.mount("#app");
