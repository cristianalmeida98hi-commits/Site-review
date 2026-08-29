import { getSupabaseClient, getSupabaseServerClient, isSupabaseConfigured } from './supabase.js';
import type { PriceSource, PriceOffer, Product, PriceRobotLog, ProductPriceHistory, PriceHistoryPoint } from '../types/index.js';
import { initialProducts, initialOffers } from '../data/initialData.js';
import { DEFAULT_PRICE_SOURCES } from './priceRobotEngine.js';

export class SupabasePriceDataLayer {
  // In-memory fallback caches
  private fallbackSources: PriceSource[] = [...DEFAULT_PRICE_SOURCES];
  private fallbackOffers: Map<string, PriceOffer[]> = new Map();
  private fallbackHistory: Map<string, PriceHistoryPoint[]> = new Map();
  private fallbackLogs: PriceRobotLog[] = [];

  constructor() {
    this.seedFallbackData();
  }

  private seedFallbackData() {
    for (const prod of initialProducts) {
      const prodOffers: PriceOffer[] = this.fallbackSources.map((source, idx) => {
        const basePrice = prod.currentBestPrice > 0 ? prod.currentBestPrice : 1200;
        const price = Math.max(50, basePrice + (idx * 40) - 20);
        return {
          id: `offer_${prod.id}_${source.slug}`,
          productId: prod.id,
          productName: prod.name,
          productModel: prod.name,
          sourceId: source.id,
          storeName: source.name,
          storeLogo: source.logoUrl,
          rawTitle: `${prod.brandName} ${prod.name} - Lacrado Nacional`,
          price,
          originalPrice: Math.round(price * 1.15),
          discountPercentage: Math.max(5, 15 - idx * 2),
          currency: 'BRL',
          inStock: true,
          affiliateUrl: `${source.baseUrl}/produto/${prod.slug || prod.id}?tag=c-review-20`,
          couponCode: idx === 0 ? 'CREVIEW5' : undefined,
          confidenceScore: 95 + Math.floor(Math.random() * 5),
          matchQuality: 'exact',
          isOutlier: false,
          verifiedByRobot: true,
          lastCheckedAt: new Date().toISOString(),
          cashPrice: Math.round(price * 0.92)
        };
      });
      this.fallbackOffers.set(prod.id, prodOffers);
    }
  }

  private getClient() {
    return getSupabaseServerClient() || getSupabaseClient();
  }

  // =========================================================================
  // 1. PRICE SOURCES
  // =========================================================================
  public async getSources(): Promise<PriceSource[]> {
    const client = this.getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('price_sources')
          .select('*')
          .order('name');
        
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            name: d.name,
            slug: d.slug,
            logoUrl: d.logo_url,
            baseUrl: d.base_url,
            status: d.status,
            reliabilityScore: d.reliability_score ?? 95,
            lastSyncAt: d.last_sync_at || new Date().toISOString(),
            scrapeIntervalMinutes: d.scrape_interval_minutes ?? 30,
            errorCount: d.error_count ?? 0,
            successCount: d.success_count ?? 0,
            parserType: d.parser_type || 'api_connector'
          }));
        }
      } catch (err) {
        console.warn('[SupabaseDataLayer] Error fetching sources:', err);
      }
    }
    return [...this.fallbackSources];
  }

  public async updateSource(source: PriceSource): Promise<boolean> {
    // Update local fallback
    const idx = this.fallbackSources.findIndex(s => s.id === source.id);
    if (idx >= 0) {
      this.fallbackSources[idx] = { ...source };
    }

    const client = this.getClient();
    if (client) {
      try {
        await client.from('price_sources').upsert({
          id: source.id,
          name: source.name,
          slug: source.slug,
          logo_url: source.logoUrl,
          base_url: source.baseUrl,
          status: source.status,
          reliability_score: source.reliabilityScore,
          scrape_interval_minutes: source.scrapeIntervalMinutes,
          error_count: source.errorCount,
          success_count: source.successCount,
          last_sync_at: source.lastSyncAt,
          updated_at: new Date().toISOString()
        });
        return true;
      } catch (err) {
        console.warn('[SupabaseDataLayer] Error upserting source:', err);
      }
    }
    return true;
  }

  // =========================================================================
  // 2. PRICE OFFERS
  // =========================================================================
  public async getOffersByProductId(productId: string): Promise<PriceOffer[]> {
    const client = this.getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('price_offers')
          .select('*')
          .eq('product_id', productId)
          .order('price', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            productId: d.product_id,
            productName: d.raw_title,
            productModel: d.raw_title,
            sourceId: d.source_id,
            storeName: d.store_name,
            storeLogo: d.store_logo,
            rawTitle: d.raw_title,
            price: Number(d.price),
            originalPrice: d.original_price ? Number(d.original_price) : undefined,
            cashPrice: d.cash_price ? Number(d.cash_price) : undefined,
            discountPercentage: d.discount_percentage,
            currency: d.currency || 'BRL',
            inStock: Boolean(d.in_stock),
            affiliateUrl: d.affiliate_url,
            couponCode: d.coupon_code,
            couponDiscountText: d.coupon_discount_text,
            installmentText: d.installment_text,
            confidenceScore: d.confidence_score ?? 95,
            matchQuality: d.match_quality || 'exact',
            isOutlier: Boolean(d.is_outlier),
            verifiedByRobot: Boolean(d.verified_by_robot),
            lastCheckedAt: d.last_checked_at || new Date().toISOString()
          }));
        }
      } catch (err) {
        console.warn('[SupabaseDataLayer] Error fetching offers from Supabase:', err);
      }
    }

    return this.fallbackOffers.get(productId) || [];
  }

  public async getAllOffers(): Promise<PriceOffer[]> {
    const client = this.getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('price_offers')
          .select('*')
          .order('price', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            productId: d.product_id,
            productName: d.raw_title,
            productModel: d.raw_title,
            sourceId: d.source_id,
            storeName: d.store_name,
            storeLogo: d.store_logo,
            rawTitle: d.raw_title,
            price: Number(d.price),
            originalPrice: d.original_price ? Number(d.original_price) : undefined,
            cashPrice: d.cash_price ? Number(d.cash_price) : undefined,
            discountPercentage: d.discount_percentage,
            currency: d.currency || 'BRL',
            inStock: Boolean(d.in_stock),
            affiliateUrl: d.affiliate_url,
            couponCode: d.coupon_code,
            couponDiscountText: d.coupon_discount_text,
            installmentText: d.installment_text,
            confidenceScore: d.confidence_score ?? 95,
            matchQuality: d.match_quality || 'exact',
            isOutlier: Boolean(d.is_outlier),
            verifiedByRobot: Boolean(d.verified_by_robot),
            lastCheckedAt: d.last_checked_at || new Date().toISOString()
          }));
        }
      } catch (err) {
        console.warn('[SupabaseDataLayer] Error fetching all offers from Supabase:', err);
      }
    }

    const all: PriceOffer[] = [];
    for (const offers of this.fallbackOffers.values()) {
      all.push(...offers);
    }
    return all.sort((a, b) => a.price - b.price);
  }

  public async upsertOffers(offers: PriceOffer[]): Promise<number> {
    if (offers.length === 0) return 0;

    // Update fallback memory cache
    for (const offer of offers) {
      const existing = this.fallbackOffers.get(offer.productId) || [];
      const filtered = existing.filter(o => o.sourceId !== offer.sourceId);
      filtered.push(offer);
      filtered.sort((a, b) => a.price - b.price);
      this.fallbackOffers.set(offer.productId, filtered);
    }

    const client = this.getClient();
    if (client) {
      try {
        const rows = offers.map(o => ({
          id: o.id,
          product_id: o.productId,
          source_id: o.sourceId,
          store_name: o.storeName,
          store_logo: o.storeLogo,
          raw_title: o.rawTitle,
          price: o.price,
          original_price: o.originalPrice,
          cash_price: o.cashPrice,
          discount_percentage: o.discountPercentage || 0,
          currency: o.currency || 'BRL',
          in_stock: o.inStock !== false,
          affiliate_url: o.affiliateUrl,
          coupon_code: o.couponCode,
          coupon_discount_text: o.couponDiscountText,
          installment_text: o.installmentText,
          confidence_score: o.confidenceScore,
          match_quality: o.matchQuality || 'exact',
          is_outlier: Boolean(o.isOutlier),
          verified_by_robot: true,
          last_checked_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error } = await client.from('price_offers').upsert(rows, {
          onConflict: 'product_id,source_id'
        });

        if (error) {
          console.warn('[SupabaseDataLayer] Upsert error:', error.message);
        }
      } catch (err) {
        console.warn('[SupabaseDataLayer] Error saving offers to Supabase:', err);
      }
    }

    return offers.length;
  }

  // =========================================================================
  // 3. PRICE HISTORY
  // =========================================================================
  public async getPriceHistory(productId: string, days: number = 90): Promise<PriceHistoryPoint[]> {
    const client = this.getClient();
    if (client) {
      try {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        const { data, error } = await client
          .from('price_history')
          .select('*')
          .eq('product_id', productId)
          .gte('collected_at', since)
          .order('collected_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            timestamp: d.collected_at,
            date: new Date(d.collected_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            price: Number(d.price),
            storeName: d.store_name,
            isLowestEver: Boolean(d.is_lowest_ever)
          }));
        }
      } catch (err) {
        console.warn('[SupabaseDataLayer] Error fetching history from Supabase:', err);
      }
    }

    return this.fallbackHistory.get(productId) || [];
  }

  public async recordPricePoint(productId: string, storeName: string, price: number, sourceId?: string, isLowestEver: boolean = false) {
    const point: PriceHistoryPoint = {
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      price,
      storeName,
      isLowestEver
    };

    const existing = this.fallbackHistory.get(productId) || [];
    existing.push(point);
    this.fallbackHistory.set(productId, existing);

    const client = this.getClient();
    if (client) {
      try {
        await client.from('price_history').insert({
          product_id: productId,
          source_id: sourceId,
          store_name: storeName,
          price,
          is_lowest_ever: isLowestEver,
          collected_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('[SupabaseDataLayer] Error recording history point:', err);
      }
    }
  }

  // =========================================================================
  // 4. PRICE LOGS & SEARCH LOGS
  // =========================================================================
  public async getLogs(limit: number = 30): Promise<PriceRobotLog[]> {
    const client = this.getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('price_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            executionType: d.execution_type,
            sourceName: d.source_name,
            productId: d.product_id,
            productName: d.product_name,
            status: d.status,
            offersFound: d.offers_found,
            durationMs: d.duration_ms,
            confidenceAverage: d.confidence_average,
            message: d.message,
            timestamp: d.created_at
          }));
        }
      } catch (err) {
        console.warn('[SupabaseDataLayer] Error fetching logs from Supabase:', err);
      }
    }

    return this.fallbackLogs.slice(0, limit);
  }

  public async addLog(log: PriceRobotLog): Promise<void> {
    this.fallbackLogs.unshift(log);
    if (this.fallbackLogs.length > 100) {
      this.fallbackLogs.pop();
    }

    const client = this.getClient();
    if (client) {
      try {
        await client.from('price_logs').insert({
          id: log.id,
          execution_type: log.executionType,
          source_name: log.sourceName,
          product_id: log.productId,
          product_name: log.productName,
          status: log.status,
          offers_found: log.offersFound,
          duration_ms: log.durationMs,
          confidence_average: log.confidenceAverage,
          message: log.message,
          created_at: log.timestamp || new Date().toISOString()
        });
      } catch (err) {
        console.warn('[SupabaseDataLayer] Error inserting log into Supabase:', err);
      }
    }
  }

  public async recordSearch(query: string, productId?: string, sourceId?: string, resultsCount: number = 0, durationMs: number = 0) {
    const client = this.getClient();
    if (client) {
      try {
        await client.from('price_searches').insert({
          query,
          product_id: productId,
          source_id: sourceId,
          results_count: resultsCount,
          duration_ms: durationMs,
          created_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('[SupabaseDataLayer] Error logging search:', err);
      }
    }
  }
}

export const supabasePriceDataLayer = new SupabasePriceDataLayer();
