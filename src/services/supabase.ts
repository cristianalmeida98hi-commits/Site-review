import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read env variables safely in both Vite client and Node.js server
const getEnvVar = (clientKey: string, serverKey: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[serverKey]) {
    return process.env[serverKey] as string;
  }
  if (typeof process !== 'undefined' && process.env && process.env[clientKey]) {
    return process.env[clientKey] as string;
  }
  // @ts-ignore - Vite browser import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[clientKey]) {
    // @ts-ignore
    return import.meta.env[clientKey] as string;
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL', 'SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY');
const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_ROLE_KEY');

export const isSupabaseConfigured = Boolean(supabaseUrl && (supabaseAnonKey || supabaseServiceKey));

let clientInstance: SupabaseClient | null = null;
let serverClientInstance: SupabaseClient | null = null;

/**
 * Returns public Supabase client (Anon Key) for client/server safe operations
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!clientInstance && supabaseUrl && supabaseAnonKey) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: true
      }
    });
  }
  return clientInstance;
}

/**
 * Returns privileged server-side Supabase client (Service Role Key) for background robot jobs
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!supabaseUrl || !key) {
    return null;
  }
  if (!serverClientInstance) {
    serverClientInstance = createClient(supabaseUrl, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
  return serverClientInstance;
}

export interface SupabaseHealthStatus {
  isConfigured: boolean;
  connected: boolean;
  supabaseUrlHost: string | null;
  message: string;
  productCount?: number;
  offersCount?: number;
  sourcesCount?: number;
}

export async function checkSupabaseConnection(): Promise<SupabaseHealthStatus> {
  if (!isSupabaseConfigured) {
    return {
      isConfigured: false,
      connected: false,
      supabaseUrlHost: null,
      message: 'Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas configurações.'
    };
  }

  const client = getSupabaseServerClient() || getSupabaseClient();
  if (!client) {
    return {
      isConfigured: false,
      connected: false,
      supabaseUrlHost: null,
      message: 'Falha ao inicializar o cliente Supabase.'
    };
  }

  try {
    const urlObj = new URL(supabaseUrl);
    const [prodRes, offRes, srcRes] = await Promise.all([
      client.from('products').select('id', { count: 'exact', head: true }),
      client.from('price_offers').select('id', { count: 'exact', head: true }),
      client.from('price_sources').select('id', { count: 'exact', head: true })
    ]);

    if (prodRes.error && prodRes.error.code !== 'PGRST116') {
      return {
        isConfigured: true,
        connected: false,
        supabaseUrlHost: urlObj.host,
        message: `Erro na tabela do Supabase: ${prodRes.error.message}`
      };
    }

    return {
      isConfigured: true,
      connected: true,
      supabaseUrlHost: urlObj.host,
      message: 'Conexão com PostgreSQL Supabase estabelecida com sucesso.',
      productCount: prodRes.count ?? 0,
      offersCount: offRes.count ?? 0,
      sourcesCount: srcRes.count ?? 0
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      connected: false,
      supabaseUrlHost: null,
      message: `Erro ao conectar com Supabase: ${err.message || String(err)}`
    };
  }
}
