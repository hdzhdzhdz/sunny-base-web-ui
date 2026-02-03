import { createApp } from "vue";
import App from './App.vue';

import "@arco-design/web-vue/dist/arco.css";
import "./style.css";
import ArcoVue from "@arco-design/web-vue";

import { createEffects } from '@sunny-base-web/effects'

import { router } from './router';
import { setupI18n } from '#/locales';

import { initStores } from '@sunny-base-web/stores';
import { preferences } from './preferences';

async function bootstrap(namespace: string) {
	const app = createApp(App);
	// 配置 pinia-tore
	await initStores(app as any, { namespace });

	// 注册 @effects 业务组件包的全局配置
	// 作用：统一注入 API 前缀和 SSO 地址，使 Login 等组件能自动获取配置，
	// 无需在每个页面单独传递 api-prefix 等属性，实现业务逻辑解耦。
	app.use(createEffects({
		apiPrefix: preferences.app.apiPrefix,
		ssoUrl: preferences.app.ssoUrl,
		locale: preferences.app.locale,
		enableRefreshToken: preferences.app.enableRefreshToken,
		publicKey: preferences.app.publicKey,
		app: {
			name: preferences.app.name
		},
		header: preferences.header,
		logo: preferences.logo,
		sidebar: preferences.sidebar
	}))

	// 配置路由及路由守卫
	app.use(router);

  // 国际化 i18n 配置
  await setupI18n(app);

	app.use(ArcoVue);
	app.mount('#app');
}

export { bootstrap };