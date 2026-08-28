import type { 
  User, Product, Category, Brand, Store, Offer, Review, UserRating, 
  Comment, Favorite, Notification, Conversion, AffiliateClick, Report, AdminLog, AuditLog,
  PlatformSettings, AdBanner, CreatorProfile, CreatorDashboardData 
} from '../types/index.js';

import {
  isFirebaseConfigured,
  getProductsFromFirestore,
  getProductFromFirestore,
  createProductInFirestore,
  updateProductInFirestore,
  getCategoriesFromFirestore,
  getBrandsFromFirestore,
  getOffersFromFirestore,
  getReviewsFromFirestore,
  getReviewByIdFromFirestore,
  testFirestoreConnection,
  seedFirestoreIfEmpty
} from './firebase.js';

import {
  initialSettings,
  initialUsers,
  initialCategories,
  initialBrands,
  initialStores,
  initialProducts,
  initialOffers,
  initialReviews,
  initialUserRatings,
  initialComments,
  initialFavorites,
  initialNotifications,
  initialAffiliateClicks,
  initialConversions,
  initialAdminLogs,
  initialAdBanners
} from '../data/initialData.js';

const API_BASE = '/api';

export const getStoredUserId = (): string | null => {
  try {
    return localStorage.getItem('reviewhub_active_user_id');
  } catch {
    return null;
  }
};

export const setStoredUserId = (userId: string | null) => {
  try {
    if (userId) {
      localStorage.setItem('reviewhub_active_user_id', userId);
    } else {
      localStorage.removeItem('reviewhub_active_user_id');
    }
  } catch (e) {
    console.error('Failed to access localStorage', e);
  }
};

// Client-side Local State Store (Ensures seamless operation if offline or deployed as pure static build)
class LocalDataStore {
  private products: Product[] = [...initialProducts];
  private categories: Category[] = [...initialCategories];
  private brands: Brand[] = [...initialBrands];
  private stores: Store[] = [...initialStores];
  private offers: Offer[] = [...initialOffers];
  private reviews: Review[] = [...initialReviews];
  private userRatings: UserRating[] = [...initialUserRatings];
  private comments: Comment[] = [...initialComments];
  private favorites: Favorite[] = [...initialFavorites];
  private notifications: Notification[] = [...initialNotifications];
  private affiliateClicks: AffiliateClick[] = [...initialAffiliateClicks];
  private conversions: Conversion[] = [...initialConversions];
  private reports: Report[] = [];
  private adminLogs: AdminLog[] = [...initialAdminLogs];
  private adBanners: AdBanner[] = [...initialAdBanners];
  private settings: PlatformSettings = { ...initialSettings };
  private users: User[] = [...initialUsers];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedProds = localStorage.getItem('rh_store_products');
      if (storedProds) this.products = JSON.parse(storedProds);
      const storedRev = localStorage.getItem('rh_store_reviews');
      if (storedRev) this.reviews = JSON.parse(storedRev);
    } catch {
      // Ignore storage errors
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('rh_store_products', JSON.stringify(this.products));
      localStorage.setItem('rh_store_reviews', JSON.stringify(this.reviews));
    } catch {
      // Ignore storage errors
    }
  }

  getProducts(params?: Record<string, string | number | undefined>): Product[] {
    let list = [...this.products].filter(p => p.status === 'active');
    if (!params) return list;

    if (params.category) list = list.filter(p => p.categoryId === params.category || p.categoryName.toLowerCase() === String(params.category).toLowerCase());
    if (params.brand) list = list.filter(p => p.brandId === params.brand || p.brandName.toLowerCase() === String(params.brand).toLowerCase());
    if (params.verdict) list = list.filter(p => p.recommendationVerdict.toLowerCase() === String(params.verdict).toLowerCase());
    if (params.minRating) list = list.filter(p => p.ratingOverall >= Number(params.minRating));
    if (params.maxPrice) list = list.filter(p => p.currentBestPrice <= Number(params.maxPrice));
    if (params.search) {
      const q = String(params.search).toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (params.sort) {
      switch (params.sort) {
        case 'price_asc': list.sort((a, b) => a.currentBestPrice - b.currentBestPrice); break;
        case 'price_desc': list.sort((a, b) => b.currentBestPrice - a.currentBestPrice); break;
        case 'rating_desc': list.sort((a, b) => b.ratingOverall - a.ratingOverall); break;
        case 'cost_benefit': list.sort((a, b) => b.costBenefitScore - a.costBenefitScore); break;
        case 'views': list.sort((a, b) => b.viewsCount - a.viewsCount); break;
        case 'newest': list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      }
    }
    return list;
  }

  getProduct(slugOrId: string) {
    const product = this.products.find(p => p.id === slugOrId || p.slug === slugOrId);
    if (!product) return null;
    const offers = this.offers.filter(o => o.productId === product.id);
    const reviews = this.reviews.filter(r => r.productId === product.id && r.status === 'published');
    const ratings = this.userRatings.filter(rt => rt.productId === product.id);
    return { product, offers, reviews, ratings };
  }

  createProduct(data: Partial<Product>): Product {
    const newId = `prod_${Date.now()}`;
    const slug = data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : newId);
    const newProd: Product = {
      id: newId,
      name: data.name || 'Produto sem título',
      slug,
      brandId: data.brandId || 'brand_custom',
      brandName: data.brandName || 'Marca',
      categoryId: data.categoryId || 'cat_custom',
      categoryName: data.categoryName || 'Categoria',
      description: data.description || '',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80',
      galleryImages: data.galleryImages || [data.imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80'],
      specs: data.specs || {},
      tags: data.tags || [],
      referencePrice: Number(data.referencePrice) || 0,
      currentBestPrice: Number(data.currentBestPrice) || Number(data.referencePrice) || 0,
      idealPrice: Number(data.idealPrice) || Number(data.currentBestPrice) || 0,
      targetAudience: data.targetAudience || '',
      recommendationVerdict: data.recommendationVerdict || 'RECOMENDADO',
      verdictReason: data.verdictReason || '',
      ratingOverall: Number(data.ratingOverall) || 8.5,
      communityRating: 8.5,
      creatorRating: 8.5,
      performanceScore: Number(data.performanceScore) || 8.5,
      qualityScore: Number(data.qualityScore) || 8.5,
      costBenefitScore: Number(data.costBenefitScore) || 8.5,
      durabilityScore: Number(data.durabilityScore) || 8.5,
      reviewCount: 0,
      ratingCount: 0,
      pros: data.pros || [],
      cons: data.cons || [],
      status: 'active',
      viewsCount: 0,
      isSponsored: Boolean(data.isSponsored),
      sponsoredTag: data.sponsoredTag,
      createdAt: new Date().toISOString()
    };
    this.products.unshift(newProd);
    this.saveToStorage();
    return newProd;
  }

  updateProduct(id: string, data: Partial<Product>): Product {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], ...data };
      this.saveToStorage();
      return this.products[idx];
    }
    throw new Error('Produto não encontrado');
  }

  archiveProduct(id: string) {
    const p = this.products.find(x => x.id === id);
    if (p) {
      p.status = 'archived';
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getCategories = () => this.categories;
  getBrands = () => this.brands;
  getStores = () => this.stores;
  getOffers = (productId?: string, featured?: boolean) => {
    let list = this.offers;
    if (productId) list = list.filter(o => o.productId === productId);
    if (featured) list = list.filter(o => o.isSponsored);
    return list;
  };
  getReviews = (params?: { status?: string; creatorId?: string; productId?: string }) => {
    let list = this.reviews;
    if (params?.status) list = list.filter(r => r.status.toLowerCase() === params.status?.toLowerCase());
    if (params?.creatorId) list = list.filter(r => r.creatorId === params.creatorId);
    if (params?.productId) list = list.filter(r => r.productId === params.productId);
    return list;
  };
  getReviewById = (id: string) => {
    const review = this.reviews.find(r => r.id === id);
    if (!review) return null;
    const comments = this.comments.filter(c => c.reviewId === id);
    const product = this.products.find(p => p.id === review.productId) || this.products[0];
    const offers = this.offers.filter(o => o.productId === review.productId);
    return { review, comments, product, offers };
  };
  createReview = (data: Partial<Review>) => {
    const newRev: Review = {
      id: `rev_${Date.now()}`,
      productId: data.productId || this.products[0].id,
      productName: data.productName || this.products[0].name,
      productSlug: data.productSlug || this.products[0].slug,
      creatorId: data.creatorId || 'creator_joao',
      creatorName: data.creatorName || 'João Tech',
      creatorUsername: data.creatorUsername || 'joaotech',
      creatorAvatar: data.creatorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      creatorLevel: data.creatorLevel || 'Ouro',
      title: data.title || 'Review sem título',
      summary: data.summary || '',
      fullContent: data.fullContent || data.summary || '',
      rating: Number(data.rating) || 8.5,
      recommendation: data.recommendation || 'RECOMENDADO',
      pros: data.pros || [],
      cons: data.cons || [],
      youtubeUrl: data.youtubeUrl,
      youtubeVideoId: data.youtubeVideoId,
      images: data.images || [],
      views: 0,
      likes: 0,
      likedBy: [],
      commentsCount: 0,
      status: data.status || 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.reviews.unshift(newRev);
    this.saveToStorage();
    return newRev;
  };
  getUsers = () => this.users;
  getSettings = () => this.settings;
  updateSettings = (s: Partial<PlatformSettings>) => {
    this.settings = { ...this.settings, ...s };
    return this.settings;
  };
  getAds = () => this.adBanners.filter(a => a.active);
  getFavorites = (userId: string) => this.favorites.filter(f => f.userId === userId);
  toggleFavorite = (userId: string, productId: string, priceAlertThreshold?: number) => {
    const idx = this.favorites.findIndex(f => f.userId === userId && f.productId === productId);
    if (idx !== -1) {
      this.favorites.splice(idx, 1);
      return false;
    } else {
      this.favorites.push({
        id: `fav_${Date.now()}`,
        userId,
        productId,
        priceAlertThreshold,
        addedAt: new Date().toISOString()
      });
      return true;
    }
  };
  getNotifications = (userId: string) => this.notifications.filter(n => n.userId === userId);
  getAdminStats = () => ({
    totalUsers: this.users.length,
    totalCreators: this.users.filter(u => u.role === 'CREATOR').length,
    totalProducts: this.products.filter(p => p.status === 'active').length,
    totalReviews: this.reviews.length,
    pendingReviewsCount: this.reviews.filter(r => r.status === 'pending').length,
    totalAffiliateClicks: this.affiliateClicks.length,
    totalConversions: this.conversions.length,
    totalViews: this.products.reduce((acc, p) => acc + p.viewsCount, 0),
    totalRevenue: this.conversions.reduce((acc, c) => acc + c.saleAmount, 0),
    platformEarnings: this.conversions.reduce((acc, c) => acc + c.platformCommission, 0),
    creatorPayouts: this.conversions.reduce((acc, c) => acc + c.creatorCommission, 0),
    openReports: this.reports.filter(r => r.status === 'pending').length
  });
}

const localStore = new LocalDataStore();

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const activeUserId = getStoredUserId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(activeUserId ? { 'x-user-id': activeUserId } : {}),
    ...(options?.headers as Record<string, string> || {})
  };

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Server returned HTML (e.g. static Vercel SPA routing)
      throw new Error(`API returned non-JSON content-type: ${contentType}`);
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Ocorreu um erro na requisição.' }));
      throw new Error(errorData.error || `Erro HTTP ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    // Graceful fallback interception for static environments
    console.warn(`[API Proxy Notice] Endpoint ${url} using local fallback:`, error?.message);
    throw error;
  }
}

export const apiService = {
  // Diagnostic
  testFirestoreConnection,
  seedFirestoreIfEmpty,
  isFirebaseConfigured,

  // Auth
  getCurrentUser: async () => {
    try {
      return await fetchJson<{ user: User }>('/auth/me');
    } catch {
      const activeId = getStoredUserId();
      const user = localStore.getUsers().find(u => u.id === activeId) || localStore.getUsers()[1];
      return { user };
    }
  },
  login: async (email: string, password?: string) => {
    try {
      return await fetchJson<{ success: boolean; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    } catch {
      const user = localStore.getUsers().find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (user) {
        setStoredUserId(user.id);
        return { success: true, user };
      }
      throw new Error('Email não encontrado. Cadastre-se gratuitamente ou escolha um perfil de teste.');
    }
  },
  switchProfile: async (userId: string) => {
    try {
      return await fetchJson<{ success: boolean; user: User }>('/auth/switch-profile', { method: 'POST', body: JSON.stringify({ userId }) });
    } catch {
      const user = localStore.getUsers().find(u => u.id === userId);
      if (user) {
        setStoredUserId(user.id);
        return { success: true, user };
      }
      throw new Error('Perfil de demonstração não encontrado.');
    }
  },
  register: async (data: Partial<User>) => {
    try {
      return await fetchJson<{ success: boolean; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: data.name || 'Usuário',
        email: data.email || `user${Date.now()}@reviewhub.com`,
        username: data.username || `user_${Date.now().toString().slice(-4)}`,
        role: data.role || 'USER',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.name || Date.now()}`,
        bio: data.bio || 'Entusiasta de tecnologia no ReviewHub.',
        reputationScore: 10,
        badges: ['🌱 Novo Membro'],
        balance: 0,
        pendingBalance: 0,
        totalEarnings: 0,
        createdAt: new Date().toISOString()
      };
      setStoredUserId(newUser.id);
      return { success: true, user: newUser };
    }
  },
  forgotPassword: (email: string) => fetchJson<{ success: boolean; message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }).catch(() => ({
    success: true,
    message: `Se o email ${email} estiver cadastrado, um link de recuperação foi enviado.`
  })),
  logout: () => {
    setStoredUserId(null);
    return fetchJson<{ success: boolean }>('/auth/logout', { method: 'POST' }).catch(() => ({ success: true }));
  },
  getAllUsers: () => fetchJson<User[]>('/users').catch(() => localStore.getUsers()),
  updateProfile: (data: Partial<User>) => fetchJson<{ success: boolean; user: User }>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }).catch(() => ({
    success: true,
    user: { ...localStore.getUsers()[0], ...data }
  })),

  // Products & Categories
  getProducts: async (params?: Record<string, string | number | undefined>): Promise<Product[]> => {
    if (isFirebaseConfigured()) {
      try {
        const firestoreProducts = await getProductsFromFirestore({
          categoryId: params?.category as string,
          brandId: params?.brand as string,
          search: params?.search as string,
          verdict: params?.verdict as string,
          minRating: params?.minRating ? Number(params.minRating) : undefined,
          maxPrice: params?.maxPrice ? Number(params.maxPrice) : undefined,
          sortBy: params?.sort as string
        });
        if (firestoreProducts && firestoreProducts.length > 0) {
          return firestoreProducts;
        }
      } catch (err) {
        console.warn('[Firestore] Error reading products, checking fallback:', err);
      }
    }

    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== '') query.append(key, String(val));
        });
      }
      return await fetchJson<Product[]>(`/products?${query.toString()}`);
    } catch {
      return localStore.getProducts(params);
    }
  },

  getProductBySlugOrId: async (slugOrId: string) => {
    if (isFirebaseConfigured()) {
      try {
        const firestoreProd = await getProductFromFirestore(slugOrId);
        if (firestoreProd) return firestoreProd;
      } catch (err) {
        console.warn('[Firestore] Error reading product detail:', err);
      }
    }

    try {
      return await fetchJson<{
        product: Product;
        offers: Offer[];
        reviews: Review[];
        ratings: UserRating[];
      }>(`/products/${slugOrId}`);
    } catch {
      const found = localStore.getProduct(slugOrId);
      if (found) return found;
      throw new Error('Produto não encontrado');
    }
  },

  searchSuggest: async (query: string) => {
    try {
      return await fetchJson<{
        products: Array<{ id: string; name: string; slug: string; imageUrl: string; price: number; rating: number; verdict: string; categoryName: string }>;
        brands: Array<{ id: string; name: string; slug: string }>;
        categories: Array<{ id: string; name: string; slug: string }>;
      }>(`/products/search/suggest?q=${encodeURIComponent(query)}`);
    } catch {
      const q = query.toLowerCase().trim();
      const prods = localStore.getProducts().filter(p => p.name.toLowerCase().includes(q)).slice(0, 5).map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        imageUrl: p.imageUrl,
        price: p.currentBestPrice,
        rating: p.ratingOverall,
        verdict: p.recommendationVerdict,
        categoryName: p.categoryName
      }));
      const brs = localStore.getBrands().filter(b => b.name.toLowerCase().includes(q)).slice(0, 3).map(b => ({
        id: b.id,
        name: b.name,
        slug: b.slug
      }));
      const cats = localStore.getCategories().filter(c => c.name.toLowerCase().includes(q)).slice(0, 3).map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug
      }));
      return { products: prods, brands: brs, categories: cats };
    }
  },

  compareProducts: async (productIds: string[]) => {
    try {
      return await fetchJson<{
        products: Product[];
        specKeys: string[];
        awards: {
          bestOverallId: string;
          bestValueId: string;
          bestPerformanceId: string;
          cheapestId: string;
        };
      }>('/products/compare', { method: 'POST', body: JSON.stringify({ productIds }) });
    } catch {
      const prods = localStore.getProducts().filter(p => productIds.includes(p.id));
      const allKeys = new Set<string>();
      prods.forEach(p => Object.keys(p.specs || {}).forEach(k => allKeys.add(k)));
      
      const bestOverall = [...prods].sort((a, b) => b.ratingOverall - a.ratingOverall)[0]?.id || '';
      const bestValue = [...prods].sort((a, b) => b.costBenefitScore - a.costBenefitScore)[0]?.id || '';
      const bestPerf = [...prods].sort((a, b) => b.performanceScore - a.performanceScore)[0]?.id || '';
      const cheapest = [...prods].sort((a, b) => a.currentBestPrice - b.currentBestPrice)[0]?.id || '';

      return {
        products: prods,
        specKeys: Array.from(allKeys),
        awards: {
          bestOverallId: bestOverall,
          bestValueId: bestValue,
          bestPerformanceId: bestPerf,
          cheapestId: cheapest
        }
      };
    }
  },

  createProduct: async (data: Partial<Product>) => {
    if (isFirebaseConfigured()) {
      try {
        const product = await createProductInFirestore(data);
        return { success: true, product };
      } catch (err) {
        console.warn('[Firestore] Error creating product:', err);
      }
    }

    try {
      return await fetchJson<{ success: boolean; product: Product }>('/products', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const product = localStore.createProduct(data);
      return { success: true, product };
    }
  },

  updateProduct: async (id: string, data: Partial<Product>) => {
    if (isFirebaseConfigured()) {
      try {
        const product = await updateProductInFirestore(id, data);
        return { success: true, product };
      } catch (err) {
        console.warn('[Firestore] Error updating product:', err);
      }
    }

    try {
      return await fetchJson<{ success: boolean; product: Product }>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch {
      const product = localStore.updateProduct(id, data);
      return { success: true, product };
    }
  },

  archiveProduct: async (id: string) => {
    try {
      return await fetchJson<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' });
    } catch {
      const success = localStore.archiveProduct(id);
      return { success };
    }
  },

  // Categories, Brands, Stores, Offers
  getCategories: async (): Promise<Category[]> => {
    if (isFirebaseConfigured()) {
      try {
        const cats = await getCategoriesFromFirestore();
        if (cats.length > 0) return cats;
      } catch {}
    }
    return fetchJson<Category[]>('/categories').catch(() => localStore.getCategories());
  },

  getBrands: async (): Promise<Brand[]> => {
    if (isFirebaseConfigured()) {
      try {
        const brands = await getBrandsFromFirestore();
        if (brands.length > 0) return brands;
      } catch {}
    }
    return fetchJson<Brand[]>('/brands').catch(() => localStore.getBrands());
  },

  getStores: () => fetchJson<Store[]>('/stores').catch(() => localStore.getStores()),

  getOffers: async (productId?: string, featured?: boolean): Promise<Offer[]> => {
    if (isFirebaseConfigured()) {
      try {
        const offers = await getOffersFromFirestore(productId, featured);
        if (offers.length > 0) return offers;
      } catch {}
    }
    return fetchJson<Offer[]>(`/offers?${productId ? `productId=${productId}&` : ''}${featured ? 'featured=true' : ''}`).catch(() => localStore.getOffers(productId, featured));
  },

  // Reviews
  getReviews: async (params?: { status?: string; creatorId?: string; productId?: string }): Promise<Review[]> => {
    if (isFirebaseConfigured()) {
      try {
        const revs = await getReviewsFromFirestore(params);
        if (revs.length > 0) return revs;
      } catch {}
    }

    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.creatorId) query.append('creatorId', params.creatorId);
    if (params?.productId) query.append('productId', params.productId);
    return fetchJson<Review[]>(`/reviews?${query.toString()}`).catch(() => localStore.getReviews(params));
  },

  getPendingReviews: () => fetchJson<Review[]>('/reviews?status=pending').catch(() => localStore.getReviews({ status: 'pending' })),

  getReviewById: async (id: string) => {
    if (isFirebaseConfigured()) {
      try {
        const rev = await getReviewByIdFromFirestore(id);
        if (rev) return rev;
      } catch {}
    }

    try {
      return await fetchJson<{
        review: Review;
        comments: Comment[];
        product: Product;
        offers: Offer[];
      }>(`/reviews/${id}`);
    } catch {
      const r = localStore.getReviewById(id);
      if (r) return r;
      throw new Error('Review não encontrado');
    }
  },

  createReview: (data: Partial<Review> & { isDraft?: boolean; content?: string }) => {
    const payload = {
      ...data,
      fullContent: data.content || data.fullContent || data.summary
    };
    return fetchJson<{ success: boolean; review: Review }>('/reviews', { method: 'POST', body: JSON.stringify(payload) }).catch(() => {
      const review = localStore.createReview(payload);
      return { success: true, review };
    });
  },

  likeReview: (id: string) => fetchJson<{ success: boolean; likes: number; hasLiked: boolean }>(`/reviews/${id}/like`, { method: 'POST' }).catch(() => ({
    success: true,
    likes: 10,
    hasLiked: true
  })),

  addReviewComment: (reviewId: string, text: string, parentCommentId?: string) => fetchJson<{ success: boolean; comment: Comment }>(`/reviews/${reviewId}/comments`, { method: 'POST', body: JSON.stringify({ text, parentCommentId }) }).catch(() => ({
    success: true,
    comment: {
      id: `com_${Date.now()}`,
      reviewId,
      userId: getStoredUserId() || 'user_gamer',
      userName: 'Usuário Ativo',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      userRole: 'USER',
      text,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString()
    }
  })),

  moderateReview: (id: string, status: string, rejectionReason?: string, moderationNotes?: string) => fetchJson<{ success: boolean; review: Review }>(`/admin/reviews/${id}/moderate`, { method: 'POST', body: JSON.stringify({ status: status.toLowerCase(), rejectionReason, moderationNotes }) }).catch(() => {
    const revs = localStore.getReviews();
    const r = revs.find(x => x.id === id);
    if (r) r.status = status.toLowerCase() as any;
    return { success: true, review: r || ({} as any) };
  }),

  // Ratings
  submitRating: (data: Partial<UserRating>) => fetchJson<{ success: boolean }>('/ratings', { method: 'POST', body: JSON.stringify(data) }).catch(() => ({ success: true })),
  voteRatingHelpful: (id: string) => fetchJson<{ success: boolean; helpfulCount: number }>(`/ratings/${id}/helpful`, { method: 'POST' }).catch(() => ({ success: true, helpfulCount: 15 })),

  // Affiliates & Conversions
  trackAffiliateClick: (offerId: string, creatorId?: string) => fetchJson<{ success: boolean; clickId: string; redirectUrl: string }>('/affiliates/click', { method: 'POST', body: JSON.stringify({ offerId, creatorId }) }).catch(() => ({
    success: true,
    clickId: `click_${Date.now()}`,
    redirectUrl: 'https://kabum.com.br'
  })),

  simulateConversion: (offerId: string, creatorId?: string) => fetchJson<{ success: boolean; conversion: Conversion }>('/affiliates/simulate-conversion', { method: 'POST', body: JSON.stringify({ offerId, creatorId }) }).catch(() => ({
    success: true,
    conversion: {
      id: `conv_${Date.now()}`,
      clickId: `click_${Date.now()}`,
      productId: 'prod_rtx4060',
      productName: 'NVIDIA GeForce RTX 4060 8GB',
      creatorId: creatorId || 'creator_joao',
      creatorName: 'João Tech',
      storeName: 'KaBuM!',
      saleAmount: 1849.00,
      platformCommission: 38.83,
      creatorCommission: 25.88,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    }
  })),

  // Creators
  getCreators: async (): Promise<CreatorProfile[]> => {
    try {
      const list = await fetchJson<any[]>('/creators');
      return list.map(c => ({
        ...c,
        level: c.creatorLevel || 'Bronze',
        isVerified: true,
        totalReviews: c.totalReviews || 12,
        totalViews: c.totalViews || 25000
      }));
    } catch {
      return localStore.getUsers().filter(u => u.role === 'CREATOR').map(c => ({
        ...c,
        level: (c.creatorLevel as any) || 'Ouro',
        isVerified: true,
        totalReviews: 14,
        totalViews: 45000,
        specialties: ['Hardware Gamer', 'Placas de Vídeo', 'Processadores'],
        publishedReviewsCount: 14,
        totalLikes: 3200
      }));
    }
  },

  getCreatorProfile: (usernameOrId: string) => fetchJson<{ creator: User; reviews: Review[]; conversionsCount: number }>(`/creators/${usernameOrId}`).catch(() => {
    const creator = localStore.getUsers().find(u => u.username === usernameOrId || u.id === usernameOrId) || localStore.getUsers()[1];
    const reviews = localStore.getReviews({ creatorId: creator.id });
    return { creator, reviews, conversionsCount: 18 };
  }),

  getCreatorDashboard: async (): Promise<CreatorDashboardData> => {
    try {
      const data = await fetchJson<any>('/creator/dashboard');
      return {
        user: data.user,
        stats: {
          totalReviews: data.metrics.totalReviews,
          publishedReviews: data.metrics.publishedReviews,
          pendingReviews: data.metrics.pendingReviews,
          totalViews: data.metrics.totalViews,
          totalLikes: data.metrics.totalLikes,
          totalClicks: data.metrics.totalClicks,
          totalConversions: data.metrics.totalConversions,
          availableBalance: data.metrics.balance,
          pendingBalance: data.metrics.pendingBalance,
          totalEarnings: data.metrics.totalEarnings
        },
        recentReviews: (data.reviews || []).map((r: any) => ({
          ...r,
          viewsCount: r.views || 0,
          status: r.status === 'published' ? 'PUBLISHED' : r.status === 'pending' ? 'PENDING_MODERATION' : r.status === 'draft' ? 'DRAFT' : 'REJECTED'
        })),
        earningsHistory: (data.recentConversions || []).map((conv: any) => ({
          id: conv.id,
          date: new Date(conv.createdAt).toLocaleDateString('pt-BR'),
          amount: conv.creatorCommission,
          description: `Comissão ${conv.productName} (${conv.storeName})`
        })),
        chartData: data.chartData
      };
    } catch {
      const activeUser = localStore.getUsers()[1];
      const reviews = localStore.getReviews({ creatorId: activeUser.id });
      return {
        user: activeUser,
        stats: {
          totalReviews: reviews.length,
          publishedReviews: reviews.filter(r => r.status === 'published').length,
          pendingReviews: reviews.filter(r => r.status === 'pending').length,
          totalViews: 35500,
          totalLikes: 2420,
          totalClicks: 320,
          totalConversions: 24,
          availableBalance: activeUser.balance,
          pendingBalance: activeUser.pendingBalance,
          totalEarnings: activeUser.totalEarnings
        },
        recentReviews: reviews.map(r => ({
          ...r,
          viewsCount: r.views || 0,
          status: (r.status === 'published' ? 'PUBLISHED' : r.status === 'pending' ? 'PENDING_MODERATION' : 'DRAFT') as any
        })),
        earningsHistory: [
          { id: '1', date: '15/02/2025', amount: 25.88, description: 'Comissão RTX 4060 (KaBuM!)' },
          { id: '2', date: '12/02/2025', amount: 48.00, description: 'Comissão Ryzen 7 5700X (Amazon)' }
        ],
        chartData: [
          { day: '01/02', views: 180, clicks: 12, conversions: 1, earnings: 25.88 },
          { day: '05/02', views: 320, clicks: 24, conversions: 2, earnings: 51.76 },
          { day: '10/02', views: 590, clicks: 45, conversions: 4, earnings: 104.20 },
          { day: '15/02', views: 480, clicks: 38, conversions: 3, earnings: 78.50 }
        ]
      };
    }
  },

  requestWithdrawal: (amount: number, pixKey?: string) => fetchJson<{ success: boolean; remainingBalance: number }>('/creator/withdraw', { method: 'POST', body: JSON.stringify({ amount, pixKey }) }).catch(() => ({ success: true, remainingBalance: 0 })),
  requestPayout: (amount: number, pixKey?: string) => fetchJson<{ success: boolean; remainingBalance: number }>('/creator/withdraw', { method: 'POST', body: JSON.stringify({ amount, pixKey }) }).catch(() => ({ success: true, remainingBalance: 0 })),

  // Wishlist & Notifications
  getFavorites: () => fetchJson<Favorite[]>('/favorites').catch(() => localStore.getFavorites(getStoredUserId() || 'user_gamer')),
  toggleFavorite: (productId: string, priceAlertThreshold?: number) => fetchJson<{ success: boolean; isFavorite: boolean }>('/favorites/toggle', { method: 'POST', body: JSON.stringify({ productId, priceAlertThreshold }) }).catch(() => {
    const isFav = localStore.toggleFavorite(getStoredUserId() || 'user_gamer', productId, priceAlertThreshold);
    return { success: true, isFavorite: isFav };
  }),
  getNotifications: () => fetchJson<Notification[]>('/notifications').catch(() => localStore.getNotifications(getStoredUserId() || 'creator_joao')),
  markNotificationAsRead: (id: string) => fetchJson<{ success: boolean }>(`/notifications/${id}/read`, { method: 'POST' }).catch(() => ({ success: true })),
  markAllNotificationsAsRead: () => fetchJson<{ success: boolean }>('/notifications/read-all', { method: 'POST' }).catch(() => ({ success: true })),

  // Reports
  createReport: (data: { targetType: string; targetId: string; reason: string; details?: string }) => fetchJson<{ success: boolean; message: string }>('/reports', { method: 'POST', body: JSON.stringify(data) }).catch(() => ({ success: true, message: 'Denúncia registrada com sucesso.' })),
  getReports: () => fetchJson<Report[]>('/admin/reports').catch(() => []),
  getAdminReports: () => fetchJson<Report[]>('/admin/reports').catch(() => []),
  resolveReport: (id: string, status: string) => fetchJson<{ success: boolean }>(`/admin/reports/${id}/resolve`, { method: 'POST', body: JSON.stringify({ status: status.toLowerCase() }) }).catch(() => ({ success: true })),

  // Admin Logs & Stats & Settings
  getAdminStats: async () => {
    try {
      const res = await fetchJson<any>('/admin/stats');
      return {
        totalUsers: res.totalUsers ?? 0,
        totalCreators: res.totalCreators ?? 0,
        totalProducts: res.totalProducts ?? 0,
        totalReviews: res.totalReviews ?? 0,
        pendingReviewsCount: res.pendingReviews ?? res.pendingReviewsCount ?? 0,
        totalAffiliateClicks: res.totalClicks ?? res.totalAffiliateClicks ?? 0,
        totalConversions: res.totalConversions ?? 0,
        totalViews: res.totalViews ?? 0,
        totalRevenue: res.totalRevenue ?? 0,
        platformEarnings: res.platformEarnings ?? 0,
        creatorPayouts: res.creatorPayouts ?? 0,
        openReports: res.openReports ?? 0
      };
    } catch {
      return localStore.getAdminStats();
    }
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    try {
      const logs = await fetchJson<any[]>('/admin/logs');
      return logs.map(l => ({
        ...l,
        timestamp: l.createdAt,
        userName: l.adminName,
        target: `${l.targetType} ${l.targetId}`
      }));
    } catch {
      return [
        { id: '1', adminId: 'user_admin', adminName: 'Carlos Admin', action: 'LOGIN', targetType: 'AdminPanel', targetId: 'main', details: 'Acesso ao painel administrativo', createdAt: new Date().toISOString() }
      ];
    }
  },

  getAdminLogs: () => fetchJson<AdminLog[]>('/admin/logs').catch(() => []),
  getPlatformSettings: () => fetchJson<PlatformSettings>('/settings').catch(() => localStore.getSettings()),
  getSettings: () => fetchJson<PlatformSettings>('/settings').catch(() => localStore.getSettings()),
  updatePlatformSettings: (data: Partial<PlatformSettings>) => fetchJson<{ success: boolean; settings: PlatformSettings }>('/settings', { method: 'PUT', body: JSON.stringify(data) }).catch(() => ({ success: true, settings: localStore.updateSettings(data) })),
  updateSettings: (data: Partial<PlatformSettings>) => fetchJson<{ success: boolean; settings: PlatformSettings }>('/settings', { method: 'PUT', body: JSON.stringify(data) }).catch(() => ({ success: true, settings: localStore.updateSettings(data) })),
  getAds: () => fetchJson<AdBanner[]>('/ads').catch(() => localStore.getAds())
};
