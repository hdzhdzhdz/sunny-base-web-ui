import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import LoginPage from '../pages/core/Login';
import HomePage from '../pages/Home';
import { ErrorBoundary } from '@core/ui';
import AppLayout from '../layout/AppLayout';

const RootLayout = () => {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        // 登录后的主布局
        path: '/',
        element: <AppLayout />,
        children: [
          {
            path: 'dashboard',
            element: <HomePage />,
          },
          // 默认跳转到 dashboard
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
        ]
      },
    ],
  },
]);
