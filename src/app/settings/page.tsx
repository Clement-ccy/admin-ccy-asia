'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { fetchAdminSettings, updateAdminSetting } from '@/lib/admin/client';
import type { AdminSettingsItem } from '@/lib/admin/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettingsItem[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  const csrf = typeof window !== 'undefined' ? sessionStorage.getItem('pf_admin_csrf') ?? '' : '';

  useEffect(() => {
    fetchAdminSettings(csrf).then((data) => {
      setSettings(data);
    });
  }, [csrf]);

  const updateSetting = async (item: AdminSettingsItem, nextValue: string) => {
    setSaving(item.key);
    await updateAdminSetting(item.key, JSON.parse(nextValue), csrf);
    setSaving(null);
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">Config</p>
            <h1 className="text-3xl font-semibold text-neutral-100">Settings</h1>
          </div>
          <Link href="/dashboard" className="text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-neutral-100">
            Back to dashboard
          </Link>
        </header>

        <div className="space-y-4">
          {settings.map((item) => (
            <SettingRow key={item.key} item={item} onSave={updateSetting} savingKey={saving} />
          ))}
        </div>
      </div>
    </AdminGuard>
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">{item.key}</p>
          <p className="mt-1 text-xs text-neutral-500">{item.is_secret ? 'secret' : 'public'}</p>
        </div>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => onSave(item, value)}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-mono text-neutral-100 hover:bg-white/10"
        >
          <Save size={12} /> {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="mt-4 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-white/20"
        rows={3}
      />
    </div>
  );
}
