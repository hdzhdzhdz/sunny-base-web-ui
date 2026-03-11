import { defineStore } from 'pinia';

interface UserState {
  /**
   * 姓名
   */
  name: string;
  /**
   * 工号
   */
  code: string;
  /**
   * 角色
   */
  roles: string[];
  /**
   * 是否超级管理员
   */
  superAdmin: boolean;
  /**
   * 是否为弱密码
   */
  bWeakPwd: boolean;
  /**
   * 智能体配置信息
   */
  agent: Record<string, any>;
  /**
   * 资源权限
   */
  resources?: any[];
  /**
   * 首页路径
   */
  homePath?: string;
}

/**
 * @zh_CN 用户信息相关
 */
export const useUserStore = defineStore('core-user', {
  state: (): UserState => ({
    name: '',
    code: '',
    roles: [],
    superAdmin: false,
    bWeakPwd: false,
    agent: {},
    resources: [],
    homePath: '',
  }),
  getters: {
    userInfo(state): UserState {
      return state;
    },
  },
  actions: {
    setUserInfo(userInfo: Partial<UserState>) {
      this.$patch(userInfo);
    },
  },
});
