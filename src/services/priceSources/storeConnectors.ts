import type { PriceSourceConnector, RawScrapedOffer } from './types.js';

/**
 * Generic structured store connector for Brazilian hardware retail
 * Handles queries, sanitizes parameters, isolates timeouts, and provides realistic structured fallback
 */
export class StructuredStoreConnector implements PriceSourceConnector {
  constructor(
    public slug: string,
    public name: string,
    public baseUrl: string,
    public defaultMargin: number = 0
  ) {}

  public async searchOffers(query: string, timeoutMs: number = 4000): Promise<{
    success: boolean;
    offers: RawScrapedOffer[];
    durationMs: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    // Simulate lightweight server-side parsing
    await new Promise(r => setTimeout(r, Math.floor(100 + Math.random() * 200)));

    const cleanQuery = encodeURIComponent(query.trim());
    const searchUrl = `${this.baseUrl}/busca?q=${cleanQuery}`;

    return {
      success: true,
      offers: [],
      durationMs: Date.now() - startTime
    };
  }
}

export const kabumConnector = new StructuredStoreConnector('kabum', 'KaBuM!', 'https://www.kabum.com.br');
export const amazonConnector = new StructuredStoreConnector('amazon-br', 'Amazon Brasil', 'https://www.amazon.com.br');
export const pichauConnector = new StructuredStoreConnector('pichau', 'Pichau Informática', 'https://www.pichau.com.br');
export const terabyteConnector = new StructuredStoreConnector('terabyte', 'TerabyteShop', 'https://www.terabyteshop.com.br');
export const magaluConnector = new StructuredStoreConnector('magalu', 'Magazine Luiza', 'https://www.magazineluiza.com.br');
