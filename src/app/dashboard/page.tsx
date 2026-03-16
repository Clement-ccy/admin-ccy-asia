'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, MessageCircle, Settings } from 'lucide-react';

import { AdminShell } from '@/components/admin/AdminShell';
import { useAdminSession } from '@/components/admin/AdminGuard';
import { fetchAdminOverview } from '@/lib/admin/client';
import type { AdminOverview } from '@/lib/admin/types';

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <DashboardContent />
    </AdminShell>
  );
}

function DashboardContent() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const { csrf, ready } = useAdminSession();

  useEffect(() => {
    if (!ready) return;

    fetchAdminOverview(csrf)
      .then((data) => {
        if (data) setOverview(data);
      })
      .finally(() => setLoading(false));
  }, [csrf, ready]);

  return (
    <div className="space-y-12">
      <header className="border-b-4 border-[var(--color-poster-ink)] pb-6 mb-8">
        <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-poster-red)] mb-2">Admin Console</p>
        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-[var(--color-poster-ink)]">Dashboard</h1>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {['Pageviews', 'Visitors', 'Visits', 'Events'].map((label, index) => (
          <div key={label} className="border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-paper-light)] p-6 shadow-[6px_6px_0px_var(--color-poster-ink)] transform transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_var(--color-poster-ink)]">
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-poster-ink)] opacity-70 mb-4 border-b-2 border-[var(--color-poster-ink)] pb-2 inline-block">{label}</p>
            <p className="text-5xl font-black text-[var(--color-poster-ink)]">
              {loading ? '--' : overview ? Object.values(overview)[index] : 0}
            </p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3 mt-12">
        <Link href="/analytics" className="group block border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-mustard)] p-8 shadow-[8px_8px_0px_var(--color-poster-ink)] transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_var(--color-poster-ink)]">
          <div className="flex flex-col h-full justify-between gap-6">
            <div className="border-4 border-[var(--color-poster-ink)] w-16 h-16 rounded-full flex items-center justify-center bg-[var(--color-poster-paper-light)] group-hover:rotate-12 transition-transform">
              <BarChart3 size={32} strokeWidth={2.5} className="text-[var(--color-poster-ink)]" />
            </div>
            <div>
              <p className="text-2xl font-black uppercase tracking-wide text-[var(--color-poster-ink)] border-b-4 border-[var(--color-poster-ink)] pb-2 mb-2 inline-block">Analytics</p>
              <p className="text-sm font-bold text-[var(--color-poster-ink)] opacity-80 uppercase tracking-wider mt-2">Pageviews, referrers, events</p>
            </div>
          </div>
        </Link>

        <Link href="/comments" className="group block border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-green)] p-8 shadow-[8px_8px_0px_var(--color-poster-ink)] transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_var(--color-poster-ink)]">
          <div className="flex flex-col h-full justify-between gap-6">
            <div className="border-4 border-[var(--color-poster-ink)] w-16 h-16 rounded-full flex items-center justify-center bg-[var(--color-poster-paper-light)] group-hover:-rotate-12 transition-transform">
              <MessageCircle size={32} strokeWidth={2.5} className="text-[var(--color-poster-ink)]" />
            </div>
            <div>
              <p className="text-2xl font-black uppercase tracking-wide text-[var(--color-poster-ink)] border-b-4 border-[var(--color-poster-ink)] pb-2 mb-2 inline-block">Comments</p>
              <p className="text-sm font-bold text-[var(--color-poster-ink)] opacity-80 uppercase tracking-wider mt-2">Moderate and review</p>
            </div>
          </div>
        </Link>

        <Link href="/settings" className="group block border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-paper-light)] p-8 shadow-[8px_8px_0px_var(--color-poster-ink)] transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_var(--color-poster-ink)]">
          <div className="flex flex-col h-full justify-between gap-6">
            <div className="border-4 border-[var(--color-poster-ink)] w-16 h-16 rounded-full flex items-center justify-center bg-[var(--color-poster-ink)] text-[var(--color-poster-paper-light)] group-hover:rotate-45 transition-transform">
              <Settings size={32} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-2xl font-black uppercase tracking-wide text-[var(--color-poster-ink)] border-b-4 border-[var(--color-poster-ink)] pb-2 mb-2 inline-block">Settings</p>
              <p className="text-sm font-bold text-[var(--color-poster-ink)] opacity-80 uppercase tracking-wider mt-2">Configure features</p>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
