'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';

import { useAdminSession } from '@/components/admin/AdminGuard';
import { AdminShell } from '@/components/admin/AdminShell';
import { fetchAdminSettings, updateAdminSetting } from '@/lib/admin/client';
import type { AdminSettingsItem } from '@/lib/admin/types';

export default function AdminSettingsPage() {
  return (
    <AdminShell>
      <SettingsContent />
    </AdminShell>
  );
}

function SettingsContent() {
  const [settings, setSettings] = useState<AdminSettingsItem[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const { csrf, ready } = useAdminSession();

  useEffect(() => {
    if (!ready || !csrf) return;

    fetchAdminSettings(csrf).then((data) => {
      setSettings(data);
    });
  }, [csrf, ready]);

  const updateSetting = async (item: AdminSettingsItem, nextValue: string) => {
    setSaving(item.key);
    await updateAdminSetting(item.key, JSON.parse(nextValue), csrf);
    setSaving(null);
  };

  return (
    <div className="space-y-12">
      <header className="border-b-4 border-[var(--color-poster-ink)] pb-6 mb-8">
        <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-poster-green)] mb-2">Configuration</p>
        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-[var(--color-poster-ink)]">Settings</h1>
      </header>

      <div className="space-y-8">
        {settings.length === 0 ? (
          <div className="border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-paper-light)] p-12 text-center shadow-[6px_6px_0px_var(--color-poster-ink)]">
            <p className="text-xl font-bold uppercase tracking-widest text-[var(--color-poster-ink)] opacity-50">Loading Settings...</p>
          </div>
        ) : (
          settings.map((item) => (
            <SettingRow key={item.key} item={item} onSave={updateSetting} savingKey={saving} />
          ))
        )}
      </div>
    </div>
  );
}

function SettingRow({
  item,
  onSave,
  savingKey,
}: {
  item: AdminSettingsItem;
  onSave: (item: AdminSettingsItem, value: string) => void;
  savingKey: string | null;
}) {
  const [value, setValue] = useState(item.value_json);
  const isSaving = savingKey === item.key;

  return (
    <div className="border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-paper-light)] p-6 md:p-8 shadow-[6px_6px_0px_var(--color-poster-ink)] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_var(--color-poster-ink)]">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-[var(--color-poster-ink)]">{item.key}</h2>
          <span className={`mt-2 inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-[var(--color-poster-ink)] ${item.is_secret ? 'bg-[var(--color-poster-red)] text-[var(--color-poster-paper)]' : 'bg-[var(--color-poster-mustard)] text-[var(--color-poster-ink)]'}`}>
            {item.is_secret ? 'Top Secret' : 'Public'}
          </span>
        </div>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => onSave(item, value)}
          className="inline-flex items-center justify-center gap-2 border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-green)] px-6 py-3 font-black uppercase tracking-wider text-[var(--color-poster-ink)] hover:bg-[var(--color-poster-ink)] hover:text-[var(--color-poster-green)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_var(--color-poster-ink)] hover:shadow-none hover:translate-y-1 hover:translate-x-1"
        >
          <Save size={20} strokeWidth={3} /> {isSaving ? 'Saving...' : 'Commit'}
        </button>
      </div>
      <div className="mt-8 relative">
        <div className="absolute -top-3 left-4 bg-[var(--color-poster-paper-light)] px-2 text-xs font-bold uppercase tracking-widest text-[var(--color-poster-ink)]">Value</div>
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-paper)] p-4 text-base font-medium text-[var(--color-poster-ink)] outline-none focus:bg-[var(--color-poster-paper-light)] focus:shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)] transition-all resize-y font-mono"
          rows={4}
        />
      </div>
    </div>
  );
}
