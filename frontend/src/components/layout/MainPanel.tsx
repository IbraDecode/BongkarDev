'use client';

import { useTranslations } from 'next-intl';
import { useConnectionStore } from '../../state/connection-store';

export function MainPanel() {
  const t = useTranslations();
  const { activeTargetId, status, targets } = useConnectionStore();
  const activeTarget = targets.find((target) => target.id === activeTargetId);

  return (
    <section className="rounded-2xl bg-panel shadow-soft border border-outline flex-1 p-6">
      <div className="mb-4">
        <p className="text-sm text-slate-400">{t('layout.sidebar.connection')}</p>
        <p className="text-lg font-semibold text-white">
          {activeTarget ? t('connection.active', { target: activeTarget.title || activeTarget.url }) : t('connection.none')}
        </p>
      </div>
      <div className="rounded-xl border border-dashed border-outline bg-black/30 p-6 text-slate-300 text-sm leading-relaxed">
        <p>{t('layout.main.placeholder')}</p>
        <ul className="mt-3 list-disc list-inside text-xs text-slate-400 space-y-1">
          <li>Network, Console, Elements, Sources, Performance</li>
          <li>Live data via WebSocket proxy (bukan direct CDP)</li>
          <li>Status koneksi: {status}</li>
        </ul>
      </div>
    </section>
  );
}
