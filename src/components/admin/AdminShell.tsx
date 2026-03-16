'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, MessageCircle, Settings, LogOut } from 'lucide-react';

import { logoutAdmin } from '@/lib/admin/client';
import { AdminGuard } from './AdminGuard';
import { cn } from '@/lib/utils';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    const csrf = sessionStorage.getItem('pf_admin_csrf') ?? '';

    try {
      if (csrf) {
        await logoutAdmin(csrf);
      }
    } finally {
      sessionStorage.removeItem('pf_admin_csrf');
      window.location.href = '/';
    }
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/comments', label: 'Comments', icon: MessageCircle },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <AdminGuard>
      <div className="flex min-h-screen w-full flex-col md:flex-row bg-[var(--color-poster-paper)] text-[var(--color-poster-ink)] selection:bg-[var(--color-poster-mustard)] selection:text-[var(--color-poster-ink)]">
        
        {/* Left Navigation */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[var(--color-poster-ink)] flex flex-col justify-between bg-[var(--color-poster-paper-light)] shrink-0 shadow-[4px_0_12px_rgba(0,0,0,0.05)] relative z-10 p-6 md:min-h-screen">
          
          <div>
            <div className="mb-10 pt-2">
              <div className="inline-block border-2 border-[var(--color-poster-ink)] p-3 bg-[var(--color-poster-mustard)] transform -rotate-2 shadow-[4px_4px_0px_var(--color-poster-ink)]">
                <h1 className="text-2xl font-black uppercase tracking-widest leading-none m-0 text-[var(--color-poster-ink)]">PF ADMIN</h1>
                <p className="text-[10px] uppercase font-bold text-center mt-2 border-t-2 border-[var(--color-poster-ink)] pt-1 tracking-[0.2em] text-[var(--color-poster-ink)]">Control Plane</p>
              </div>
            </div>

            <nav className="space-y-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 border-2 font-bold uppercase tracking-wider text-sm transition-all",
                      isActive 
                        ? "bg-[var(--color-poster-red)] text-[var(--color-poster-paper-light)] border-[var(--color-poster-ink)] shadow-[4px_4px_0px_var(--color-poster-ink)]" 
                        : "bg-transparent border-transparent hover:border-[var(--color-poster-ink)] text-[var(--color-poster-ink)] hover:shadow-[4px_4px_0px_var(--color-poster-ink)] hover:-translate-y-1"
                    )}
                  >
                    <item.icon size={20} strokeWidth={2.5} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="mt-8 pt-6 border-t-2 border-[var(--color-poster-ink)] border-dashed">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 border-2 border-transparent hover:border-[var(--color-poster-ink)] font-bold uppercase tracking-wider text-sm transition-all hover:bg-[var(--color-poster-ink)] hover:text-[var(--color-poster-paper)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:-translate-y-1"
            >
              <LogOut size={20} strokeWidth={2.5} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12 md:py-16 overflow-y-auto w-full relative bg-[var(--color-poster-paper)]">
          {/* Decorative stamp/watermark */}
          <div className="absolute top-12 right-12 opacity-[0.03] pointer-events-none select-none mix-blend-multiply flex items-center justify-center border-8 border-[var(--color-poster-ink)] rounded-full w-64 h-64 transform rotate-12">
            <div className="border-4 border-[var(--color-poster-ink)] rounded-full w-52 h-52 flex items-center justify-center text-[var(--color-poster-ink)] font-black text-4xl tracking-[0.3em] uppercase text-center p-4 leading-tight">
              CCY<br/>ASIA
            </div>
          </div>
          
          <div className="max-w-5xl mx-auto relative z-10">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
