/**
 * ErrorBoundary.jsx — top-level React error boundary.
 *
 * Catches render-time JavaScript errors anywhere below it in the tree and
 * renders a friendly Arabic fallback instead of a blank page.
 *
 * Usage: wrap <BrowserRouter> (or any subtree) in <ErrorBoundary>.
 *
 * Note: error boundaries in React must be class components — there is no
 * hooks-based equivalent for componentDidCatch / getDerivedStateFromError.
 */

import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to the console for developer visibility. In production this is
    // where you would forward to Sentry / a logging endpoint.
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const message =
      (this.state.error && this.state.error.message) || 'خطأ غير معروف';

    return (
      <div className="min-h-screen bg-bg-dark text-white flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg text-center animate-fade-in-up">
          <div className="text-6xl mb-3" aria-hidden="true">
            💥
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-status-expired">
            حدث خطأ غير متوقع
          </h1>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            عذراً، صادفنا مشكلة أثناء عرض هذه الصفحة. يمكنك إعادة المحاولة أو
            العودة للصفحة الرئيسية.
          </p>

          <pre
            dir="ltr"
            className="mt-4 text-xs text-white/40 bg-bg-card border border-white/10 rounded-lg px-3 py-2 overflow-x-auto text-left"
          >
            {message}
          </pre>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-xl bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black font-black text-sm transition-colors"
            >
              إعادة تحميل الصفحة ↻
            </button>
            <button
              type="button"
              onClick={this.handleHome}
              className="px-5 py-2.5 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 font-bold text-sm transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }
}
