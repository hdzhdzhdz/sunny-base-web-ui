import type { RouteLocationNormalized, RouteMeta } from 'vue-router';
import type { ComputedRef } from 'vue';

export interface TabDefinition extends Partial<RouteLocationNormalized> {
  key?: string;
  name?: string | symbol | null;
  path: string;
  fullPath?: string;
  meta: RouteMeta & {
    title?: string;
    affixTab?: boolean;
    newTabTitle?: string | ComputedRef<string>;
    hideInTab?: boolean;
    keepAlive?: boolean;
    maxNumOfOpenTab?: number;
    affixTabOrder?: number;
  };
}
