'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { useConnectionStore } from '../../state/connection-store';

export function Sidebar() {
  const t = useTranslations();
  const { targets, refreshTargets, connect, status, activeTargetId, disconnect } = useConnectionStore();

  useEffect(() => {
    void refreshTargets();
  }, [refreshTargets]);

  return (
    <aside className="rounded-xl bg-panel shadow-soft border border-outline p-4 flex flex-col gap-4 min-w-[260px]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{t('layout.sidebar.connection')}</p>
          <p className="text-xs text-slate-400">{t('layout.sidebar.status')}</p>
        </div>
        <span
          className={clsx('text-xs px-3 py-1 rounded-lg border', {
            'border-emerald-500 text-emerald-300': status === 'connected',
            'border-sky-500 text-sky-300': status === 'connecting',
            'border-slate-600 text-slate-300': status === 'idle',
            'border-rose-500 text-rose-300': status === 'error',
          })}
        >
          {t(`connection.status.${status}` as const)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex-1 rounded-lg bg-accent/10 text-accent border border-accent/60 px-3 py-2 text-sm font-semibold hover:bg-accent/20 transition"
          onClick={() => void refreshTargets()}
        >
          {t('layout.sidebar.refresh')}
        </button>
        <button
          type="button"
          className="rounded-lg border border-outline px-3 py-2 text-sm hover:border-slate-500"
          onClick={disconnect}
        >
          {t('buttons.disconnect')}
        </button>
      </div>

      <div>
        <p className="text-sm font-semibold text-white mb-2">{t('layout.sidebar.targets')}</p>
        {targets.length === 0 ? (
          <p className="text-xs text-slate-400">{t('targets.empty')}</p>
        ) : (
          <ul className="space-y-2">
            {targets.map((target) => (
              <li key={target.id}>
                <button
                  type="button"
                  className={clsx(
                    'w-full text-left rounded-xl border px-3 py-3 transition shadow-soft/30',
                    activeTargetId === target.id
                      ? 'border-accent bg-accent/15 text-white'
                      : 'border-outline bg-panel/80 hover:border-slate-500',
                  )}
                  onClick={() => connect(target.id)}
                >
                  <p className="text-sm font-semibold">{target.title || target.url}</p>
                  <p className="text-[11px] text-slate-400 truncate">{target.url}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
