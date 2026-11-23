import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Warning } from '@phosphor-icons/react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center selection:bg-primary selection:text-canvas">
      <div className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center text-muted mb-4">
        <Warning size={28} />
      </div>
      <span className="text-xs uppercase tracking-widest text-muted font-mono font-semibold">
        Error 404 — Endpoint Not Found
      </span>
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mt-2 uppercase tracking-tight">
        Destination Not Found
      </h1>
      <p className="text-xs sm:text-sm text-muted mt-2 max-w-sm leading-relaxed">
        The requested archival link, consignment, or route does not exist or has been restricted.
      </p>
      <div className="mt-6">
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-tight hover:opacity-90 transition-opacity min-h-[44px]"
        >
          <ArrowLeft size={14} />
          <span>Return to Catalogue</span>
        </Link>
      </div>
    </div>
  );
}
