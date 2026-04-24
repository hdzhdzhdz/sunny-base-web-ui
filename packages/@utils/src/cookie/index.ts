/**
 * 获取 Cookie 中指定 key 的值
 * @param name Cookie key
 * @returns Cookie 值，不存在时返回 null
 */
export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()\[\]\\\/+^])/g, '\\$1')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * 设置 Cookie
 * @param name Cookie key
 * @param value Cookie 值
 * @param options 可选配置（过期天数、path 等）
 */
export function setCookie(name: string, value: string, options?: { days?: number; path?: string }) {
  const { days, path = '/' } = options || {};
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}`;
  if (days) {
    const expires = new Date(Date.now() + days * 864e5);
    cookie += `; expires=${expires.toUTCString()}`;
  }
  document.cookie = cookie;
}
