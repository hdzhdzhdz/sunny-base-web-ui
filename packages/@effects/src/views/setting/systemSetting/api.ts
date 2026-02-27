import { requestClient } from '@sunny-base-web/effects'

/**
 * 系统设置项
 */
export interface SysSettingItem {
  cNum: string
  cValue: string
  nickName?: string
  type?: string
  hintMsg?: string
}

/**
 * 获取所有系统设置
 */
export function findAllSettings() {
  return requestClient.post<{ result: SysSettingItem[] }>('/core/assSysSetting/findAllSettings', {})
}

/**
 * 保存所有系统设置
 */
export function saveAllSettings(settings: SysSettingItem[]) {
  return requestClient.post('/core/assSysSetting/saveAllSettings', {
    assSysSettingList: settings
  })
}
