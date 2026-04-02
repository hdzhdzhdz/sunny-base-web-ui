/**
 * @permission 权限选项模块
 * Permission options module
 * @description 提供权限选项的自动加载和缓存管理
 * @description Provides automatic loading and caching management for permission options
 */

// Hook
export {
  usePermissionOptions,
  type UsePermissionOptionsParams,
  type UsePermissionOptionsReturn,
} from './use-permission-options';

// Schema 集成
export {
  useSchemaPermissionLoader,
  collectSchemaPermissionCodes,
  type PermissionOptionsDeclaration,
  type SchemaPermissionLoaderReturn,
} from './use-schema-permission-loader';

// 管理器
export { permissionOptionsManager } from './permission-options-manager';

// 适配器
export { permissionOptionsAdapter } from './permission-options-adapter';
