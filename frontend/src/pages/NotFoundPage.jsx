/**
 * NotFoundPage.jsx — 404 page for unknown routes.
 *
 * Rendered for any path that does not match /, /staff, or /admin.
 * Stays on-brand: dark bg, yellow accent, Cairo font, RTL Arabic copy.
 */

import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg-dark text-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg text-center animate-fade-in-up">
          <div
            className="text-[120px] sm:text-[160px] leading-none font-black text-brand-yellow drop-shadow-[0_0_30px_rgba(252,211,77,0.35)]"
            aria-hidden="true"
          >
            404
          </div>

          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white">
            الصفحة غير موجودة
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/60 leading-relaxed">
            الرابط الذي طلبته لا يوجد أو تم نقله. تأكد من العنوان أو ارجع إلى
            الصفحة الرئيسية.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black font-black text-sm transition-colors"
            >
              ← العودة للرئيسية
            </Link>
            <Link
              to="/staff"
              className="px-5 py-2.5 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 font-bold text-sm transition-colors"
            >
              دخول الفريق
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
