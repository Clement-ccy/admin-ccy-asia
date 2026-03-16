'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { fetchAdminSession } from '@/lib/admin/client';

type AdminSessionContextValue = {
  csrf: string;
  ready: boolean;
};

const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);

export function useAdminSession() {
  const value = useContext(AdminSessionContext);

  if (!value) {
    throw new Error('useAdminSession must be used within AdminGuard');
  }

  return value;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [csrf] = useState(() => (typeof window === 'undefined' ? '' : sessionStorage.getItem('pf_admin_csrf') ?? ''));

  useEffect(() => {
    if (!csrf) {
      window.location.href = '/';
      return;
    }

    fetchAdminSession(csrf).then((isAuthenticated) => {
      if (!isAuthenticated) {
        sessionStorage.removeItem('pf_admin_csrf');
        window.location.href = '/';
        return;
      }

      setReady(true);
    });
  }, [csrf]);

  const value = useMemo(() => ({ csrf, ready }), [csrf, ready]);

  return (
    <AdminSessionContext.Provider value={value}>
      {ready ? children : null}
    </AdminSessionContext.Provider>
  );
}
