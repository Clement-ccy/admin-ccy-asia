'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, EyeOff, Trash2 } from 'lucide-react';

import { useAdminSession } from '@/components/admin/AdminGuard';
import { cn } from '@/lib/utils';
import { AdminShell } from '@/components/admin/AdminShell';
import { fetchAdminComments, updateAdminComment } from '@/lib/admin/client';
import type { AdminComment, AdminCommentAction } from '@/lib/admin/types';
import {
  fetchCommentCountries,
  fetchCommentDevices,
  fetchCommentOverview,
  fetchCommentPages,
  fetchCommentReferrers,
  fetchCommentTimeseries,
  type AnalyticsItem,
  type CommentOverview,
  type CommentTimeseriesPoint,
} from '@/lib/admin/analytics-client';

export default function AdminCommentsPage() {
  return (
    <AdminShell>
      <CommentsContent />
    </AdminShell>
  );
}

function CommentsContent() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [status, setStatus] = useState('pending');
  const [loadedKey, setLoadedKey] = useState('');
  const [overview, setOverview] = useState<CommentOverview | null>(null);
  const [pages, setPages] = useState<AnalyticsItem[]>([]);
  const [devices, setDevices] = useState<AnalyticsItem[]>([]);
  const [countries, setCountries] = useState<AnalyticsItem[]>([]);
  const [referrers, setReferrers] = useState<AnalyticsItem[]>([]);
  const [timeseries, setTimeseries] = useState<CommentTimeseriesPoint[]>([]);
  const [range, setRange] = useState(30);
  const { csrf, ready } = useAdminSession();

  const requestKey = `${status}:${csrf}`;
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    if (!ready || !csrf) return;

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
  }, [csrf, ready, requestKey, status]);

  useEffect(() => {
    if (!ready || !csrf) return;
    const end = Math.floor(Date.now() / 1000);
    const start = end - range * 86400;
    fetchCommentOverview(csrf, { start, end }).then((data) => data && setOverview(data));
    fetchCommentPages(csrf, { start, end }).then(setPages);
    fetchCommentDevices(csrf, { start, end }).then(setDevices);
    fetchCommentCountries(csrf, { start, end }).then(setCountries);
    fetchCommentReferrers(csrf, { start, end }).then(setReferrers);
    fetchCommentTimeseries(csrf, { start, end }).then(setTimeseries);
  }, [csrf, ready, range]);

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
    <div className="space-y-12">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b-4 border-[var(--color-poster-ink)] pb-6 mb-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-poster-red)] mb-2">Moderation</p>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-[var(--color-poster-ink)]">Comments</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <RangeSelect value={range} onChange={setRange} />
          <div className="flex bg-[var(--color-poster-paper-dark)] border-4 border-[var(--color-poster-ink)] shadow-[4px_4px_0px_var(--color-poster-ink)]">
            {['pending', 'approved', 'hidden'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatus(tab)}
                className={cn(
                  'px-4 py-2 text-xs font-black uppercase tracking-widest border-r-4 last:border-r-0 border-[var(--color-poster-ink)] transition-colors',
                  status === tab ? 'bg-[var(--color-poster-ink)] text-[var(--color-poster-paper)]' : 'bg-transparent text-[var(--color-poster-ink)] hover:bg-[var(--color-poster-mustard)]'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-paper-light)] p-6 shadow-[6px_6px_0px_var(--color-poster-ink)]">
          <h3 className="text-xl font-black uppercase tracking-widest text-[var(--color-poster-ink)] border-b-4 border-[var(--color-poster-ink)] pb-4 mb-6">Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            {['Total', 'Approved', 'Pending', 'Hidden'].map((label, index) => (
              <div key={label} className="border-2 border-[var(--color-poster-ink)] p-4 text-center bg-[var(--color-poster-paper)] hover:bg-[var(--color-poster-mustard)] transition-colors">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-poster-ink)] opacity-70 mb-2">{label}</p>
                <p className="text-3xl font-black text-[var(--color-poster-ink)]">
                  {overview ? [overview.total, overview.approved, overview.pending, overview.hidden][index] : '--'}
                </p>
              </div>
            ))}
          </div>
        </div>
        <TrendCard title="Trend" series={timeseries} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <AnalyticsPanel title="Pages" items={pages} valueKey="count" />
        <AnalyticsPanel title="Referrers" items={referrers} valueKey="count" />
        <AnalyticsPanel title="Devices" items={devices} valueKey="count" />
        <AnalyticsPanel title="Countries" items={countries} valueKey="count" />
      </div>

      <div className="mt-12 border-t-4 border-[var(--color-poster-ink)] pt-12">
        <h2 className="text-3xl font-black uppercase tracking-widest text-[var(--color-poster-ink)] mb-8 flex items-center gap-4">
          Queue <span className="bg-[var(--color-poster-red)] text-[var(--color-poster-paper)] px-3 py-1 text-sm">{status}</span>
        </h2>
          
          {loading ? (
            <div className="border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-paper-light)] p-12 text-center shadow-[6px_6px_0px_var(--color-poster-ink)]">
              <p className="text-xl font-bold uppercase tracking-widest text-[var(--color-poster-ink)] opacity-50 animate-pulse">Scanning Archive...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="border-4 border-[var(--color-poster-ink)] border-dashed bg-transparent p-12 text-center">
                  <p className="text-xl font-bold uppercase tracking-widest text-[var(--color-poster-ink)] opacity-50">Archive is empty</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-paper-light)] p-6 md:p-8 shadow-[6px_6px_0px_var(--color-poster-ink)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-[var(--color-poster-ink)] text-[var(--color-poster-paper)] text-xs font-bold uppercase tracking-widest px-3 py-1 border-b-4 border-l-4 border-[var(--color-poster-ink)]">
                      {comment.page_key}
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-start gap-8 mt-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-black text-[var(--color-poster-ink)] mb-1">{comment.author_name}</h3>
                        <div className="bg-[var(--color-poster-paper)] border-2 border-[var(--color-poster-ink)] p-4 my-4 font-serif text-lg leading-relaxed whitespace-pre-line shadow-[inset_2px_2px_0px_rgba(0,0,0,0.05)]">
                          {comment.content_md}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-bold uppercase tracking-wider text-[var(--color-poster-ink)] opacity-80 mt-6 border-t-2 border-dashed border-[var(--color-poster-ink)] pt-4">
                          <div>OS: {comment.os ?? 'n/a'}</div>
                          <div>Browser: {comment.browser ?? 'n/a'}</div>
                          <div>Device: {comment.device ?? 'n/a'}</div>
                          <div>Country: {comment.country ?? 'n/a'}</div>
                          <div className="col-span-2 pt-2 mt-2 border-t border-[var(--color-poster-ink)] opacity-50 font-mono lowercase tracking-normal">
                            {comment.email_plain ?? 'no-email'} | {comment.ip_plain ?? 'no-ip'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-row md:flex-col gap-3 shrink-0 pt-2">
                        <button
                          type="button"
                          onClick={() => updateStatus(comment.id, 'approve')}
                          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-green)] px-4 py-3 font-black uppercase tracking-wider text-[var(--color-poster-ink)] hover:bg-[var(--color-poster-ink)] hover:text-[var(--color-poster-green)] transition-colors shadow-[4px_4px_0px_var(--color-poster-ink)] hover:shadow-none hover:translate-y-1 hover:translate-x-1"
                        >
                          <CheckCircle2 size={18} strokeWidth={3} /> <span className="hidden sm:inline">Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(comment.id, 'hide')}
                          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-mustard)] px-4 py-3 font-black uppercase tracking-wider text-[var(--color-poster-ink)] hover:bg-[var(--color-poster-ink)] hover:text-[var(--color-poster-mustard)] transition-colors shadow-[4px_4px_0px_var(--color-poster-ink)] hover:shadow-none hover:translate-y-1 hover:translate-x-1"
                        >
                          <EyeOff size={18} strokeWidth={3} /> <span className="hidden sm:inline">Hide</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(comment.id, 'delete')}
                          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-red)] px-4 py-3 font-black uppercase tracking-wider text-[var(--color-poster-ink)] hover:bg-[var(--color-poster-ink)] hover:text-[var(--color-poster-red)] transition-colors shadow-[4px_4px_0px_var(--color-poster-ink)] hover:shadow-none hover:translate-y-1 hover:translate-x-1"
                        >
                          <Trash2 size={18} strokeWidth={3} /> <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
      </div>
    </div>
  );
}

function AnalyticsPanel({ title, items, valueKey }: { title: string; items: AnalyticsItem[]; valueKey: 'count' | 'views' | 'visitors' }) {
  return (
    <div className="border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-paper-light)] p-6 shadow-[6px_6px_0px_var(--color-poster-ink)]">
      <div className="flex items-center justify-between border-b-4 border-[var(--color-poster-ink)] pb-4 mb-4">
        <h3 className="text-xl font-black uppercase tracking-widest text-[var(--color-poster-ink)]">{title}</h3>
        <span className="text-xs font-bold uppercase tracking-wider bg-[var(--color-poster-ink)] text-[var(--color-poster-paper)] px-2 py-1">Top {items.length}</span>
      </div>
      <div className="space-y-2 font-medium">
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
      <span className="px-4 py-2 text-xs font-black uppercase tracking-widest text-[var(--color-poster-ink)] border-r-4 border-[var(--color-poster-ink)] hidden sm:block">Range</span>
      <div className="flex">
        {[7, 30, 90].map((days) => (
          <button key={days} type="button" onClick={() => onChange(days)} className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-r-4 last:border-r-0 border-[var(--color-poster-ink)] transition-colors ${value === days ? 'bg-[var(--color-poster-ink)] text-[var(--color-poster-paper)]' : 'bg-transparent text-[var(--color-poster-ink)] hover:bg-[var(--color-poster-mustard)]'}`}>{days}D</button>
        ))}
      </div>
    </div>
  );
}

function TrendCard({ title, series }: { title: string; series: CommentTimeseriesPoint[] }) {
  const max = Math.max(1, ...series.map((point) => point.count));
  return (
    <div className="border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-paper-light)] p-6 shadow-[6px_6px_0px_var(--color-poster-ink)]">
      <div className="flex items-center justify-between border-b-4 border-[var(--color-poster-ink)] pb-4 mb-6">
        <h3 className="text-xl font-black uppercase tracking-widest text-[var(--color-poster-ink)]">{title}</h3>
        <span className="text-xs font-bold uppercase tracking-wider bg-[var(--color-poster-mustard)] text-[var(--color-poster-ink)] border-2 border-[var(--color-poster-ink)] px-2 py-1">Daily</span>
      </div>
      <div className="mt-4 grid h-40 grid-cols-[repeat(auto-fit,minmax(8px,1fr))] items-end gap-1 md:gap-2 border-b-4 border-l-4 border-[var(--color-poster-ink)] p-2 pb-0 bg-[var(--color-poster-paper)]">
        {series.length === 0 ? (
          <div className="col-span-full h-full flex items-center justify-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-poster-ink)] opacity-50">No data</p>
          </div>
        ) : (
          series.map((point) => (
            <div key={point.day} className="bg-[var(--color-poster-ink)] border-2 border-b-0 border-[var(--color-poster-ink)] w-full hover:bg-[var(--color-poster-red)] transition-colors relative group" style={{ height: `${Math.max(4, (point.count / max) * 100)}%` }}>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[var(--color-poster-ink)] text-[var(--color-poster-paper)] text-xs font-bold px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">{point.day}: {point.count}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
