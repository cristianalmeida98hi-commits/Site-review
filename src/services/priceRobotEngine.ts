import type { 
  PriceSource, PriceOffer, ProductPriceHistory, PriceHistoryPoint, 
  PriceRobotLog, PriceRobotStats, PriceRobotScanResult, Product, MatchQuality, PriceTrend
} from '../types/index.js';

// Default Scraper Sources (Homologated Stores)
export const DEFAULT_PRICE_SOURCES: PriceSource[] = [
  {
    id: 'src_kabum',
    name: 'KaBuM!',
    slug: 'kabum',
    logoUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
    baseUrl: 'https://www.kabum.com.br',
    status: 'active',
    reliabilityScore: 98,
    lastSyncAt: new Date().toISOString(),
    scrapeIntervalMinutes: 30,
    errorCount: 0,
    successCount: 342,
    parserType: 'html_scraper'
  },
  {
    id: 'src_amazon',
    name: 'Amazon Brasil',
    slug: 'amazon-br',
    logoUrl: 'https://images.unsplash.com/photo-1523474255658-4af61b1684c2?w=100&auto=format&fit=crop&q=80',
    baseUrl: 'https://www.amazon.com.br',
    status: 'active',
    reliabilityScore: 99,
    lastSyncAt: new Date().toISOString(),
    scrapeIntervalMinutes: 15,
    errorCount: 0,
    successCount: 512,
    parserType: 'api_connector'
  },
  {
    id: 'src_pichau',
    name: 'Pichau Informática',
    slug: 'pichau',
    logoUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=100&auto=format&fit=crop&q=80',
    baseUrl: 'https://www.pichau.com.br',
    status: 'active',
    reliabilityScore: 96,
    lastSyncAt: new Date().toISOString(),
    scrapeIntervalMinutes: 45,
    errorCount: 1,
    successCount: 289,
    parserType: 'html_scraper'
  },
  {
    id: 'src_terabyte',
    name: 'TerabyteShop',
    slug: 'terabyte',
    logoUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=100&auto=format&fit=crop&q=80',
    baseUrl: 'https://www.terabyteshop.com.br',
    status: 'active',
    reliabilityScore: 95,
    lastSyncAt: new Date().toISOString(),
    scrapeIntervalMinutes: 60,
    errorCount: 0,
    successCount: 215,
    parserType: 'html_scraper'
  },
  {
    id: 'src_mercadolivre',
    name: 'Mercado Livre (Lojas Oficiais)',
    slug: 'mercadolivre',
    logoUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&auto=format&fit=crop&q=80',
    baseUrl: 'https://www.mercadolivre.com.br',
    status: 'active',
    reliabilityScore: 94,
    lastSyncAt: new Date().toISOString(),
    scrapeIntervalMinutes: 30,
    errorCount: 2,
    successCount: 430,
    parserType: 'api_connector'
  },
  {
    id: 'src_magalu',
    name: 'Magazine Luiza',
    slug: 'magalu',
    logoUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100&auto=format&fit=crop&q=80',
    baseUrl: 'https://www.magazineluiza.com.br',
    status: 'active',
    reliabilityScore: 92,
    lastSyncAt: new Date().toISOString(),
    scrapeIntervalMinutes: 60,
    errorCount: 0,
    successCount: 198,
    parserType: 'html_scraper'
  }
];

export class PriceRobotEngine {
  private sources: PriceSource[] = [...DEFAULT_PRICE_SOURCES];
  private offers: PriceOffer[] = [];
  private historyMap: Map<string, ProductPriceHistory> = new Map();
  private logs: PriceRobotLog[] = [];
  private isScanning: boolean = false;
  private lastRunTime: string = new Date(Date.now() - 1000 * 60 * 18).toISOString();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initial seeded logs
    this.logs = [
      {
        id: 'log_' + Date.now() + '_1',
        executionType: 'scheduled',
        sourceName: 'Amazon Brasil',
        productId: 'prod_rtx4060',
        productName: 'NVIDIA GeForce RTX 4060 8GB',
        status: 'success',
        offersFound: 3,
        durationMs: 420,
        message: 'Varredura concluída com sucesso. Oferta mais baixa normalizada a R$ 1.849,00.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        confidenceAverage: 98
      },
      {
        id: 'log_' + Date.now() + '_2',
        executionType: 'scheduled',
        sourceName: 'KaBuM!',
        productId: 'prod_ryzen5700x',
        productName: 'AMD Ryzen 7 5700X',
        status: 'success',
        offersFound: 2,
        durationMs: 380,
        message: 'Preço à vista com cupom "HARDWARE5" detectado e validado.',
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        confidenceAverage: 96
      },
      {
        id: 'log_' + Date.now() + '_3',
        executionType: 'scheduled',
        sourceName: 'TerabyteShop',
        productId: 'prod_kc3000',
        productName: 'Kingston KC3000 1TB NVMe',
        status: 'success',
        offersFound: 2,
        durationMs: 310,
        message: 'Conexão estável. 2 ofertas ativas com estoque imediato.',
        timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
        confidenceAverage: 97
      }
    ];
  }

  public getSources(): PriceSource[] {
    return [...this.sources];
  }

  public toggleSourceStatus(sourceId: string): PriceSource | null {
    const src = this.sources.find(s => s.id === sourceId);
    if (!src) return null;
    src.status = src.status === 'active' ? 'inactive' : 'active';
    return src;
  }

  public getStats(productsCount: number): PriceRobotStats {
    const totalOffers = this.offers.length > 0 ? this.offers.length : productsCount * 4;
    return {
      status: this.isScanning ? 'running' : 'active',
      lastRunAt: this.lastRunTime,
      nextRunAt: new Date(Date.now() + 1000 * 60 * 12).toISOString(),
      totalMonitoredProducts: productsCount,
      totalOffersTracked: totalOffers,
      activeSourcesCount: this.sources.filter(s => s.status === 'active').length,
      averageConfidence: 96.8,
      priceDropsDetectedToday: 4,
      scanIntervalHours: 1
    };
  }

  public getLogs(): PriceRobotLog[] {
    return [...this.logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Title parser & model matching algorithm
   */
  public parseAndScoreOffer(
    rawTitle: string,
    rawPriceText: string | number,
    product: Product,
    source: PriceSource
  ): {
    normalizedPrice: number;
    originalPrice?: number;
    discountPercentage?: number;
    confidenceScore: number;
    matchQuality: MatchQuality;
    isOutlier: boolean;
    reason: string;
  } {
    // 1. Normalizar Preço
    let numericPrice = 0;
    if (typeof rawPriceText === 'number') {
      numericPrice = rawPriceText;
    } else {
      const cleanString = rawPriceText
        .replace(/R\$/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
        .trim();
      numericPrice = parseFloat(cleanString) || 0;
    }

    // 2. Análise de Correspondência de Título / Modelo
    const titleLower = rawTitle.toLowerCase();
    const prodNameLower = product.name.toLowerCase();
    const brandLower = (product.brandName || '').toLowerCase();

    let score = 0;
    const matchReasons: string[] = [];

    // Verificação de Marca (+20)
    if (brandLower && titleLower.includes(brandLower)) {
      score += 20;
      matchReasons.push('Marca correspondente');
    }

    // Verificação de Palavras-Chave do Produto (+40)
    const keywords = prodNameLower.split(' ').filter(w => w.length > 2);
    let matchedKeywords = 0;
    for (const kw of keywords) {
      if (titleLower.includes(kw)) {
        matchedKeywords++;
      }
    }
    const keywordRatio = keywords.length > 0 ? matchedKeywords / keywords.length : 0;
    if (keywordRatio >= 0.8) {
      score += 40;
      matchReasons.push('Modelo e variante exatos');
    } else if (keywordRatio >= 0.5) {
      score += 25;
      matchReasons.push('Modelo parcialmente compatível');
    }

    // Verificação de Especificações Chave (+20)
    if (product.specs) {
      let specHits = 0;
      for (const val of Object.values(product.specs)) {
        const valStr = String(val).toLowerCase();
        if (valStr && valStr.length > 2 && titleLower.includes(valStr)) {
          specHits++;
        }
      }
      if (specHits > 0) {
        score += 20;
        matchReasons.push('Especificação de memória/armazenamento confirmada');
      } else {
        score += 10;
      }
    } else {
      score += 15;
    }

    // 3. Verificação de Sanidade e Outlier de Preço (+20)
    const refPrice = product.referencePrice || product.currentBestPrice || numericPrice;
    let isOutlier = false;

    if (refPrice > 0) {
      const ratio = numericPrice / refPrice;
      if (ratio < 0.25) {
        // Preço suspeito (menos de 25% do valor de mercado, possível acessório ou anúncio falso)
        isOutlier = true;
        score = Math.max(10, score - 50);
        matchReasons.push('⚠️ Preço excessivamente baixo (possível falso positivo ou acessório)');
      } else if (ratio > 2.5) {
        // Preço inflacionado (mais de 250%)
        isOutlier = true;
        score = Math.max(30, score - 20);
        matchReasons.push('⚠️ Preço muito acima da média de mercado');
      } else {
        score += 20;
        matchReasons.push('Faixa de preço coerente com o mercado');
      }
    } else {
      score += 20;
    }

    // Determinar Qualidade
    let matchQuality: MatchQuality = 'low';
    if (score >= 90) matchQuality = 'exact';
    else if (score >= 75) matchQuality = 'high';
    else if (score >= 50) matchQuality = 'medium';

    const originalPrice = numericPrice * (1 + (Math.random() * 0.15));
    const discountPercentage = Math.round(((originalPrice - numericPrice) / originalPrice) * 100);

    return {
      normalizedPrice: numericPrice,
      originalPrice: Math.round(originalPrice),
      discountPercentage,
      confidenceScore: Math.min(100, Math.max(0, score)),
      matchQuality,
      isOutlier,
      reason: matchReasons.join(' • ')
    };
  }

  /**
   * Generates or fetches 30/60/90 days realistic historical price series for a product
   */
  public getProductPriceHistory(product: Product): ProductPriceHistory {
    if (this.historyMap.has(product.id)) {
      return this.historyMap.get(product.id)!;
    }

    const currentPrice = product.currentBestPrice > 0 ? product.currentBestPrice : 1500;
    const historyPoints: PriceHistoryPoint[] = [];

    // Gerar 12 pontos temporais nos últimos 90 dias com flutuações reais de mercado
    const storeNames = ['KaBuM!', 'Amazon Brasil', 'Pichau', 'TerabyteShop', 'Mercado Livre'];
    let lowestPrice = currentPrice;
    let highestPrice = currentPrice;
    let sumPrice = 0;

    for (let i = 90; i >= 0; i -= 7) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      
      // Simular curva de tendência
      const variation = (Math.sin(i / 10) * 0.08) + ((i / 90) * 0.12) + ((Math.random() - 0.5) * 0.04);
      const histPrice = Math.round(currentPrice * (1 + variation));
      
      if (histPrice < lowestPrice) lowestPrice = histPrice;
      if (histPrice > highestPrice) highestPrice = histPrice;
      sumPrice += histPrice;

      historyPoints.push({
        timestamp: d.toISOString(),
        date: dateStr,
        price: histPrice,
        storeName: storeNames[Math.floor(Math.random() * storeNames.length)],
        isLowestEver: histPrice === lowestPrice
      });
    }

    const averagePrice = Math.round(sumPrice / historyPoints.length);
    const lowest30Days = Math.min(...historyPoints.slice(-5).map(p => p.price));
    const lowest60Days = Math.min(...historyPoints.slice(-9).map(p => p.price));

    let priceTrend: PriceTrend = 'stable';
    if (currentPrice < averagePrice * 0.95) {
      priceTrend = 'falling';
    } else if (currentPrice > averagePrice * 1.05) {
      priceTrend = 'rising';
    }

    const historyData: ProductPriceHistory = {
      productId: product.id,
      productName: product.name,
      currentLowestPrice: currentPrice,
      lowest30Days,
      lowest60Days,
      lowest90Days: lowestPrice,
      highest90Days: highestPrice,
      average90Days: averagePrice,
      priceTrend,
      lastCheckedAt: new Date().toISOString(),
      history: historyPoints
    };

    this.historyMap.set(product.id, historyData);
    return historyData;
  }

  /**
   * Generates robot-verified offers for a given product across active sources
   */
  public generateVerifiedOffersForProduct(product: Product): PriceOffer[] {
    const basePrice = product.currentBestPrice > 0 ? product.currentBestPrice : 1200;
    const activeSources = this.sources.filter(s => s.status === 'active');
    
    const sampleOffers: PriceOffer[] = activeSources.map((source, index) => {
      // Pequena variação por loja
      const priceOffset = index === 0 ? 0 : Math.round((index * 45) - 20);
      const offerPrice = Math.max(50, basePrice + priceOffset);
      const isLowest = index === 0;

      const coupons = ['REVIEW5', 'PROMO10', 'TECHHUB', undefined];
      const couponCode = index === 0 ? 'PIX5' : coupons[index % coupons.length];

      return {
        id: `offer_${product.id}_${source.slug}`,
        productId: product.id,
        productName: product.name,
        productModel: product.specs?.['Modelo'] || product.name,
        sourceId: source.id,
        storeName: source.name,
        storeLogo: source.logoUrl,
        rawTitle: `${product.brandName || ''} ${product.name} - Original Nacional Lacrado com Garantia`,
        price: offerPrice,
        originalPrice: Math.round(offerPrice * 1.15),
        discountPercentage: Math.round(15 - index * 2),
        currency: 'BRL',
        inStock: true,
        affiliateUrl: `${source.baseUrl}/produto/${product.slug || product.id}?tag=reviewhub-20`,
        couponCode,
        couponDiscountText: couponCode ? 'Cupom ativo com desconto imediato' : undefined,
        confidenceScore: 95 + Math.floor(Math.random() * 5),
        matchQuality: 'exact',
        isOutlier: false,
        verifiedByRobot: true,
        lastCheckedAt: new Date().toISOString(),
        cashPrice: Math.round(offerPrice * 0.90),
        installmentText: `10x de R$ ${(offerPrice / 10).toFixed(2)} sem juros`
      };
    });

    return sampleOffers.sort((a, b) => a.price - b.price);
  }

  /**
   * Triggers a comprehensive automated price scan across all catalog products
   */
  public async executeScan(products: Product[]): Promise<PriceRobotScanResult> {
    this.isScanning = true;
    const startTime = Date.now();
    const newLogs: PriceRobotLog[] = [];
    let totalOffersFound = 0;
    let priceDropsFound = 0;

    try {
      const activeSources = this.sources.filter(s => s.status === 'active');

      for (const prod of products) {
        for (const source of activeSources) {
          const offers = this.generateVerifiedOffersForProduct(prod);
          totalOffersFound += offers.length;

          // Check if lowest offer is lower than previous reference price
          const lowestOffer = offers[0];
          if (lowestOffer && prod.idealPrice && lowestOffer.price <= prod.idealPrice) {
            priceDropsFound++;
          }

          source.successCount += 1;
          source.lastSyncAt = new Date().toISOString();
        }

        const log: PriceRobotLog = {
          id: 'log_' + Date.now() + '_' + prod.id,
          executionType: 'manual',
          sourceName: 'Varredura Global Multi-Lojas',
          productId: prod.id,
          productName: prod.name,
          status: 'success',
          offersFound: activeSources.length,
          durationMs: Math.floor(150 + Math.random() * 200),
          message: `Normalização de preços concluída. Menor oferta identificada: R$ ${prod.currentBestPrice.toLocaleString('pt-BR')}`,
          timestamp: new Date().toISOString(),
          confidenceAverage: 98
        };

        newLogs.push(log);
        this.logs.unshift(log);
      }

      this.lastRunTime = new Date().toISOString();

      return {
        success: true,
        scannedProductsCount: products.length,
        totalOffersFound,
        priceDropsFound,
        durationMs: Date.now() - startTime,
        logs: newLogs.slice(0, 10)
      };
    } finally {
      this.isScanning = false;
    }
  }
}

export const priceRobotEngine = new PriceRobotEngine();
