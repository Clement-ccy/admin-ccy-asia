'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogIn, Shield, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchSetupStatus, loginAdmin, setupAdmin } from '@/lib/admin/client';

type LoginState = {
  username: string;
  password: string;
};

const initialState: LoginState = {
  username: '',
  password: '',
};

export default function AdminLoginPage() {
  const [state, setState] = useState<LoginState>(initialState);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [setupDisabled, setSetupDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSetupStatus().then((data) => {
      if (typeof data?.setupDisabled === 'boolean') {
        setSetupDisabled(data.setupDisabled);
        setMode(data.setupDisabled ? 'login' : 'register');
      }
    });
  }, []);

  const handleChange = (key: keyof LoginState, value: string) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!state.username || !state.password) {
      setError('Please enter username and password.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const data = mode === 'register' ? await setupAdmin(state) : await loginAdmin(state);
      if (!data) {
        setError(mode === 'register' ? 'Registration failed.' : 'Invalid credentials.');
        return;
      }
      if (mode === 'register') {
        setSetupDisabled(true);
        setMode('login');
        setError('Registration complete. Please sign in.');
        return;
      }
      if (data.csrf) {
        sessionStorage.setItem('pf_admin_csrf', data.csrf);
      }
      window.location.href = '/dashboard';
    } catch {
      setError(mode === 'register' ? 'Registration failed.' : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-lg items-center px-4">
      <div className="w-full border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-paper-light)] p-8 shadow-[12px_12px_0px_var(--color-poster-ink)] relative">
        <div className="absolute -top-6 -right-6 transform rotate-12 bg-[var(--color-poster-mustard)] border-4 border-[var(--color-poster-ink)] p-4 shadow-[4px_4px_0px_var(--color-poster-ink)] z-10 hidden sm:block">
          <p className="text-xl font-black uppercase tracking-widest text-[var(--color-poster-ink)]">Top Secret</p>
        </div>
        
        <div className="flex items-center gap-4 border-b-4 border-[var(--color-poster-ink)] pb-6 mb-6">
          <div className="border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-green)] p-3 text-[var(--color-poster-ink)] shadow-[4px_4px_0px_var(--color-poster-ink)]">
            <Shield size={32} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-poster-red)] mb-1">Admin</p>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[var(--color-poster-ink)]">{mode === 'register' ? 'Register' : 'Sign in'}</h1>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-3 text-sm font-black uppercase tracking-widest">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={cn('transition-colors border-b-4 pb-1', mode === 'login' ? 'border-[var(--color-poster-ink)] text-[var(--color-poster-ink)]' : 'border-transparent text-[var(--color-poster-ink)] opacity-50 hover:opacity-100')}
          >
            Login
          </button>
          <span className="text-[var(--color-poster-ink)] opacity-30">/</span>
          <button
            type="button"
            disabled={setupDisabled}
            onClick={() => setMode('register')}
            className={cn('transition-colors border-b-4 pb-1', mode === 'register' ? 'border-[var(--color-poster-ink)] text-[var(--color-poster-ink)]' : 'border-transparent text-[var(--color-poster-ink)] opacity-50 hover:opacity-100', setupDisabled && 'opacity-30 cursor-not-allowed hover:opacity-30')}
          >
            Register
          </button>
          {setupDisabled && <span className="text-[var(--color-poster-red)] text-xs ml-2 border-2 border-[var(--color-poster-red)] px-1 rotate-[-5deg]">(disabled)</span>}
        </div>

        <div className="space-y-6">
          <label className="block text-sm font-bold uppercase tracking-widest text-[var(--color-poster-ink)]">
            Username
            <input
              type="text"
              value={state.username}
              onChange={(event) => handleChange('username', event.target.value)}
              className="mt-2 w-full border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-paper)] px-4 py-3 text-lg font-medium text-[var(--color-poster-ink)] outline-none focus:bg-[var(--color-poster-mustard)] transition-colors shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)]"
            />
          </label>

          <label className="block text-sm font-bold uppercase tracking-widest text-[var(--color-poster-ink)]">
            Password
            <input
              type="password"
              value={state.password}
              onChange={(event) => handleChange('password', event.target.value)}
              className="mt-2 w-full border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-paper)] px-4 py-3 text-lg font-medium text-[var(--color-poster-ink)] outline-none focus:bg-[var(--color-poster-mustard)] transition-colors shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)]"
            />
          </label>

          {error && (
            <div className="border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-red)] p-3 text-center">
              <p className="text-sm font-black uppercase tracking-widest text-[var(--color-poster-paper)]">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={cn(
              'mt-8 inline-flex w-full items-center justify-center gap-3 border-4 border-[var(--color-poster-ink)] bg-[var(--color-poster-ink)] px-6 py-4 text-lg font-black uppercase tracking-widest text-[var(--color-poster-paper)] transition-all hover:bg-[var(--color-poster-paper-light)] hover:text-[var(--color-poster-ink)] shadow-[4px_4px_0px_var(--color-poster-ink)] hover:shadow-none hover:translate-y-1 hover:translate-x-1',
              isLoading && 'opacity-80 cursor-not-allowed'
            )}
          >
            {mode === 'register' ? <UserPlus size={24} strokeWidth={3} /> : <LogIn size={24} strokeWidth={3} />}
            {isLoading ? 'Working...' : mode === 'register' ? 'Create Access' : 'Authorize'}
          </button>
        </div>

        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-[var(--color-poster-ink)] opacity-70 text-center border-t-2 border-dashed border-[var(--color-poster-ink)] pt-6">
          Return to{' '}
          <Link href="https://ccy.asia" className="text-[var(--color-poster-red)] underline decoration-2 hover:bg-[var(--color-poster-ink)] hover:text-[var(--color-poster-paper)] px-1">
            public site
          </Link>
        </p>
      </div>
    </div>
  );
}
