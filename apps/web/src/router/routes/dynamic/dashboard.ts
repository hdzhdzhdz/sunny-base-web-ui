import type { RouteRecordRaw } from 'vue-router';
import BasicLayout from '#/layouts/basic-layout/index.vue';

const dashboard: RouteRecordRaw = {
  path: '/dashboard',
  component: BasicLayout,
  redirect: '/dashboard/index',
  children: [
    {
      path: 'index',
      name: 'Dashboard',
      component: () => import('#/views/dashboard/index.vue'),
      meta: {
        title: 'Dashboard',
        icon: 'lucide:layout-dashboard',
        affix: true,
      },
    },
  ],
};

export default [dashboard];
