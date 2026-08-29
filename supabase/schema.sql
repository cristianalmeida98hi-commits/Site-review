-- ==============================================================================
-- C-REVIEW — SUPABASE POSTGRESQL SCHEMA FOR PRICE ROBOT & CATALOG
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    brand_id TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    image_url TEXT,
    description TEXT,
    current_best_price NUMERIC(12, 2) DEFAULT 0,
    reference_price NUMERIC(12, 2) DEFAULT 0,
    ideal_price NUMERIC(12, 2) DEFAULT 0,
    recommendation_verdict TEXT DEFAULT 'RECOMENDADO',
    verdict_reason TEXT,
    target_audience TEXT,
    pros JSONB DEFAULT '[]'::jsonb,
    cons JSONB DEFAULT '[]'::jsonb,
    specs JSONB DEFAULT '{}'::jsonb,
    specifications_detailed JSONB DEFAULT '{}'::jsonb,
    rating_overall NUMERIC(3, 1) DEFAULT 9.0,
    performance_score NUMERIC(3, 1) DEFAULT 9.0,
    cost_benefit_score NUMERIC(3, 1) DEFAULT 8.8,
    quality_score NUMERIC(3, 1) DEFAULT 8.9,
    durability_score NUMERIC(3, 1) DEFAULT 8.7,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on slug & category for fast lookups
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_best_price ON public.products(current_best_price);

-- 2. PRICE SOURCES TABLE (Lojas e Fontes Homologadas)
CREATE TABLE IF NOT EXISTS public.price_sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    base_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'maintenance')),
    reliability_score INTEGER DEFAULT 95 CHECK (reliability_score >= 0 AND reliability_score <= 100),
    parser_type TEXT DEFAULT 'api_connector' CHECK (parser_type IN ('api_connector', 'html_scraper', 'custom_feed')),
    scrape_interval_minutes INTEGER DEFAULT 30,
    error_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_sources_status ON public.price_sources(status);

-- 3. PRICE OFFERS TABLE (Ofertas ativas capturadas e normalizadas pelo robô)
CREATE TABLE IF NOT EXISTS public.price_offers (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    source_id TEXT NOT NULL REFERENCES public.price_sources(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    store_logo TEXT,
    raw_title TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    original_price NUMERIC(12, 2),
    cash_price NUMERIC(12, 2),
    discount_percentage INTEGER DEFAULT 0,
    currency TEXT DEFAULT 'BRL',
    in_stock BOOLEAN DEFAULT true,
    affiliate_url TEXT NOT NULL,
    coupon_code TEXT,
    coupon_discount_text TEXT,
    installment_text TEXT,
    confidence_score INTEGER DEFAULT 95 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    match_quality TEXT DEFAULT 'exact' CHECK (match_quality IN ('exact', 'high', 'medium', 'low')),
    is_outlier BOOLEAN DEFAULT false,
    verified_by_robot BOOLEAN DEFAULT true,
    last_checked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_product_source UNIQUE (product_id, source_id)
);

CREATE INDEX IF NOT EXISTS idx_price_offers_product ON public.price_offers(product_id);
CREATE INDEX IF NOT EXISTS idx_price_offers_source ON public.price_offers(source_id);
CREATE INDEX IF NOT EXISTS idx_price_offers_price ON public.price_offers(price);
CREATE INDEX IF NOT EXISTS idx_price_offers_stock ON public.price_offers(in_stock);

-- 4. PRICE HISTORY TABLE (Série temporal para gráficos de 7d, 30d, 60d, 90d)
CREATE TABLE IF NOT EXISTS public.price_history (
    id BIGSERIAL PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    source_id TEXT REFERENCES public.price_sources(id) ON DELETE SET NULL,
    store_name TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    original_price NUMERIC(12, 2),
    is_lowest_ever BOOLEAN DEFAULT false,
    collected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_product_date ON public.price_history(product_id, collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_price ON public.price_history(price);

-- 5. PRICE SEARCHES TABLE (Log de termos consultados pelo robô ou usuários)
CREATE TABLE IF NOT EXISTS public.price_searches (
    id BIGSERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    source_id TEXT REFERENCES public.price_sources(id) ON DELETE SET NULL,
    results_count INTEGER DEFAULT 0,
    min_price_found NUMERIC(12, 2),
    max_price_found NUMERIC(12, 2),
    duration_ms INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_searches_query ON public.price_searches(query);
CREATE INDEX IF NOT EXISTS idx_price_searches_date ON public.price_searches(created_at DESC);

-- 6. PRICE LOGS TABLE (Auditoria e saúde do robô de preços)
CREATE TABLE IF NOT EXISTS public.price_logs (
    id TEXT PRIMARY KEY,
    execution_type TEXT NOT NULL DEFAULT 'scheduled' CHECK (execution_type IN ('scheduled', 'manual', 'event_triggered')),
    source_name TEXT NOT NULL,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT,
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'warning', 'error')),
    offers_found INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    confidence_average INTEGER DEFAULT 95,
    message TEXT,
    error_details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_logs_status ON public.price_logs(status);
CREATE INDEX IF NOT EXISTS idx_price_logs_date ON public.price_logs(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_logs ENABLE ROW LEVEL SECURITY;

-- Public READ for catalog & offers
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Price Sources" ON public.price_sources FOR SELECT USING (true);
CREATE POLICY "Public Read Price Offers" ON public.price_offers FOR SELECT USING (true);
CREATE POLICY "Public Read Price History" ON public.price_history FOR SELECT USING (true);
CREATE POLICY "Public Read Price Searches" ON public.price_searches FOR SELECT USING (true);
CREATE POLICY "Public Read Price Logs" ON public.price_logs FOR SELECT USING (true);

-- Service Role / Server full access
CREATE POLICY "Service Role Full Access Products" ON public.products FOR ALL USING (auth.jwt() IS NOT NULL OR current_user = 'postgres' OR current_user = 'service_role');
CREATE POLICY "Service Role Full Access Sources" ON public.price_sources FOR ALL USING (auth.jwt() IS NOT NULL OR current_user = 'postgres' OR current_user = 'service_role');
CREATE POLICY "Service Role Full Access Offers" ON public.price_offers FOR ALL USING (auth.jwt() IS NOT NULL OR current_user = 'postgres' OR current_user = 'service_role');
CREATE POLICY "Service Role Full Access History" ON public.price_history FOR ALL USING (auth.jwt() IS NOT NULL OR current_user = 'postgres' OR current_user = 'service_role');
CREATE POLICY "Service Role Full Access Searches" ON public.price_searches FOR ALL USING (auth.jwt() IS NOT NULL OR current_user = 'postgres' OR current_user = 'service_role');
CREATE POLICY "Service Role Full Access Logs" ON public.price_logs FOR ALL USING (auth.jwt() IS NOT NULL OR current_user = 'postgres' OR current_user = 'service_role');

-- ==============================================================================
-- SEED DEFAULT PRICE SOURCES
-- ==============================================================================

INSERT INTO public.price_sources (id, name, slug, logo_url, base_url, status, reliability_score, parser_type, scrape_interval_minutes, success_count)
VALUES 
  ('src_mercadolivre', 'Mercado Livre (Lojas Oficiais)', 'mercadolivre', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&auto=format&fit=crop&q=80', 'https://www.mercadolivre.com.br', 'active', 98, 'api_connector', 15, 1240),
  ('src_kabum', 'KaBuM!', 'kabum', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80', 'https://www.kabum.com.br', 'active', 98, 'html_scraper', 30, 890),
  ('src_amazon', 'Amazon Brasil', 'amazon-br', 'https://images.unsplash.com/photo-1523474255658-4af61b1684c2?w=100&auto=format&fit=crop&q=80', 'https://www.amazon.com.br', 'active', 99, 'api_connector', 15, 1420),
  ('src_pichau', 'Pichau Informática', 'pichau', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=100&auto=format&fit=crop&q=80', 'https://www.pichau.com.br', 'active', 96, 'html_scraper', 45, 620),
  ('src_terabyte', 'TerabyteShop', 'terabyte', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=100&auto=format&fit=crop&q=80', 'https://www.terabyteshop.com.br', 'active', 95, 'html_scraper', 60, 510),
  ('src_magalu', 'Magazine Luiza', 'magalu', 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100&auto=format&fit=crop&q=80', 'https://www.magazineluiza.com.br', 'active', 92, 'html_scraper', 60, 430)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  reliability_score = EXCLUDED.reliability_score;
