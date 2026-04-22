import { computed, type ComputedRef } from 'vue';
import { useUserStore } from '@sunny-base-web/stores';

interface UseUserReturn {
  code: ComputedRef<string>;
  name: ComputedRef<string>;
  roles: ComputedRef<string[]>;
  isSuperAdmin: ComputedRef<boolean>;
  homePath: ComputedRef<string>;
  agent: ComputedRef<Record<string, any> | undefined>;
  userInfo: ComputedRef<any>;
}

/**
 * 用户信息便捷访问 Hook
 *
 * 封装 userStore，提供常用用户属性的 computed 快捷访问
 *
 * @example
 * const { code, name, roles, isSuperAdmin } = useUser()
 * console.log(code.value) // 'EMP001'
 */
export function useUser(): UseUserReturn {
  const userStore = useUserStore();
  const userInfo = userStore.userInfo;

  return {
    code: computed(() => userInfo?.code ?? ''),
    name: computed(() => userInfo?.name ?? ''),
    roles: computed(() => userInfo?.roles ?? []),
    isSuperAdmin: computed(() => userInfo?.superAdmin ?? false),
    homePath: computed(() => userInfo?.homePath ?? ''),
    agent: computed(() => userInfo?.agent),
    userInfo: computed(() => userInfo),
  };
}
