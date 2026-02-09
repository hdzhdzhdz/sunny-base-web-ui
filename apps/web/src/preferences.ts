
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
		loading: true,
		name: 'fade-slide',
		progress: true,
	},
}