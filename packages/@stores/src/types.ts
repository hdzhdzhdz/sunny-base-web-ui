import type { RouteLocationNormalized, RouteMeta } from 'vue-router';

export interface TabDefinition extends Partial<RouteLocationNormalized> {
  key?: string;
  name?: string | symbol;
  path: string;
  fullPath?: string;
  meta: RouteMeta & {
    title?: string;
    affixTab?: boolean;
    newTabTitle?: string | any;
    hideInTab?: boolean;
    keepAlive?: boolean;
    maxNumOfOpenTab?: number;
    affixTabOrder?: number;
  };
}
