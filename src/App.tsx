import { createHashRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AppShell } from '@shared/layout/AppShell';
import { Spinner } from '@shared/ui/Spinner/Spinner';

const CookbookPage = lazy(() => import('@cookbook/CookbookPage'));
const RecipeDetailPage = lazy(() => import('@cookbook/RecipeDetailPage'));
const BuilderPage = lazy(() => import('@builder/BuilderPage'));

const isDev = import.meta.env.DEV;

function Layout() {
  return (
    <AppShell>
      <Suspense fallback={<Spinner />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}

const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <CookbookPage /> },
      { path: '/recipe/:id', element: <RecipeDetailPage /> },
      ...(isDev
        ? [{ path: '/builder', element: <BuilderPage /> }]
        : [{ path: '/builder', element: <Navigate to="/" replace /> }]
      ),
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
