'use client';

import { useEffect, useState } from 'react';
import { fetchAdminOverview } from '@/lib/admin/client';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const csrf = sessionStorage.getItem('pf_admin_csrf') ?? '';
    if (!csrf) {
      window.location.href = '/';
      return;
    }
    fetchAdminOverview(csrf).then((data) => {
      if (!data) {
        window.location.href = '/';
        return;
      }
      setReady(true);
    });
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
