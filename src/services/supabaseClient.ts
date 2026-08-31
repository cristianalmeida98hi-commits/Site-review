import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache client instances
let publicClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export const normalizeSupabaseUrl = (rawUrl: string): string => {
  if (!rawUrl) return '';
  let clean = rawUrl.trim();
  // Remove /rest/v1 or /rest/v1/ if present
  clean = clean.replace(/\/rest\/v1\/?$/, '');
  // Remove trailing slashes
  clean = clean.replace(/\/+$/, '');
  return clean;
};

export const getSupabaseConfig = () => {
  // Client-side environment variables (Vite)
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};
  const clientUrl = metaEnv.VITE_SUPABASE_URL || metaEnv.SUPABASE_URL || '';
  const clientAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY || metaEnv.SUPABASE_PUBLISHABLE_KEY || metaEnv.SUPABASE_ANON_KEY || '';

  // Server-side environment variables (Node.js)
  const serverUrl = (typeof process !== 'undefined' && (
    process.env?.SUPABASE_URL || 
    process.env?.VITE_SUPABASE_URL
  )) || clientUrl;

  const serverAnonKey = (typeof process !== 'undefined' && (
    process.env?.SUPABASE_PUBLISHABLE_KEY ||
    process.env?.SUPABASE_ANON_KEY ||
    process.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env?.VITE_SUPABASE_ANON_KEY
  )) || clientAnonKey;

  const serviceRoleKey = (typeof process !== 'undefined' && process.env?.SUPABASE_SERVICE_ROLE_KEY) || '';

  const rawUrl = serverUrl || clientUrl;
  const url = normalizeSupabaseUrl(rawUrl);
  const anonKey = serverAnonKey || clientAnonKey;

  return {
    url,
    anonKey,
    serviceRoleKey,
    isConfigured: Boolean(url && (anonKey || serviceRoleKey))
  };
};

/**
 * Returns the public Supabase client (using anon key)
 * Safe to use on both frontend and backend for public queries
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (publicClient) return publicClient;

  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;

  try {
    publicClient = createClient(url, anonKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: true
      }
    });
    return publicClient;
  } catch (error) {
    console.error('[Supabase] Failed to initialize public client:', error);
    return null;
  }
};

/**
 * Returns the administrative Supabase client (using service role key)
 * ONLY accessible in backend / Node.js context. Never exposes key to browser.
 */
export const getSupabaseAdminClient = (): SupabaseClient | null => {
  if (adminClient) return adminClient;

  const { url, serviceRoleKey } = getSupabaseConfig();
  if (!url || !serviceRoleKey) {
    // If no service role key, fallback to anon key client on server if available
    return getSupabaseClient();
  }

  try {
    adminClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    return adminClient;
  } catch (error) {
    console.error('[Supabase Admin] Failed to initialize admin client:', error);
    return null;
  }
};

/**
 * Test connectivity with Supabase database
 */
export const testSupabaseConnection = async (): Promise<{
  connected: boolean;
  message: string;
  url?: string;
  hasServiceRole?: boolean;
  tablesStatus?: Record<string, boolean>;
}> => {
  const { url, anonKey, serviceRoleKey, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return {
      connected: false,
      message: 'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente.',
      hasServiceRole: Boolean(serviceRoleKey)
    };
  }

  const client = getSupabaseAdminClient() || getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      message: 'Não foi possível instanciar o cliente Supabase.',
      url,
      hasServiceRole: Boolean(serviceRoleKey)
    };
  }

  try {
    // Test basic query on price_sources or products
    const { data: sources, error: srcError } = await client
      .from('price_sources')
      .select('count', { count: 'exact', head: true });

    if (srcError) {
      // Try checking if table doesn't exist vs auth error
      return {
        connected: false,
        message: `Falha ao consultar tabela price_sources: ${srcError.message} (Código: ${srcError.code || 'UNKNOWN'})`,
        url,
        hasServiceRole: Boolean(serviceRoleKey)
      };
    }

    return {
      connected: true,
      message: 'Conexão com Supabase PostgreSQL estabelecida com sucesso.',
      url,
      hasServiceRole: Boolean(serviceRoleKey),
      tablesStatus: {
        price_sources: true
      }
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Erro na comunicação com Supabase: ${err.message || String(err)}`,
      url,
      hasServiceRole: Boolean(serviceRoleKey)
    };
  }
};
