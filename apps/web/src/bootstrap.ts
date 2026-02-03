import { createApp } from "vue";
import App from './App.vue';

import "@arco-design/web-vue/dist/arco.css";
import "./style.css";
import ArcoVue from "@arco-design/web-vue";

import { createEffects } from '@sunny-base-web/effects'

import { router } from './router';
import { setupI18n, registerMessageLoader, serverDataToClientData, setLocale } from '@sunny-base-web/utils';
import i18nOptions from './locale';
import { findAllStaticFrontI18n } from '@sunny-base-web/effects';

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
	setupI18n(app, i18nOptions);

	// 注册国际化语言包加载器
	registerMessageLoader(async (locale) => {
		try {
			const res = await findAllStaticFrontI18n({ cLang: locale });
			if (res && res.result) {
				return serverDataToClientData(res.result);
			}
		} catch (error) {
			console.error('Failed to fetch i18n messages:', error);
		}
		return {};
	});

	// Initialize with current locale
	await setLocale(i18nOptions.locale as any);

	app.use(ArcoVue);
	app.mount('#app');
}

export { bootstrap };