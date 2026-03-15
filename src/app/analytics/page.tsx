'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import {
  fetchUmamiBrowsers,
  fetchUmamiCountries,
  fetchUmamiDevices,
  fetchUmamiEvents,
  fetchUmamiOs,
  fetchUmamiOverview,
  fetchUmamiPages,
  fetchUmamiReferrers,
  fetchUmamiRetention,
  fetchUmamiTimeseries,
  type AnalyticsItem,
  type AnalyticsOverview,
  type RetentionPoint,
  type TimeseriesPoint,
} from '@/lib/admin/analytics-client';

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [pages, setPages] = useState<AnalyticsItem[]>([]);
  const [referrers, setReferrers] = useState<AnalyticsItem[]>([]);
  const [devices, setDevices] = useState<AnalyticsItem[]>([]);
  const [oses, setOses] = useState<AnalyticsItem[]>([]);
  const [browsers, setBrowsers] = useState<AnalyticsItem[]>([]);
  const [countries, setCountries] = useState<AnalyticsItem[]>([]);
  const [events, setEvents] = useState<AnalyticsItem[]>([]);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [retention, setRetention] = useState<RetentionPoint[]>([]);
  const [range, setRange] = useState(30);
  const csrf = typeof window !== 'undefined' ? sessionStorage.getItem('pf_admin_csrf') ?? '' : '';

  useEffect(() => {
    if (!csrf) return;
    const end = Math.floor(Date.now() / 1000);
    const start = end - range * 86400;
    fetchUmamiOverview(csrf, { start, end }).then((data) => data && setOverview(data));
    fetchUmamiPages(csrf, { start, end }).then(setPages);
    fetchUmamiReferrers(csrf, { start, end }).then(setReferrers);
    fetchUmamiDevices(csrf, { start, end }).then(setDevices);
    fetchUmamiOs(csrf, { start, end }).then(setOses);
    fetchUmamiBrowsers(csrf, { start, end }).then(setBrowsers);
    fetchUmamiCountries(csrf, { start, end }).then(setCountries);
    fetchUmamiEvents(csrf, { start, end }).then(setEvents);
    fetchUmamiTimeseries(csrf, { start, end }).then(setTimeseries);
    fetchUmamiRetention(csrf, { start, end }).then(setRetention);
  }, [csrf, range]);

  return (
    <AdminGuard>
      <div className="space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">Analytics</p>
            <h1 className="text-3xl font-semibold text-neutral-100">Overview</h1>
          </div>
          <div className="flex items-center gap-4">
            <RangeSelect value={range} onChange={setRange} />
            <Link href="/dashboard" className="text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-neutral-100">
              Back to dashboard
            </Link>
          </div>
        </header>

        <TrendCard title="Trend" series={timeseries} />
        <RetentionCard title="Retention" series={retention} />

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {['Pageviews', 'Visitors', 'Visits', 'Events'].map((label, index) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">{label}</p>
                <p className="mt-3 text-2xl font-semibold text-neutral-100">{overview ? Object.values(overview)[index] : '--'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AnalyticsPanel title="Top Pages" items={pages} valueKey="views" />
          <AnalyticsPanel title="Referrers" items={referrers} valueKey="views" />
          <AnalyticsPanel title="Devices" items={devices} valueKey="count" />
          <AnalyticsPanel title="OS" items={oses} valueKey="count" />
          <AnalyticsPanel title="Browsers" items={browsers} valueKey="count" />
          <AnalyticsPanel title="Countries" items={countries} valueKey="count" />
          <AnalyticsPanel title="Events" items={events} valueKey="count" />
        </div>
      </div>
    </AdminGuard>
  );
}

function AnalyticsPanel({
  title,
  items,
  valueKey,
}: {
  title: string;
  items: AnalyticsItem[];
  valueKey: 'views' | 'visitors' | 'count';
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">{title}</p>
        <span className="text-xs text-neutral-500">Top {items.length}</span>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        {items.length === 0 ? (
          <p className="text-neutral-500">No data.</p>
        ) : (
          items.map((item) => (
            <div key={`${title}-${item.name}`} className="flex items-center justify-between">
              <span className="max-w-[70%] truncate text-neutral-200">{String(item.name || 'unknown')}</span>
              <span className="font-mono text-neutral-500">
                {valueKey === 'views' ? item.views ?? 0 : valueKey === 'visitors' ? item.visitors ?? 0 : item.count ?? 0}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RangeSelect({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
      <span>Range</span>
      {[7, 30, 90].map((days) => (
        <button
          key={days}
          type="button"
          onClick={() => onChange(days)}
          className={`rounded-full border px-2 py-1 ${value === days ? 'border-white bg-white text-black' : 'border-white/15 text-neutral-500'}`}
        >
          {days}d
        </button>
      ))}
    </div>
  );
}

function TrendCard({ title, series }: { title: string; series: TimeseriesPoint[] }) {
  const max = Math.max(1, ...series.map((point) => point.pageviews));
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">{title}</p>
        <span className="text-xs text-neutral-500">Pageviews</span>
      </div>
      <div className="mt-4 grid h-24 grid-cols-[repeat(auto-fit,minmax(6px,1fr))] items-end gap-1">
        {series.length === 0 ? (
          <p className="text-sm text-neutral-500">No data.</p>
        ) : (
          series.map((point) => (
            <div
              key={point.day}
              className="rounded bg-white/60"
              style={{ height: `${Math.max(4, (point.pageviews / max) * 100)}%` }}
              title={`${point.day}: ${point.pageviews}`}
            />
          ))
        )}
      </div>
    </div>
  );
}

function RetentionCard({ title, series }: { title: string; series: RetentionPoint[] }) {
  const max = Math.max(1, ...series.map((point) => point.visitors));
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">{title}</p>
        <span className="text-xs text-neutral-500">Distinct visitors</span>
      </div>
      <div className="mt-4 grid h-24 grid-cols-[repeat(auto-fit,minmax(6px,1fr))] items-end gap-1">
        {series.length === 0 ? (
          <p className="text-sm text-neutral-500">No data.</p>
        ) : (
          series.map((point) => (
            <div
              key={point.day}
              className="rounded bg-sky-400/60"
              style={{ height: `${Math.max(4, (point.visitors / max) * 100)}%` }}
              title={`${point.day}: ${point.visitors}`}
            />
          ))
        )}
      </div>
    </div>
  );
}
