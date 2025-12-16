'use client';

import { useTranslations } from 'next-intl';

export function Header() {
  const t = useTranslations('layout.header');

  return (
    <header className="rounded-xl bg-panel shadow-soft border border-outline px-6 py-4 flex items-center justify-between">
      <div>
        <p className="text-lg font-semibold text-white">{t('title')}</p>
        <p className="text-sm text-slate-400">{t('subtitle')}</p>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <span className="inline-flex h-3 w-3 rounded-full bg-emerald-400" aria-hidden />
        <span>CDP Proxy</span>
      </div>
    </header>
  );
}
