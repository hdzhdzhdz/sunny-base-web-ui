
import logoUrl from './assets/core/logo.png';

const savedLocale = localStorage.getItem('app-locale');

export const preferences = {
	app: {
		name: 'Sunny Base Web',
		defaultHomePath: '/analytics',
		loginPath: '/auth/login',
		apiPrefix: '/base/test',
		ssoUrl: 'http://crm.example.com',
		locale: savedLocale || 'zh-CN',
		enableRefreshToken: false,
		publicKey: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD53wuS+lS/MykwWNdFyA62Sel9obolv85tukqxlDIXitvdGcT4G3ZsCs14BZuA0QhbAv6QIWTCb8Lyi+mLfC/vdNUoHzyyiOoA3setWeCn8WbDKScEG1fb21H3HLOUzAjhPwkosoqaZtCzNgOfdkmMnK4+zScdAe857YsWXuDSdQIDAQAB'
	},
	header: {
		height: 50,
	},
	logo: {
		enable: true,
		fit: 'contain',
		source: logoUrl,
	},
	sidebar: {
		width: 224,
	},  
	transition: {
		enable: true,
		name: 'fade-slide',
		progress: {
			enable: true, // 保持向后兼容
		},
		// 加载动画配置
		loading: {
			/**
			 * 全局加载动画类型
			 * - 'nprogress': 顶部进度条（默认，向后兼容）
			 * - 'spinner': 方块跳跃动画
			 * - 'loading': 四点旋转动画
			 * - 'none': 禁用加载动画
			 */
			type: 'spinner' as 'nprogress' | 'spinner' | 'loading' | 'none',

			/**
			 * 路由切换时是否显示加载动画
			 */
			enableRouteLoading: true,

			/**
			 * API 请求时是否显示全局加载动画
			 */
			enableApiLoading: false,

			/**
			 * 最小加载时间（毫秒），避免闪烁
			 */
			minLoadingTime: 50,
		},
	},
}