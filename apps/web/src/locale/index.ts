import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': {
      '账号': '账号',
      '请输入账号': '请输入账号',
      '密码': '密码',
      '请输入密码': '请输入密码',
      '语言': '语言',
      '请选择语言': '请选择语言',
      '登录': '登录',
      '未获取到Mac地址': '未获取到Mac地址',
      '如果您无法获取到MAC地址，请先下载并安装插件': '如果您无法获取到MAC地址，请先下载并安装插件',
      '下载地址1': '下载地址1',
      '下载地址2': '下载地址2',
      '公司内部人员另外登录途径': '公司内部人员另外登录途径',
      '单点登录': '单点登录',
      '向右滑动': '向右滑动'
    },
    'en-US': {
      '账号': 'Username',
      '请输入账号': 'Please enter username',
      '密码': 'Password',
      '请输入密码': 'Please enter password',
      '语言': 'Language',
      '请选择语言': 'Please select language',
      '登录': 'Login',
      '未获取到Mac地址': 'MAC address not found',
      '如果您无法获取到MAC地址，请先下载并安装插件': 'If you cannot get the MAC address, please download and install the plugin first',
      '下载地址1': 'Download 1',
      '下载地址2': 'Download 2',
      '公司内部人员另外登录途径': 'Alternative login for internal staff',
      '单点登录': 'SSO',
      '向右滑动': 'Slide to right'
    }
  }
});

export default i18n;
