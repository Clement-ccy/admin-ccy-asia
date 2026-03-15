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
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-lg items-center">
      <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-emerald-300">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">Admin</p>
            <h1 className="text-2xl font-semibold text-neutral-100">{mode === 'register' ? 'Register Admin' : 'Sign in'}</h1>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 text-xs font-mono">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={cn('uppercase tracking-widest', mode === 'login' ? 'text-neutral-100' : 'text-neutral-500')}
          >
            Login
          </button>
          <span className="text-neutral-500">/</span>
          <button
            type="button"
            disabled={setupDisabled}
            onClick={() => setMode('register')}
            className={cn('uppercase tracking-widest', mode === 'register' ? 'text-neutral-100' : 'text-neutral-500', setupDisabled && 'opacity-50')}
          >
            Register
          </button>
          {setupDisabled && <span className="text-neutral-500">(disabled)</span>}
        </div>

        <div className="mt-6 space-y-4">
          <label className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            Username
            <input
              type="text"
              value={state.username}
              onChange={(event) => handleChange('username', event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-neutral-100 outline-none ring-0 placeholder:text-neutral-500 focus:border-white/20"
            />
          </label>

          <label className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            Password
            <input
              type="password"
              value={state.password}
              onChange={(event) => handleChange('password', event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-neutral-100 outline-none ring-0 placeholder:text-neutral-500 focus:border-white/20"
            />
          </label>

          {error && <p className="text-xs font-mono text-red-400">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={cn(
              'inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-80',
              isLoading && 'opacity-60'
            )}
          >
            {mode === 'register' ? <UserPlus size={16} /> : <LogIn size={16} />}
            {isLoading ? 'Working...' : mode === 'register' ? 'Create admin' : 'Sign in'}
          </button>
        </div>

        <p className="mt-6 text-xs font-mono text-neutral-400">
          Back to{' '}
          <Link href="https://ccy.asia" className="text-neutral-100 underline">
            public site
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
