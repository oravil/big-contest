/**
 * App.jsx — top-level router.
 *
 * Routes:
 *   /       → PublicPage    (winners hall, public)
 *   /staff  → StaffPage     (password-gated 5-step redemption flow)
 *   /admin  → AdminPage     (admin-only management dashboard)
 *   *       → NotFoundPage  (404)
 *
 * The whole tree is wrapped in <ErrorBoundary> so any render-time error
 * in a page or component shows a friendly fallback instead of a blank page.
 *
 * Auth state for the staff and admin pages lives in React useState only —
 * never persisted to localStorage / sessionStorage / cookies (by design).
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import PublicPage from './pages/PublicPage';
import StaffPage from './pages/StaffPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
