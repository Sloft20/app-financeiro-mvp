import axios from 'axios';
import { supabase } from './supabase';
import { useAuthStore } from '@/store/authStore';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

// Interceptor de Requisição: Injeta Automagicamente o Token JWT via bearer
api.interceptors.request.use(async (config) => {
  // Apanha o JWT ativo direto do SDK Local persistido do Supabase
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Interceptor de Resposta: Proteção Atuarial (Expulsar/Revocar se Sessão Vencida)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
       // O PostgREST ou FastAPI chutou a conexão por Auth inválido.
       await supabase.auth.signOut();
       useAuthStore.getState().logout();
       window.location.href = '/login'; // Opcional redicionamento root
    }
    return Promise.reject(error);
  }
);
