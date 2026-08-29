export interface RawScrapedOffer {
  externalId: string;
  sourceSlug: string;
  storeName: string;
  title: string;
  price: number;
  originalPrice?: number;
  currency: string;
  productUrl: string;
  imageUrl?: string;
  inStock: boolean;
  sellerName?: string;
  sellerRating?: string;
  freeShipping?: boolean;
  couponText?: string;
  couponCode?: string;
  installmentText?: string;
  scrapedAt: string;
}

export interface PriceSourceConnector {
  slug: string;
  name: string;
  searchOffers(query: string, timeoutMs?: number): Promise<{
    success: boolean;
    offers: RawScrapedOffer[];
    durationMs: number;
    error?: string;
  }>;
}
