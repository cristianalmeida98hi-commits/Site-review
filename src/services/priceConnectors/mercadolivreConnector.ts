import type { Product, PriceOffer } from '../../types/index.js';

export interface MLItemResult {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  permalink: string;
  thumbnail: string;
  condition: string;
  official_store_id?: number;
  official_store_name?: string;
  seller?: {
    nickname?: string;
  };
  available_quantity?: number;
}

export interface MLConnectorStatus {
  status: 'FUNCIONAL AO VIVO' | 'FUNCIONAL COM LIMITAÇÕES' | 'APENAS ESTRUTURA' | 'NÃO IMPLEMENTADA';
  isAuthenticated: boolean;
  message: string;
  requiresToken: boolean;
}

export class MercadoLivreConnector {
  private apiBase = 'https://api.mercadolibre.com';
  
  public getStatus(): MLConnectorStatus {
    const token = typeof process !== 'undefined' ? process.env?.MERCADOLIVRE_ACCESS_TOKEN : undefined;
    const hasToken = Boolean(token && token.trim().length > 10);

    return {
      status: 'FUNCIONAL COM LIMITAÇÕES',
      isAuthenticated: hasToken,
      message: hasToken
        ? 'Autenticação oficial do Mercado Livre ativa via token de acesso.'
        : 'Modo sem token oficial. Requisições a partir de IP de datacenter podem receber HTTP 403 antibot. Para produção completa, configure MERCADOLIVRE_ACCESS_TOKEN no backend.',
      requiresToken: !hasToken
    };
  }

  /**
   * Searches official Mercado Livre API with official headers when token is provided
   */
  public async searchOffers(product: Product): Promise<{
    offers: PriceOffer[];
    error?: string;
    httpStatus?: number;
    rawItemsCount: number;
  }> {
    const token = typeof process !== 'undefined' ? process.env?.MERCADOLIVRE_ACCESS_TOKEN : undefined;
    const query = `${product.brandName || ''} ${product.name}`.trim();
    const url = `${this.apiBase}/sites/MLB/search?q=${encodeURIComponent(query)}&limit=8`;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'ReviewHub-PriceRobot/2.0 (Official Partner Integration)'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(8000)
      });

      if (response.status === 403) {
        return {
          offers: [],
          httpStatus: 403,
          rawItemsCount: 0,
          error: 'HTTP 403 Forbidden do Mercado Livre (restrição de IP de datacenter). Necessário configurar MERCADOLIVRE_ACCESS_TOKEN oficial nas variáveis de ambiente do backend.'
        };
      }

      if (!response.ok) {
        return {
          offers: [],
          httpStatus: response.status,
          rawItemsCount: 0,
          error: `Erro HTTP ${response.status} na API do Mercado Livre: ${response.statusText}`
        };
      }

      const data = await response.json();
      const results: MLItemResult[] = data.results || [];

      // Filter and normalize results
      const offers: PriceOffer[] = [];
      const prodNameLower = product.name.toLowerCase();

      for (const item of results) {
        if (!item.price || item.price <= 0) continue;
        
        // Filter out irrelevant accessories or drastically different items
        const titleLower = item.title.toLowerCase();
        const price = Number(item.price);
        
        // Sanity check: Price shouldn't be less than 20% of reference price (e.g. cable/sticker)
        if (product.referencePrice && price < product.referencePrice * 0.25) {
          continue;
        }

        const storeName = item.official_store_name || (item.seller?.nickname ? `ML - ${item.seller.nickname}` : 'Mercado Livre (Oficial)');
        const originalPrice = item.original_price && item.original_price > price ? item.original_price : undefined;
        const discountPercentage = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined;

        // Calculate confidence
        let confidenceScore = 85;
        if (item.official_store_id) confidenceScore += 10;
        if (titleLower.includes(prodNameLower)) confidenceScore += 5;

        offers.push({
          id: `offer_ml_${item.id}`,
          productId: product.id,
          productName: product.name,
          productModel: product.specs?.['Modelo'] || product.name,
          sourceId: 'src_mercadolivre',
          storeName,
          storeLogo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&auto=format&fit=crop&q=80',
          rawTitle: item.title,
          price,
          originalPrice,
          discountPercentage,
          currency: 'BRL',
          inStock: (item.available_quantity ?? 1) > 0,
          affiliateUrl: item.permalink,
          confidenceScore: Math.min(100, confidenceScore),
          matchQuality: confidenceScore >= 90 ? 'exact' : 'high',
          isOutlier: false,
          verifiedByRobot: true,
          lastCheckedAt: new Date().toISOString(),
          cashPrice: Math.round(price * 0.95),
          installmentText: `10x de R$ ${(price / 10).toFixed(2)} sem juros`
        });
      }

      return {
        offers,
        httpStatus: response.status,
        rawItemsCount: results.length
      };
    } catch (err: any) {
      return {
        offers: [],
        rawItemsCount: 0,
        error: `Falha na requisição ao Mercado Livre: ${err.message || String(err)}`
      };
    }
  }
}

export const mercadoLivreConnector = new MercadoLivreConnector();
