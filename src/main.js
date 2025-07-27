import { createSSRApp } from "vue";
import { createI18n } from "vue-i18n"; // v9.x
import { debounceClick } from "./utils/common.js";
import { getMediumFontWeight } from "./utils/common.js";
import App from "./App.vue";
import store from "./store/index.js";

//import wuUI from "@/uni_modules/wu-ui-tools";
import messages from "./locale/index";
import Vue from "vue";
// import uvUI from '@/uni_modules/uv-ui-tools'
// Vue.use(uvUI)
// import vTabs from '@/uni_modules/v-tabs/components/v-tabs/v-tabs';
// Vue.use(vTabs);
// 如此配置即可

const i18nConfig = {
  locale: "zh-Hans",
  // locale: uni.getLocale(),
  messages,
};

const i18n = createI18n(i18nConfig);

// 用户操作系统
let userOpeationSystem = "";
// 判断iOS系统
export const isIOS = () => {
  return userOpeationSystem == "ios";
};

export function createApp() {
  const res = uni.getSystemInfoSync() || {};
  const { osName } = res;
  userOpeationSystem = osName;
  const app = createSSRApp(App);
  app.use(store);
  // app.use(uvUI);
  //app.use(wuUI);
  app.use(i18n);
  app.config.globalProperties.$debounceClick = debounceClick;
  app.config.globalProperties.$getMediumFontWeight = getMediumFontWeight.bind(
    null,
    osName
  );
  return {
    app,
  };
}
