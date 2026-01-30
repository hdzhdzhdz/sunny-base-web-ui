import { accessRoutes } from './routes';

export async function generateAccess(params: { roles: string[] }) {
  // Simple implementation: return all access routes
  // In a real app, filter based on roles
  return {
    accessibleMenus: [],
    accessibleRoutes: accessRoutes,
  };
}
