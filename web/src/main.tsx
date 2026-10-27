import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import './index.css';
import { Layout, RequireAuth } from './components/Layout';
import { ApiError } from './lib/api';
import { AuthProvider, useAuth } from './lib/auth';
import { AuthScreen, VerifyEmailPage } from './pages/Auth';
import { ApplicantsPage, CompanySettingsPage, EmployerDashboard, InternshipFormPage } from './pages/employer';
import { ApplicantsBoardPage } from './pages/employerApplicants';
import Home from './pages/Home';
import InternshipsPage from './pages/Internships';
import MessagesPage from './pages/Messages';
import { CompaniesPage, CompanyPage, EmployersPage, InternshipPage, NotFound } from './pages/Public';
import SavedPage from './pages/Saved';
import SettingsPage from './pages/Settings';
import { ApplicationPage, ProfilePage, StudentDashboard, StudentHome } from './pages/student';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Don't retry "not found"/"forbidden"; do retry flaky network errors.
      retry: (count, err) => !(err instanceof ApiError && err.status < 500) && count < 2,
    },
  },
});

function Dashboard() {
  const { user } = useAuth();
  return user?.role === 'employer' ? <EmployerDashboard /> : <StudentDashboard />;
}

/** Where people land after signing in. Employers have no separate home, so theirs is the dashboard. */
function SignedInHome() {
  const { user } = useAuth();
  return user?.role === 'employer' ? <Navigate to="/dashboard" replace /> : <StudentHome />;
}

function Root() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}

// On GitHub Pages the app lives under /<repo>/, set via VITE_BASE at build time.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/internships', element: <InternshipsPage /> },
      { path: '/internships/:id', element: <InternshipPage /> },
      { path: '/companies', element: <CompaniesPage /> },
      { path: '/companies/:slug', element: <CompanyPage /> },
      { path: '/employers', element: <EmployersPage /> },
      // One component for both, so switching tabs animates instead of remounting the page.
      { path: '/login', element: <AuthScreen /> },
      { path: '/signup', element: <AuthScreen /> },
      // Sign-in is Google only, so old password-reset links just go to log in.
      { path: '/forgot-password', element: <Navigate to="/login" replace /> },
      { path: '/reset-password', element: <Navigate to="/login" replace /> },
      { path: '/verify-email', element: <VerifyEmailPage /> },

      { path: '/home', element: <RequireAuth><SignedInHome /></RequireAuth> },
      { path: '/dashboard', element: <RequireAuth><Dashboard /></RequireAuth> },
      { path: '/messages/:id?', element: <RequireAuth><MessagesPage /></RequireAuth> },
      { path: '/settings', element: <RequireAuth><SettingsPage /></RequireAuth> },

      { path: '/profile', element: <RequireAuth role="student"><ProfilePage /></RequireAuth> },
      { path: '/saved', element: <RequireAuth role="student"><SavedPage /></RequireAuth> },
      { path: '/applications/:id', element: <RequireAuth role="student"><ApplicationPage /></RequireAuth> },

      { path: '/employer/applicants', element: <RequireAuth role="employer"><ApplicantsBoardPage /></RequireAuth> },
      { path: '/employer/company', element: <RequireAuth role="employer"><CompanySettingsPage /></RequireAuth> },
      { path: '/employer/internships/new', element: <RequireAuth role="employer"><InternshipFormPage /></RequireAuth> },
      { path: '/employer/internships/:id/edit', element: <RequireAuth role="employer"><InternshipFormPage /></RequireAuth> },
      { path: '/employer/internships/:id/applicants', element: <RequireAuth role="employer"><ApplicantsPage /></RequireAuth> },

      { path: '*', element: <NotFound /> },
    ],
  },
], { basename });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors closeButton />
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
