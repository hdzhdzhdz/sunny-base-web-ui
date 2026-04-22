import { computed } from 'vue';
import { useUserStore } from '@sunny-base-web/stores';

/**
 * 用户信息便捷访问 Hook
 *
 * 封装 userStore，提供常用用户属性的 computed 快捷访问
 *
 * @example
 * const { code, name, roles, isSuperAdmin } = useUser()
 * console.log(code.value) // 'EMP001'
 */
export function useUser() {
  const userStore = useUserStore();

  const code = computed(() => userStore.userInfo?.code ?? '');
  const name = computed(() => userStore.userInfo?.name ?? '');
  const roles = computed(() => userStore.userInfo?.roles ?? []);
  const isSuperAdmin = computed(() => userStore.userInfo?.superAdmin ?? false);
  const homePath = computed(() => userStore.userInfo?.homePath ?? '');
  const agent = computed(() => userStore.userInfo?.agent);

  return {
    code,
    name,
    roles,
    isSuperAdmin,
    homePath,
    agent,
    /** 完整的 userInfo 对象 */
    userInfo: computed(() => userStore.userInfo),
  };
}
