import { createApp } from "vue";
import App from './App.vue';

import "@arco-design/web-vue/dist/arco.css";
import "./style.css";
import "./arco.css";
import ArcoVue from "@arco-design/web-vue";

import { createEffects, setupBusinessForm, requestClient, loadingManager } from '@sunny-base-web/effects'

import { router } from './router';
import { setupI18n } from '#/locales';

import { initStores, useSettingsStore } from '@sunny-base-web/stores';
import { preferences } from './preferences';

import VxeUITable, { VXETable } from 'vxe-table'
import 'vxe-table/es/style.css'

import VxeUIBase, { VxeUI } from 'vxe-pc-ui'
import 'vxe-pc-ui/es/style.css'
import VxeUIPluginRenderArco from '@vxe-ui/plugin-render-arco'
import '@vxe-ui/plugin-render-arco/dist/style.css'
VxeUI.use(VxeUIPluginRenderArco)

import { setupApiLoadingInterceptor } from './utils/api-loading-interceptor';
import { setupLoadingDebugTool } from './utils/loading-debug';

async function bootstrap(namespace: string) {
	const app = createApp(App);

	// 开发环境：加载调试工具
	if (import.meta.env.DEV) {
		setupLoadingDebugTool();
	}

	// ========== 应用启动时显示加载动画 ==========
	// 在 Vue 应用挂载前显示加载动画，避免白屏
	if (preferences.transition.loading.enableRouteLoading &&
	    preferences.transition.loading.type !== 'nprogress') {
		loadingManager.startLoading();
	}

	// ========== 全局错误处理 ========== todo 后续接入sentry
	// 1. Vue 组件错误处理器
	// app.config.errorHandler = (err, instance, info) => {
	// 	const error = err as Error;

	// 	// 显示错误提示，避免白屏
	// 	Message.error({
	// 		content: `应用发生错误: ${error.message}`,
	// 		duration: 5000,
	// 		closable: true,
	// 	});

	// 	// 开发环境打印详细错误信息
	// 	if (import.meta.env.DEV) {
	// 		console.group('🔴 Vue Error');
	// 		console.error('Error:', error);
	// 		console.error('Component:', instance?.$options?.name || 'Unknown');
	// 		console.error('Error Info:', info);
	// 		console.error('Stack:', error.stack);
	// 		console.groupEnd();
	// 	}

	// 	// 生产环境上报错误
	// 	if (import.meta.env.PROD) {
	// 		reportError(error, {
	// 			component: instance?.$options?.name,
	// 			info,
	// 		});
	// 	}
	// };

	// // 2. 处理未捕获的 Promise 错误
	// window.addEventListener('unhandledrejection', (event) => {
	// 	const error = event.reason instanceof Error
	// 		? event.reason
	// 		: new Error(String(event.reason));

	// 	// 显示错误提示
	// 	Message.error({
	// 		content: '异步操作发生错误',
	// 		duration: 5000,
	// 		closable: true,
	// 	});

	// 	// 开发环境打印详细错误
	// 	if (import.meta.env.DEV) {
	// 		console.group('🔴 Unhandled Promise Rejection');
	// 		console.error('Reason:', event.reason);
	// 		console.error('Promise:', event.promise);
	// 		console.groupEnd();
	// 	}

	// 	// 生产环境上报错误
	// 	if (import.meta.env.PROD) {
	// 		reportUnhandledRejection(event);
	// 	}

	// 	// 阻止默认行为（控制台报错）
	// 	event.preventDefault();
	// });

	// // 3. 处理全局 JavaScript 错误
	// window.addEventListener('error', (event) => {
	// 	// 开发环境打印详细错误
	// 	if (import.meta.env.DEV) {
	// 		console.group('🔴 Global Error');
	// 		console.error('Message:', event.message);
	// 		console.error('Filename:', event.filename);
	// 		console.error('Line:', event.lineno, 'Column:', event.colno);
	// 		console.error('Error:', event.error);
	// 		console.groupEnd();
	// 	}

	// 	// 生产环境上报错误
	// 	if (import.meta.env.PROD) {
	// 		reportGlobalError(event);
	// 	}
	// });

	// ========== 初始化应用 ==========

	// 配置 pinia-store
	await initStores(app as any, { namespace });

	// 初始化设置（恢复保存的主题色等）
	const settingsStore = useSettingsStore();
	settingsStore.initSettings();

	// 配置 vxe-table 全局行高（必须在 app.use 之前）
	VXETable.setConfig({
		table: {
			rowHeight: settingsStore.tableRowHeight,
		}
	});

	// 注册 @effects 业务组件包的全局配置
	// 作用：统一注入 API 前缀和 SSO 地址，使 Login 等组件能自动获取配置，
	// 无需在每个页面单独传递 api-prefix 等属性，实现业务逻辑解耦。
	app.use(createEffects({
		apiPrefix: preferences.app.apiPrefix,
		ssoUrl: preferences.app.ssoUrl,
		locale: preferences.app.locale,
    onLocaleChange: (locale) => {
      preferences.app.locale = locale;
      localStorage.setItem('app-locale', locale);
    },
		enableRefreshToken: preferences.app.enableRefreshToken,
		publicKey: preferences.app.publicKey,
		app: {
			name: preferences.app.name
		},
		header: preferences.header,
		logo: preferences.logo,
		sidebar: preferences.sidebar
	}))

	// 初始化 BusinessSearch 业务搜索适配器
	// 自定义 loadConfig 处理后端返回的 res.result 包装
	setupBusinessForm({
		config: {
			apiPrefix: preferences.app.apiPrefix,
			businessSearchAdapter: {
				loadConfig: async (cNum: string) => {
					const res = await requestClient.post<any>('/core/assDialog/openInit', { cNum });
					// 后端接口返回格式为 { result: { ... } }，需要取 result 里的数据
					const data = res.result || res;
					return {
						title: data.cTitle,
						width: data.cWidth ? isNaN(Number(data.cWidth)) ? data.cWidth : `${data.cWidth}px` : undefined,
						contentHeight: data.cHeight ? isNaN(Number(data.cHeight)) ? data.cHeight : Number(data.cHeight) : 300,
						multiple: data.cSelectionMode !== 'single',
						formSchema: (data.conditions || []).map((item: any) => ({
							fieldName: item.prop,
							label: item.label,
							component: item.type === 'input' ? 'Input' : item.type === 'select' ? 'Select' : 'Input'
						})),
						tableColumns: (data.tableCols || []).map((item: any) => ({
							field: item.prop,
							title: item.label,
							width: item.width
						}))
					};
				}
			},
			customizeSelectAdapter: {
				query: async (params: any) => {
					const res = await requestClient.post('/core/assSelect/commonQuery', params);
					const data = (res as any)?.result || res;
					return {
						options: data?.optionList || [],
						config: data?.assSelect || undefined,
					};
				}
			},
			// ✅ Select 选项加载适配器
			// 用于批量加载字典选项，替代硬编码的本地 options 配置
			selectOptionsAdapter: {
				loadOptions: async (numbList, fieldMapping) => {
					const { label = 'cName', value = 'cXuhao' } = fieldMapping || {};

					// 调用后端接口批量加载字典选项
					const response = await requestClient.post<Record<string, any[]>>(
						'/core/contact/findAuthDictList',
						{ numbList }
					);

					const result = (response as any)?.result || response;
					const optionsMap: Record<string, any[]> = {};

					// 转换每个字典的选项
					Object.keys(result).forEach((dictCode) => {
						const dataList = result[dictCode] || [];
						optionsMap[dictCode] = dataList.map((item: any) => ({
							label: String(item[label] || ''),
							value: item[value],
							...item,  // 保留原始字段（id, cConnkey 等）
						}));
					});

					return optionsMap;
				},
			},
		}
	})

	// 配置路由及路由守卫
	app.use(router);

	// 初始化 API 加载拦截器
	setupApiLoadingInterceptor();

	// 国际化 i18n 配置
	await setupI18n(app);

	app.use(ArcoVue);
	app.use(VxeUITable)
	app.use(VxeUIBase)
	app.mount('#app');
}

export { bootstrap };
