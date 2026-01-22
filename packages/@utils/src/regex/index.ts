/**
 * 常用正则表达式集合
 */
export const patterns = {
  /**
   * 非空字符串
   */
  nonEmpty: {
    pattern: /^\S+$/,
    message: '不能为空',
    placeholder: '请输入内容'
  },
  /**
   * 仅字母（大小写）
   */
  letters: {
    pattern: /^[a-zA-Z]+$/,
    message: '仅支持输入英文字符',
    placeholder: 'abc',
    filter: (val: string) => val.replace(/[^a-zA-Z]/g, '')
  },
  /**
   * 字母+数字
   */
  alphanumeric: {
    pattern: /^[a-zA-Z0-9]+$/,
    message: '仅支持输入字母和数字',
    placeholder: 'abc123',
    filter: (val: string) => val.replace(/[^a-zA-Z0-9]/g, '')
  },
  /**
   * 用户名 (字母+数字+下划线)
   */
  username: {
    pattern: /^[a-zA-Z0-9_]+$/,
    message: '仅支持字母、数字和下划线',
    placeholder: 'user_123',
    filter: (val: string) => val.replace(/[^a-zA-Z0-9_]/g, '')
  },
  /**
   * 国际电话 (含+号)
   */
  internationalPhone: {
    pattern: /^\+[1-9]\d{0,14}$/,
    message: '请输入正确的国际电话号码',
    placeholder: '+8613800138000',
    filter: (val: string) => val.replace(/[^0-9+]/g, '')
  },
  /**
   * 身份证号 (15位旧版)
   */
  idCard15: {
    pattern: /^[1-9]\d{5}\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}$/,
    message: '请输入正确的15位身份证号码',
    placeholder: '110101900101123',
    filter: (val: string) => val.replace(/[^\d]/g, '').slice(0, 15)
  },
  /**
   * 百分比 (0-100)
   */
  percentage: {
    pattern: /^(100(\.0{1,2})?|([1-9]?\d)(\.\d{1,2})?)$/,
    message: '请输入0-100之间的数字',
    placeholder: '50.00',
    filter: (val: string) => val.replace(/[^0-9.]/g, '')
  },
  /**
   * 密码强度 (强)
   */
  passwordStrong: {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message: '至少8位，包含大小写字母、数字和特殊符号',
    placeholder: 'Pass123@',
    filter: (val: string) => val.replace(/\s/g, '')
  },
  /**
   * 密码强度 (中)
   */
  passwordMedium: {
    pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
    message: '至少6位，包含字母和数字',
    placeholder: 'Pass123',
    filter: (val: string) => val.replace(/[^a-zA-Z0-9]/g, '')
  },
  /**
   * 时间 (HH:MM:SS)
   */
  time: {
    pattern: /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
    message: '请输入正确的时间 (HH:MM:SS)',
    placeholder: '12:30:45',
    filter: (val: string) => val.replace(/[^0-9:]/g, '').slice(0, 8)
  },
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入正确的11位手机号码',
    placeholder: '13800138000',
    filter: (val: string) => val.replace(/[^\d]/g, '').slice(0, 11)
  },
  /**
   * 电子邮件
   */
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: '请输入正确的电子邮箱地址',
    placeholder: 'example@domain.com',
    filter: (val: string) => val.replace(/[\u4e00-\u9fa5\s]/g, '') // 禁止中文和空格
  },
  /**
   * 身份证号 (中国大陆 18位)
   */
  idCard: {
    pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[1-2]\d|3[0-1])\d{3}[\dXx]$/,
    message: '请输入正确的18位身份证号码',
    placeholder: '110101199001011234',
    filter: (val: string) => val.replace(/[^\dxX]/g, '').slice(0, 18)
  },
  /**
   * 统一社会信用代码
   */
  creditCode: {
    pattern: /^[^_IOZSVa-z\W]{2}\d{6}[^_IOZSVa-z\W]{10}$/,
    message: '请输入正确的统一社会信用代码',
    placeholder: '91110000000000000X',
    filter: (val: string) => val.replace(/[^0-9A-Z]/g, '').slice(0, 18)
  },
  /**
   * 邮政编码 (中国大陆)
   */
  postalCode: {
    pattern: /^[1-9]\d{5}$/,
    message: '请输入正确的6位邮政编码',
    placeholder: '100000',
    filter: (val: string) => val.replace(/[^\d]/g, '').slice(0, 6)
  },
  /**
   * 中文字符
   */
  chinese: {
    pattern: /^[\u4e00-\u9fa5]+$/,
    message: '仅支持输入中文字符',
    placeholder: '中文',
    filter: (val: string) => val.replace(/[^\u4e00-\u9fa5]/g, '')
  },
  /**
   * 整数
   */
  integer: {
    pattern: /^-?\d+$/,
    message: '请输入整数',
    placeholder: '123',
    filter: (val: string) => val.replace(/[^\d-]/g, '')
  },
  /**
   * 正整数
   */
  positiveInteger: {
    pattern: /^[1-9]\d*$/,
    message: '请输入正整数',
    placeholder: '123',
    filter: (val: string) => val.replace(/[^\d]/g, '')
  },
  /**
   * 浮点数 (最多两位小数)
   */
  float2: {
    pattern: /^-?\d+(\.\d{1,2})?$/,
    message: '请输入数字 (最多两位小数)',
    placeholder: '123.45',
    filter: (val: string) => val.replace(/[^0-9.-]/g, '')
  },
  /**
   * URL 网址
   */
  url: {
    pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    message: '请输入正确的网址链接',
    placeholder: 'https://www.example.com'
  },
  /**
   * 密码强度 (最少6位，包含字母和数字)
   */
  passwordSimple: {
    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
    message: '密码至少6位，且包含字母和数字',
    placeholder: 'Pass123'
  },
  /**
   * IPv4 地址
   */
  ipv4: {
    pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
    message: '请输入正确的 IPv4 地址',
    placeholder: '192.168.1.1',
    filter: (val: string) => val.replace(/[^0-9.]/g, '')
  },
  /**
   * IPv4+端口
   */
  ipv4Port: {
    pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?):\d{1,5}$/,
    message: '请输入正确的 IPv4:Port',
    placeholder: '127.0.0.1:8080',
    filter: (val: string) => val.replace(/[^0-9.:]/g, '')
  },
  /**
   * HTML 标签
   */
  htmlTags: {
    pattern: /<[^>]+>/,
    message: '包含 HTML 标签',
    placeholder: '<div>',
  },
  /**
   * Emoji 表情
   */
  emoji: {
    pattern: /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u,
    message: '包含 Emoji 表情',
    placeholder: '😀',
  },
  /**
   * 座机号码 (支持分机号，如 010-12345678-123)
   */
  landline: {
    pattern: /^(\d{3,4}-)?\d{7,8}(-\d{1,4})?$/,
    message: '请输入正确的座机号码 (如: 010-88888888)',
    placeholder: '010-88888888',
    filter: (val: string) => val.replace(/[^\d-]/g, '')
  },
  /**
   * 银行卡号 (16-19位)
   */
  bankCard: {
    pattern: /^[1-9]\d{15,18}$/,
    message: '请输入正确的银行卡号',
    placeholder: '6222020200000000000',
    filter: (val: string) => val.replace(/[^\d]/g, '').slice(0, 19)
  },
  /**
   * 中国护照 (E/G/D/S/P开头)
   */
  passport: {
    pattern: /^([EGDSP])\d{8}$/,
    message: '请输入正确的中国护照号码',
    placeholder: 'E12345678',
    filter: (val: string) => val.replace(/[^EGDSP\d]/g, '').slice(0, 9)
  },
  /**
   * 车牌号 (包含新能源)
   */
  licensePlate: {
    pattern: /^([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z](([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳])$/,
    message: '请输入正确的车牌号码',
    placeholder: '京A88888',
    filter: (val: string) => val.replace(/[^\u4e00-\u9fa5A-Z0-9]/g, '').slice(0, 8)
  },
  /**
   * QQ 号码 (5-11位)
   */
  qq: {
    pattern: /^[1-9][0-9]{4,10}$/,
    message: '请输入正确的 QQ 号码',
    placeholder: '10001',
    filter: (val: string) => val.replace(/[^\d]/g, '').slice(0, 11)
  },
  /**
   * 微信号 (6-20位，字母开头)
   */
  wechat: {
    pattern: /^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/,
    message: '请输入正确的微信号',
    placeholder: 'wechat_id',
    filter: (val: string) => val.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20)
  },
  /**
   * 纯英文字符
   */
  english: {
    pattern: /^[a-zA-Z]+$/,
    message: '仅支持输入英文字符',
    placeholder: 'abc',
    filter: (val: string) => val.replace(/[^a-zA-Z]/g, '')
  },
  /**
   * 纯数字
   */
  number: {
    pattern: /^\d+$/,
    message: '仅支持输入数字',
    placeholder: '123',
    filter: (val: string) => val.replace(/[^\d]/g, '')
  },
  /**
   * 金额 (非负，最多两位小数)
   */
  money: {
    pattern: /^\d+(\.\d{1,2})?$/,
    message: '请输入正确的金额',
    placeholder: '100.00',
    filter: (val: string) => val.replace(/[^0-9.]/g, '')
  },
  /**
   * 日期 (YYYY-MM-DD)
   */
  date: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: '请输入正确的日期 (格式: YYYY-MM-DD)',
    placeholder: '2023-01-01',
    filter: (val: string) => val.replace(/[^\d-]/g, '').slice(0, 10)
  },
  /**
   * 16进制颜色
   */
  hexColor: {
    pattern: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
    message: '请输入正确的16进制颜色值',
    placeholder: '#FFFFFF',
    filter: (val: string) => val.replace(/[^#a-fA-F0-9]/g, '').slice(0, 7)
  },
  /**
   * MAC 地址
   */
  macAddress: {
    pattern: /^([0-9a-fA-F]{2}[:.-]){5}[0-9a-fA-F]{2}$/,
    message: '请输入正确的 MAC 地址',
    placeholder: '00:00:00:00:00:00',
    filter: (val: string) => val.replace(/[^0-9a-fA-F:.-]/g, '')
  },
  /**
   * IPv6 地址
   */
  ipv6: {
    pattern: /^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$/,
    message: '请输入正确的 IPv6 地址',
    placeholder: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    filter: (val: string) => val.replace(/[^0-9a-fA-F:]/g, '')
  }
};

export type PatternKey = keyof typeof patterns;

/**
 * 获取正则配置
 * @param key 正则键名
 */
export const getPattern = (key: PatternKey) => {
  return patterns[key];
};
