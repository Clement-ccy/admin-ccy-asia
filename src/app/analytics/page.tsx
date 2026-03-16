'use client';

import { useEffect, useState } from 'react';

import { useAdminSession } from '@/components/admin/AdminGuard';
import { AdminShell } from '@/components/admin/AdminShell';
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
  return (
    <AdminShell>
      <AnalyticsContent />
    </AdminShell>
  );
}

function AnalyticsContent() {
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
  const { csrf, ready } = useAdminSession();

  useEffect(() => {
    if (!ready || !csrf) return;
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
  }, [csrf, ready, range]);

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b-4 border-[var(--color-poster-ink)] pb-6 mb-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-poster-mustard)] mb-2">Metrics &amp; Data</p>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-[var(--color-poster-ink)]">Analytics</h1>
        </div>
        <div className="flex items-center">
          <RangeSelect value={range} onChange={setRange} />
        </div>
      </header>

      <div className="border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-mustard)] p-6 shadow-[6px_6px_0px_var(--color-poster-ink)]">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 divide-x-0 md:divide-x-4 divide-[var(--color-poster-ink)] border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-paper-light)] p-2">
          {['Pageviews', 'Visitors', 'Visits', 'Events'].map((label, index) => (
            <div key={`overview-${label}`} className="p-4 text-center md:text-left">
              <p className="text-xs font-black uppercase tracking-widest text-[var(--color-poster-ink)] opacity-70 mb-2">{label}</p>
              <p className="text-4xl font-black text-[var(--color-poster-ink)]">{overview ? Object.values(overview)[index] : '--'}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <TrendCard title="Trend" series={timeseries} />
        <RetentionCard title="Retention" series={retention} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <AnalyticsPanel title="Top Pages" items={pages} valueKey="views" color="bg-[var(--color-poster-paper-light)]" />
        <AnalyticsPanel title="Referrers" items={referrers} valueKey="views" color="bg-[var(--color-poster-paper-light)]" />
        <AnalyticsPanel title="Devices" items={devices} valueKey="count" color="bg-[var(--color-poster-paper-light)]" />
        <AnalyticsPanel title="OS" items={oses} valueKey="count" color="bg-[var(--color-poster-paper-light)]" />
        <AnalyticsPanel title="Browsers" items={browsers} valueKey="count" color="bg-[var(--color-poster-paper-light)]" />
        <AnalyticsPanel title="Countries" items={countries} valueKey="count" color="bg-[var(--color-poster-paper-light)]" />
        <AnalyticsPanel title="Events" items={events} valueKey="count" color="bg-[var(--color-poster-paper-light)]" />
      </div>
    </div>
  );
}

function AnalyticsPanel({ title, items, valueKey, color }: { title: string; items: AnalyticsItem[]; valueKey: 'views' | 'visitors' | 'count'; color: string }) {
  return (
    <div className={`border-4 border-[var(--color-poster-ink)] ${color} p-6 shadow-[6px_6px_0px_var(--color-poster-ink)]`}>
      <div className="flex items-center justify-between border-b-4 border-[var(--color-poster-ink)] pb-4 mb-4">
        <h3 className="text-xl font-black uppercase tracking-widest text-[var(--color-poster-ink)]">{title}</h3>
        <span className="text-xs font-bold uppercase tracking-wider bg-[var(--color-poster-ink)] text-[var(--color-poster-paper)] px-2 py-1">Top {items.length}</span>
      </div>
      <div className="space-y-3 font-medium">
        {items.length === 0 ? (
          <p className="text-[var(--color-poster-ink)] opacity-60 font-bold uppercase tracking-wider text-sm text-center py-4 border-2 border-dashed border-[var(--color-poster-ink)]">No data recorded</p>
        ) : (
          items.map((item) => (
            <div key={`${title}-${item.name || 'unknown'}`} className="flex items-center justify-between group hover:bg-[var(--color-poster-ink)] hover:text-[var(--color-poster-paper)] p-2 -mx-2 transition-colors">
              <span className="max-w-[70%] truncate font-bold">{String(item.name || 'unknown')}</span>
              <span className="font-black text-lg">
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
    <div className="flex items-center bg-[var(--color-poster-paper-dark)] border-4 border-[var(--color-poster-ink)] shadow-[4px_4px_0px_var(--color-poster-ink)]">
      <span className="px-4 py-2 text-xs font-black uppercase tracking-widest text-[var(--color-poster-ink)] border-r-4 border-[var(--color-poster-ink)]">Range</span>
      <div className="flex">
        {[7, 30, 90].map((days) => (
          <button key={days} type="button" onClick={() => onChange(days)} className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-r-4 last:border-r-0 border-[var(--color-poster-ink)] transition-colors ${value === days ? 'bg-[var(--color-poster-ink)] text-[var(--color-poster-paper)]' : 'bg-transparent text-[var(--color-poster-ink)] hover:bg-[var(--color-poster-mustard)]'}`}>{days}D</button>
        ))}
      </div>
    </div>
  );
}

function TrendCard({ title, series }: { title: string; series: TimeseriesPoint[] }) {
  const max = Math.max(1, ...series.map((point) => point.pageviews));
  return (
    <div className="border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-paper-light)] p-6 shadow-[6px_6px_0px_var(--color-poster-ink)]">
      <div className="flex items-center justify-between border-b-4 border-[var(--color-poster-ink)] pb-4 mb-6">
        <h3 className="text-xl font-black uppercase tracking-widest text-[var(--color-poster-ink)]">{title}</h3>
        <span className="text-xs font-bold uppercase tracking-wider bg-[var(--color-poster-mustard)] text-[var(--color-poster-ink)] border-2 border-[var(--color-poster-ink)] px-2 py-1">Pageviews</span>
      </div>
      <div className="mt-4 grid h-40 grid-cols-[repeat(auto-fit,minmax(8px,1fr))] items-end gap-1 md:gap-2 border-b-4 border-l-4 border-[var(--color-poster-ink)] p-2 pb-0 bg-[var(--color-poster-paper)]">
        {series.length === 0 ? (
          <div className="col-span-full h-full flex items-center justify-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-poster-ink)] opacity-50">No data</p>
          </div>
        ) : (
          series.map((point) => (
            <div key={point.day} className="bg-[var(--color-poster-red)] border-2 border-b-0 border-[var(--color-poster-ink)] w-full hover:bg-[var(--color-poster-ink)] transition-colors relative group" style={{ height: `${Math.max(4, (point.pageviews / max) * 100)}%` }}>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[var(--color-poster-ink)] text-[var(--color-poster-paper)] text-xs font-bold px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">{point.day}: {point.pageviews}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RetentionCard({ title, series }: { title: string; series: RetentionPoint[] }) {
  const max = Math.max(1, ...series.map((point) => point.visitors));
  return (
    <div className="border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-paper-light)] p-6 shadow-[6px_6px_0px_var(--color-poster-ink)]">
      <div className="flex items-center justify-between border-b-4 border-[var(--color-poster-ink)] pb-4 mb-6">
        <h3 className="text-xl font-black uppercase tracking-widest text-[var(--color-poster-ink)]">{title}</h3>
        <span className="text-xs font-bold uppercase tracking-wider bg-[var(--color-poster-green)] text-[var(--color-poster-ink)] border-2 border-[var(--color-poster-ink)] px-2 py-1">Visitors</span>
      </div>
      <div className="mt-4 grid h-40 grid-cols-[repeat(auto-fit,minmax(8px,1fr))] items-end gap-1 md:gap-2 border-b-4 border-l-4 border-[var(--color-poster-ink)] p-2 pb-0 bg-[var(--color-poster-paper)]">
        {series.length === 0 ? (
          <div className="col-span-full h-full flex items-center justify-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-poster-ink)] opacity-50">No data</p>
          </div>
        ) : (
          series.map((point) => (
            <div key={point.day} className="bg-[var(--color-poster-green)] border-2 border-b-0 border-[var(--color-poster-ink)] w-full hover:bg-[var(--color-poster-ink)] transition-colors relative group" style={{ height: `${Math.max(4, (point.visitors / max) * 100)}%` }}>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[var(--color-poster-ink)] text-[var(--color-poster-paper)] text-xs font-bold px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">{point.day}: {point.visitors}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
