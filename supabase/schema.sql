-- ============================================================================
-- C-REVIEW / REVIEWHUB - SUPABASE POSTGRESQL PRODUCTION SCHEMA (100% IDEMPOTENTE)
-- ============================================================================
-- Correções de Idempotência:
-- 1. DROP POLICY IF EXISTS diretamente no DDL (sem blocos anônimos intermediários).
-- 2. Sintaxe explícita com especificação de tabela: DROP POLICY IF EXISTS "nome" ON public.tabela;
-- 3. CREATE TABLE IF NOT EXISTS e CREATE INDEX IF NOT EXISTS.
-- 4. INSERT com ON CONFLICT (id) DO UPDATE.
-- 5. Não apaga tabelas nem dados existentes.
-- ============================================================================

-- 1. Extensão para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- TABELA 1: products (Catálogo Principal de Produtos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand_id TEXT,
  brand_name TEXT,
  category_id TEXT,
  category_name TEXT,
  description TEXT,
  image_url TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  specs JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  reference_price NUMERIC(12,2) DEFAULT 0,
  current_best_price NUMERIC(12,2) DEFAULT 0,
  ideal_price NUMERIC(12,2) DEFAULT 0,
  target_audience TEXT,
  recommendation_verdict TEXT DEFAULT 'RECOMENDADO',
  verdict_reason TEXT,
  rating_overall NUMERIC(3,1) DEFAULT 8.5,
  community_rating NUMERIC(3,1) DEFAULT 8.5,
  creator_rating NUMERIC(3,1) DEFAULT 8.5,
  performance_score NUMERIC(3,1) DEFAULT 8.5,
  quality_score NUMERIC(3,1) DEFAULT 8.5,
  cost_benefit_score NUMERIC(3,1) DEFAULT 8.5,
  durability_score NUMERIC(3,1) DEFAULT 8.5,
  review_count INTEGER DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  pros JSONB DEFAULT '[]'::jsonb,
  cons JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  views_count INTEGER DEFAULT 0,
  is_sponsored BOOLEAN DEFAULT false,
  sponsored_tag TEXT,
  last_price_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- TABELA 2: price_sources (Lojas e Conectores Homologados)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.price_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  base_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'rate_limited', 'error')),
  reliability_score NUMERIC(5,2) DEFAULT 95.0,
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  scrape_interval_minutes INTEGER DEFAULT 30,
  error_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  parser_type TEXT DEFAULT 'html_scraper',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- TABELA 3: price_offers (Ofertas Ativas e Normalizadas por Loja)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.price_offers (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_model TEXT,
  source_id TEXT NOT NULL REFERENCES public.price_sources(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  store_logo TEXT,
  raw_title TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(12,2),
  discount_percentage INTEGER,
  currency TEXT DEFAULT 'BRL',
  in_stock BOOLEAN DEFAULT true,
  affiliate_url TEXT NOT NULL,
  coupon_code TEXT,
  coupon_discount_text TEXT,
  confidence_score INTEGER DEFAULT 95 CHECK (confidence_score BETWEEN 0 AND 100),
  match_quality TEXT DEFAULT 'exact' CHECK (match_quality IN ('exact', 'high', 'medium', 'low')),
  is_outlier BOOLEAN DEFAULT false,
  verified_by_robot BOOLEAN DEFAULT true,
  cash_price NUMERIC(12,2),
  installment_text TEXT,
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_product_source UNIQUE (product_id, source_id)
);

-- ----------------------------------------------------------------------------
-- TABELA 4: price_history (Série Temporal do Histórico de Preços)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  store_name TEXT NOT NULL,
  source_id TEXT REFERENCES public.price_sources(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- TABELA 5: price_searches (Cache Interno de Buscas de Preço)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.price_searches (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  category TEXT,
  brand TEXT,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  cached_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 minutes')
);

-- ----------------------------------------------------------------------------
-- TABELA 6: price_logs (Auditoria e Logs de Execução do Robô - USO INTERNO)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.price_logs (
  id TEXT PRIMARY KEY,
  execution_type TEXT NOT NULL DEFAULT 'scheduled' CHECK (execution_type IN ('scheduled', 'manual', 'ondemand')),
  source_name TEXT NOT NULL,
  product_id TEXT,
  product_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'warning', 'error')),
  offers_found INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  confidence_average NUMERIC(5,2) DEFAULT 95.0
);

-- ----------------------------------------------------------------------------
-- ÍNDICES DE ALTA PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

CREATE INDEX IF NOT EXISTS idx_price_offers_product ON public.price_offers(product_id);
CREATE INDEX IF NOT EXISTS idx_price_offers_source ON public.price_offers(source_id);
CREATE INDEX IF NOT EXISTS idx_price_offers_price ON public.price_offers(price);

CREATE INDEX IF NOT EXISTS idx_price_history_product_date ON public.price_history(product_id, date);
CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON public.price_history(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_price_searches_query ON public.price_searches(query);
CREATE INDEX IF NOT EXISTS idx_price_searches_cached ON public.price_searches(cached_until);

CREATE INDEX IF NOT EXISTS idx_price_logs_timestamp ON public.price_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_price_logs_product ON public.price_logs(product_id);

-- ----------------------------------------------------------------------------
-- HABILITAÇÃO DO ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- REMOÇÃO PRÉVIA DIRETA DE POLICIES (Garante idempotência estrita)
-- ----------------------------------------------------------------------------
-- Products
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Service role full access products" ON public.products;

-- Price Sources
DROP POLICY IF EXISTS "Public read price_sources" ON public.price_sources;
DROP POLICY IF EXISTS "Service role full access price_sources" ON public.price_sources;

-- Price Offers
DROP POLICY IF EXISTS "Public read price_offers" ON public.price_offers;
DROP POLICY IF EXISTS "Service role full access price_offers" ON public.price_offers;

-- Price History
DROP POLICY IF EXISTS "Public read price_history" ON public.price_history;
DROP POLICY IF EXISTS "Service role full access price_history" ON public.price_history;

-- Price Searches (Interno / Admin)
DROP POLICY IF EXISTS "Public read price_searches" ON public.price_searches;
DROP POLICY IF EXISTS "Service role full access price_searches" ON public.price_searches;

-- Price Logs (Interno / Admin)
DROP POLICY IF EXISTS "Public read price_logs" ON public.price_logs;
DROP POLICY IF EXISTS "Service role full access price_logs" ON public.price_logs;

-- ----------------------------------------------------------------------------
-- CRIAÇÃO DAS POLÍTICAS: LEITURA PÚBLICA (Frontend / Catálogo Aberto)
-- ----------------------------------------------------------------------------
CREATE POLICY "Public read products" 
  ON public.products 
  FOR SELECT 
  USING (true);

CREATE POLICY "Public read price_sources" 
  ON public.price_sources 
  FOR SELECT 
  USING (true);

CREATE POLICY "Public read price_offers" 
  ON public.price_offers 
  FOR SELECT 
  USING (true);

CREATE POLICY "Public read price_history" 
  ON public.price_history 
  FOR SELECT 
  USING (true);

-- ----------------------------------------------------------------------------
-- CRIAÇÃO DAS POLÍTICAS: ESCRITA E ACESSO EXCLUSIVO SERVICE_ROLE (Backend)
-- ----------------------------------------------------------------------------
-- Tabelas com leitura pública recebem escrita exclusiva para service_role:
CREATE POLICY "Service role full access products" 
  ON public.products 
  FOR ALL 
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access price_sources" 
  ON public.price_sources 
  FOR ALL 
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access price_offers" 
  ON public.price_offers 
  FOR ALL 
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access price_history" 
  ON public.price_history 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Tabelas restritas (price_searches e price_logs são 100% fechadas para anônimos):
CREATE POLICY "Service role full access price_searches" 
  ON public.price_searches 
  FOR ALL 
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access price_logs" 
  ON public.price_logs 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- CARGA INICIAL IDEMPOTENTE: FONTES HOMOLOGADAS
-- ----------------------------------------------------------------------------
INSERT INTO public.price_sources (id, name, slug, logo_url, base_url, status, reliability_score, scrape_interval_minutes, parser_type)
VALUES
  ('src_kabum', 'KaBuM!', 'kabum', NULL, 'https://www.kabum.com.br', 'active', 98.0, 30, 'html_scraper'),
  ('src_amazon', 'Amazon Brasil', 'amazon-br', NULL, 'https://www.amazon.com.br', 'active', 99.0, 15, 'api_connector'),
  ('src_pichau', 'Pichau Informática', 'pichau', NULL, 'https://www.pichau.com.br', 'active', 96.0, 45, 'html_scraper'),
  ('src_terabyte', 'TerabyteShop', 'terabyte', NULL, 'https://www.terabyteshop.com.br', 'active', 95.0, 60, 'html_scraper'),
  ('src_mercadolivre', 'Mercado Livre (Lojas Oficiais)', 'mercadolivre', NULL, 'https://www.mercadolivre.com.br', 'active', 94.0, 30, 'api_connector'),
  ('src_magalu', 'Magazine Luiza', 'magalu', NULL, 'https://www.magazineluiza.com.br', 'active', 92.0, 60, 'html_scraper')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  base_url = EXCLUDED.base_url,
  status = EXCLUDED.status,
  reliability_score = EXCLUDED.reliability_score;
