"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setAuth(session.access_token, session.user);
        if (pathname === '/login' || pathname === '/register') router.replace('/');
      } else {
        if (pathname !== '/login' && pathname !== '/register') router.replace('/login');
      }
      setLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setAuth(session.access_token, session.user);
        if (pathname === '/login' || pathname === '/register') router.replace('/');
      } else {
        useAuthStore.getState().logout();
        if (pathname !== '/login' && pathname !== '/register') router.replace('/login');
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [pathname, router, setAuth]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-indigo-500 gap-4 z-50">
        <Loader2 className="animate-spin" size={40} /> 
        <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Protegendo Cofre...</p>
      </div>
    );
  }

  return <>{children}</>;
}
