import { defineStore } from 'pinia';

interface AccessState {
  accessToken: string | null;
  isAccessChecked: boolean;
}

export const useAccessStore = defineStore('core-access', {
  state: (): AccessState => ({
    accessToken: null,
    isAccessChecked: false,
  }),
  actions: {
    setAccessToken(token: string | null) {
      this.accessToken = token;
    },
    setIsAccessChecked(isChecked: boolean) {
      this.isAccessChecked = isChecked;
    },
  },
  persist: {
    // 持久化
    pick: [
      'accessToken',
    ],
  },
});
