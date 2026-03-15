'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2, EyeOff, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { fetchAdminComments, updateAdminComment } from '@/lib/admin/client';
import type { AdminComment, AdminCommentAction } from '@/lib/admin/types';
import {
  fetchCommentBrowsers,
  fetchCommentCountries,
  fetchCommentDevices,
  fetchCommentEvents,
  fetchCommentOs,
  fetchCommentOverview,
  fetchCommentPages,
  fetchCommentReferrers,
  fetchCommentTimeseries,
  type AnalyticsItem,
  type CommentOverview,
  type CommentTimeseriesPoint,
} from '@/lib/admin/analytics-client';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [status, setStatus] = useState('pending');
  const [loadedKey, setLoadedKey] = useState('');
  const [overview, setOverview] = useState<CommentOverview | null>(null);
  const [pages, setPages] = useState<AnalyticsItem[]>([]);
  const [devices, setDevices] = useState<AnalyticsItem[]>([]);
  const [oses, setOses] = useState<AnalyticsItem[]>([]);
  const [browsers, setBrowsers] = useState<AnalyticsItem[]>([]);
  const [countries, setCountries] = useState<AnalyticsItem[]>([]);
  const [events, setEvents] = useState<AnalyticsItem[]>([]);
  const [referrers, setReferrers] = useState<AnalyticsItem[]>([]);
  const [timeseries, setTimeseries] = useState<CommentTimeseriesPoint[]>([]);
  const [range, setRange] = useState(30);

  const csrf = typeof window !== 'undefined' ? sessionStorage.getItem('pf_admin_csrf') ?? '' : '';
  const requestKey = `${status}:${csrf}`;
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    let active = true;
    fetchAdminComments(status, csrf)
      .then((data) => {
        if (!active) return;
        setComments(data);
      })
      .finally(() => {
        if (!active) return;
        setLoadedKey(requestKey);
      });
    return () => {
      active = false;
    };
  }, [csrf, requestKey, status]);

  useEffect(() => {
    if (!csrf) return;
    const end = Math.floor(Date.now() / 1000);
    const start = end - range * 86400;
    fetchCommentOverview(csrf, { start, end }).then((data) => data && setOverview(data));
    fetchCommentPages(csrf, { start, end }).then(setPages);
    fetchCommentDevices(csrf, { start, end }).then(setDevices);
    fetchCommentOs(csrf, { start, end }).then(setOses);
    fetchCommentBrowsers(csrf, { start, end }).then(setBrowsers);
    fetchCommentCountries(csrf, { start, end }).then(setCountries);
    fetchCommentEvents(csrf, { start, end }).then(setEvents);
    fetchCommentReferrers(csrf, { start, end }).then(setReferrers);
    fetchCommentTimeseries(csrf, { start, end }).then(setTimeseries);
  }, [csrf, range]);

  const updateStatus = async (id: string, action: AdminCommentAction) => {
    await updateAdminComment(id, action, csrf);
    setLoadedKey('');
    fetchAdminComments(status, csrf)
      .then((data) => {
        setComments(data);
      })
      .finally(() => setLoadedKey(requestKey));
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">Moderation</p>
            <h1 className="text-3xl font-semibold text-neutral-100">Comments</h1>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <RangeSelect value={range} onChange={setRange} />
            <div className="flex gap-2">
              {['pending', 'approved', 'hidden'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatus(tab)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-mono uppercase tracking-widest',
                    status === tab ? 'border-white bg-white text-black' : 'border-white/15 text-neutral-500'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Link href="/dashboard" className="text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-neutral-100">
              Back to dashboard
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">Comment Overview</p>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {['Total', 'Approved', 'Pending', 'Hidden'].map((label, index) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">{label}</p>
                  <p className="mt-3 text-2xl font-semibold text-neutral-100">
                    {overview ? [overview.total, overview.approved, overview.pending, overview.hidden][index] : '--'}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <TrendCard title="Comment Trend" series={timeseries} />
          <AnalyticsPanel title="Comment Pages" items={pages} valueKey="count" />
          <AnalyticsPanel title="Referrers" items={referrers} valueKey="count" />
          <AnalyticsPanel title="Devices" items={devices} valueKey="count" />
          <AnalyticsPanel title="OS" items={oses} valueKey="count" />
          <AnalyticsPanel title="Browsers" items={browsers} valueKey="count" />
          <AnalyticsPanel title="Countries" items={countries} valueKey="count" />
          <AnalyticsPanel title="Comment Events" items={events} valueKey="count" />
        </div>

        {loading ? (
          <p className="text-sm text-neutral-500">Loading...</p>
        ) : (
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-neutral-500">No comments.</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-mono text-neutral-500">{comment.page_key}</p>
                      <h3 className="text-lg font-semibold text-neutral-100">{comment.author_name}</h3>
                      <p className="mt-2 whitespace-pre-line text-sm text-neutral-400">{comment.content_md}</p>
                      <div className="mt-3 space-y-1 text-xs text-neutral-500">
                        <div>UA: {comment.ua_plain ?? 'n/a'}</div>
                        <div>
                          OS: {comment.os ?? 'n/a'} · Browser: {comment.browser ?? 'n/a'} · Device: {comment.device ?? 'n/a'}
                        </div>
                        <div>Country: {comment.country ?? 'n/a'}</div>
                        <div>Email: {comment.email_plain ?? 'n/a'}</div>
                        <div>IP: {comment.ip_plain ?? 'n/a'}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => updateStatus(comment.id, 'approve')}
                        className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 hover:text-emerald-300"
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(comment.id, 'hide')}
                        className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 hover:text-amber-300"
                      >
                        <EyeOff size={14} /> Hide
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(comment.id, 'delete')}
                        className="inline-flex items-center gap-2 text-xs font-mono text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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
  valueKey: 'count' | 'views' | 'visitors';
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

function TrendCard({ title, series }: { title: string; series: CommentTimeseriesPoint[] }) {
  const max = Math.max(1, ...series.map((point) => point.count));
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">{title}</p>
        <span className="text-xs text-neutral-500">Daily</span>
      </div>
      <div className="mt-4 grid h-24 grid-cols-[repeat(auto-fit,minmax(6px,1fr))] items-end gap-1">
        {series.length === 0 ? (
          <p className="text-sm text-neutral-500">No data.</p>
        ) : (
          series.map((point) => (
            <div
              key={point.day}
              className="rounded bg-white/60"
              style={{ height: `${Math.max(4, (point.count / max) * 100)}%` }}
              title={`${point.day}: ${point.count}`}
            />
          ))
        )}
      </div>
    </div>
  );
}
