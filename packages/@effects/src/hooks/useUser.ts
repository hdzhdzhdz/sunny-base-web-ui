import { computed, type ComputedRef } from 'vue';
import { useUserStore, useAccessStore } from '@sunny-base-web/stores';

interface UseUserReturn {
  code: ComputedRef<string>;
  name: ComputedRef<string>;
  roles: ComputedRef<string[]>;
  isSuperAdmin: ComputedRef<boolean>;
  homePath: ComputedRef<string>;
  agent: ComputedRef<Record<string, any> | undefined>;
  userInfo: ComputedRef<any>;
  token: ComputedRef<string | null>;
}

/**
 * 用户信息便捷访问 Hook
 *
 * 封装 userStore + accessStore，提供常用用户属性和 token 的 computed 快捷访问
 *
 * @example
 * const { code, name, token } = useUser()
 * console.log(code.value) // 'EMP001'
 * console.log(token.value) // 'eyJhbGci...'
 */
export function useUser(): UseUserReturn {
  const userStore = useUserStore();
  const accessStore = useAccessStore();
  const userInfo = userStore.userInfo;

  return {
    code: computed(() => userInfo?.code ?? ''),
    name: computed(() => userInfo?.name ?? ''),
    roles: computed(() => userInfo?.roles ?? []),
    isSuperAdmin: computed(() => userInfo?.superAdmin ?? false),
    homePath: computed(() => userInfo?.homePath ?? ''),
    agent: computed(() => userInfo?.agent),
    userInfo: computed(() => userInfo),
    token: computed(() => accessStore.accessToken),
  };
}
