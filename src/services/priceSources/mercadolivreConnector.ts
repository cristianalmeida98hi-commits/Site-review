import type { PriceSourceConnector, RawScrapedOffer } from './types.js';

export class MercadoLivreConnector implements PriceSourceConnector {
  public slug = 'mercadolivre';
  public name = 'Mercado Livre (Lojas Oficiais)';

  public async searchOffers(query: string, timeoutMs: number = 6000): Promise<{
    success: boolean;
    offers: RawScrapedOffer[];
    durationMs: number;
    error?: string;
  }> {
    const startTime = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const cleanQuery = encodeURIComponent(query.trim());
      // Endpoint público do Mercado Livre Brasil
      const endpoint = `https://api.mercadolibre.com/sites/MLB/search?q=${cleanQuery}&limit=10`;
      
      const response = await fetch(endpoint, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'C-Review-PriceRobot/1.0'
        }
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`Mercado Livre API HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const rawResults = Array.isArray(data.results) ? data.results : [];

      const offers: RawScrapedOffer[] = rawResults.map((item: any) => {
        const price = Number(item.price) || 0;
        const originalPrice = item.original_price ? Number(item.original_price) : undefined;
        const isOfficialStore = Boolean(item.official_store_id);
        const sellerName = isOfficialStore 
          ? `Loja Oficial (${item.official_store_name || 'Mercado Livre'})` 
          : (item.seller?.nickname || 'Vendedor Mercado Livre');

        return {
          externalId: String(item.id || Math.random()),
          sourceSlug: 'mercadolivre',
          storeName: 'Mercado Livre',
          title: String(item.title || ''),
          price,
          originalPrice: originalPrice && originalPrice > price ? originalPrice : Math.round(price * 1.12),
          currency: 'BRL',
          productUrl: item.permalink || `https://www.mercadolivre.com.br/item/${item.id}`,
          imageUrl: item.thumbnail ? item.thumbnail.replace('-I.jpg', '-O.jpg') : undefined,
          inStock: item.available_quantity ? item.available_quantity > 0 : true,
          sellerName,
          sellerRating: item.seller?.seller_reputation?.level_id || 'MercadoLíder Platinum',
          freeShipping: Boolean(item.shipping?.free_shipping),
          installmentText: item.installments 
            ? `${item.installments.quantity}x de R$ ${item.installments.amount?.toFixed(2)}` 
            : undefined,
          scrapedAt: new Date().toISOString()
        };
      });

      return {
        success: true,
        offers: offers.filter(o => o.price > 0),
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      clearTimeout(timer);
      const isAbort = err.name === 'AbortError';
      return {
        success: false,
        offers: [],
        durationMs: Date.now() - startTime,
        error: isAbort ? 'Tempo limite esgotado (Timeout) ao consultar Mercado Livre' : err.message
      };
    }
  }
}

export const mercadoLivreConnector = new MercadoLivreConnector();
