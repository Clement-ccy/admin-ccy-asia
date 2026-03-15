'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, Home, MessageCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { fetchAdminOverview } from '@/lib/admin/client';
import type { AdminOverview } from '@/lib/admin/types';

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const csrf = sessionStorage.getItem('pf_admin_csrf') ?? '';
    fetchAdminOverview(csrf)
      .then((data) => {
        if (data) setOverview(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminGuard>
      <div className="space-y-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">Admin Console</p>
            <h1 className="text-3xl font-semibold text-neutral-100">Dashboard</h1>
          </div>
          <div className="flex gap-2 text-xs font-mono uppercase tracking-widest">
            <Link href="/dashboard" className="rounded-full border border-white/15 px-3 py-1 text-neutral-100">Overview</Link>
            <Link href="/analytics" className="rounded-full border border-white/15 px-3 py-1 text-neutral-400 hover:text-neutral-100">Analytics</Link>
            <Link href="/comments" className="rounded-full border border-white/15 px-3 py-1 text-neutral-400 hover:text-neutral-100">Comments</Link>
            <Link href="/settings" className="rounded-full border border-white/15 px-3 py-1 text-neutral-400 hover:text-neutral-100">Settings</Link>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {['Pageviews', 'Visitors', 'Visits', 'Events'].map((label, index) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">{label}</p>
              <p className="mt-3 text-2xl font-semibold text-neutral-100">{loading ? '--' : overview ? Object.values(overview)[index] : 0}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Link href="/analytics" className={cn('rounded-3xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/8')}>
            <div className="flex items-center gap-3">
              <BarChart3 size={20} />
              <div>
                <p className="text-sm font-semibold">Analytics</p>
                <p className="text-xs text-neutral-400">Pageviews, referrers, events</p>
              </div>
            </div>
          </Link>
          <Link href="/comments" className="rounded-3xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/8">
            <div className="flex items-center gap-3">
              <MessageCircle size={20} />
              <div>
                <p className="text-sm font-semibold">Comments</p>
                <p className="text-xs text-neutral-400">Moderate and review</p>
              </div>
            </div>
          </Link>
          <Link href="/settings" className="rounded-3xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/8">
            <div className="flex items-center gap-3">
              <Settings size={20} />
              <div>
                <p className="text-sm font-semibold">Settings</p>
                <p className="text-xs text-neutral-400">Configure features</p>
              </div>
            </div>
          </Link>
        </section>

        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-neutral-100">
          <Home size={14} /> Sign out
        </Link>
      </div>
    </AdminGuard>
  );
}
