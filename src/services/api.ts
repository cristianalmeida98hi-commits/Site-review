import type { 
  User, Product, Category, Brand, Store, Offer, Review, UserRating, 
  Comment, Favorite, Notification, Conversion, Report, AdminLog, AuditLog,
  PlatformSettings, AdBanner, CreatorProfile, CreatorDashboardData 
} from '../types/index.js';

const API_BASE = '/api';

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Ocorreu um erro na requisição.' }));
    throw new Error(errorData.error || `Erro HTTP ${res.status}`);
  }

  return res.json();
}

export const apiService = {
  // Auth
  getCurrentUser: () => fetchJson<{ user: User }>('/auth/me'),
  login: (email: string) => fetchJson<{ success: boolean; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email }) }),
  switchProfile: (userId: string) => fetchJson<{ success: boolean; user: User }>('/auth/switch-profile', { method: 'POST', body: JSON.stringify({ userId }) }),
  register: (data: Partial<User>) => fetchJson<{ success: boolean; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => fetchJson<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  getAllUsers: () => fetchJson<User[]>('/users'),

  // Products & Categories
  getProducts: (params?: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') query.append(key, String(val));
      });
    }
    return fetchJson<Product[]>(`/products?${query.toString()}`);
  },
  getProductBySlugOrId: (slugOrId: string) => fetchJson<{
    product: Product;
    offers: Offer[];
    reviews: Review[];
    ratings: UserRating[];
  }>(`/products/${slugOrId}`),
  searchSuggest: (query: string) => fetchJson<{
    products: Array<{ id: string; name: string; slug: string; imageUrl: string; price: number; rating: number; verdict: string; categoryName: string }>;
    brands: Array<{ id: string; name: string; slug: string }>;
    categories: Array<{ id: string; name: string; slug: string }>;
  }>(`/products/search/suggest?q=${encodeURIComponent(query)}`),
  compareProducts: (productIds: string[]) => fetchJson<{
    products: Product[];
    specKeys: string[];
    awards: {
      bestOverallId: string;
      bestValueId: string;
      bestPerformanceId: string;
      cheapestId: string;
    };
  }>('/products/compare', { method: 'POST', body: JSON.stringify({ productIds }) }),
  createProduct: (data: Partial<Product>) => fetchJson<{ success: boolean; product: Product }>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: Partial<Product>) => fetchJson<{ success: boolean; product: Product }>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  archiveProduct: (id: string) => fetchJson<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),

  // Categories, Brands, Stores
  getCategories: () => fetchJson<Category[]>('/categories'),
  getBrands: () => fetchJson<Brand[]>('/brands'),
  getStores: () => fetchJson<Store[]>('/stores'),
  getOffers: (productId?: string, featured?: boolean) => fetchJson<Offer[]>(`/offers?${productId ? `productId=${productId}&` : ''}${featured ? 'featured=true' : ''}`),

  // Reviews
  getReviews: (params?: { status?: string; creatorId?: string; productId?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.creatorId) query.append('creatorId', params.creatorId);
    if (params?.productId) query.append('productId', params.productId);
    return fetchJson<Review[]>(`/reviews?${query.toString()}`);
  },
  getPendingReviews: () => fetchJson<Review[]>('/reviews?status=pending'),
  getReviewById: (id: string) => fetchJson<{
    review: Review;
    comments: Comment[];
    product: Product;
    offers: Offer[];
  }>(`/reviews/${id}`),
  createReview: (data: Partial<Review> & { isDraft?: boolean; content?: string }) => {
    const payload = {
      ...data,
      fullContent: data.content || data.fullContent || data.summary
    };
    return fetchJson<{ success: boolean; review: Review }>('/reviews', { method: 'POST', body: JSON.stringify(payload) });
  },
  likeReview: (id: string) => fetchJson<{ success: boolean; likes: number; hasLiked: boolean }>(`/reviews/${id}/like`, { method: 'POST' }),
  addReviewComment: (reviewId: string, text: string, parentCommentId?: string) => fetchJson<{ success: boolean; comment: Comment }>(`/reviews/${reviewId}/comments`, { method: 'POST', body: JSON.stringify({ text, parentCommentId }) }),
  moderateReview: (id: string, status: string, rejectionReason?: string, moderationNotes?: string) => fetchJson<{ success: boolean; review: Review }>(`/admin/reviews/${id}/moderate`, { method: 'POST', body: JSON.stringify({ status: status.toLowerCase(), rejectionReason, moderationNotes }) }),

  // Ratings
  submitRating: (data: Partial<UserRating>) => fetchJson<{ success: boolean }>('/ratings', { method: 'POST', body: JSON.stringify(data) }),
  voteRatingHelpful: (id: string) => fetchJson<{ success: boolean; helpfulCount: number }>(`/ratings/${id}/helpful`, { method: 'POST' }),

  // Affiliates & Conversions
  trackAffiliateClick: (offerId: string, creatorId?: string) => fetchJson<{ success: boolean; clickId: string; redirectUrl: string }>('/affiliates/click', { method: 'POST', body: JSON.stringify({ offerId, creatorId }) }),
  simulateConversion: (offerId: string, creatorId?: string) => fetchJson<{ success: boolean; conversion: Conversion }>('/affiliates/simulate-conversion', { method: 'POST', body: JSON.stringify({ offerId, creatorId }) }),

  // Creators
  getCreators: async (): Promise<CreatorProfile[]> => {
    const list = await fetchJson<any[]>('/creators');
    return list.map(c => ({
      ...c,
      level: c.creatorLevel || 'Bronze',
      isVerified: true
    }));
  },
  getCreatorProfile: (usernameOrId: string) => fetchJson<{ creator: User; reviews: Review[]; conversionsCount: number }>(`/creators/${usernameOrId}`),
  getCreatorDashboard: async (): Promise<CreatorDashboardData> => {
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
  },
  requestWithdrawal: (amount: number, pixKey?: string) => fetchJson<{ success: boolean; remainingBalance: number }>('/creator/withdraw', { method: 'POST', body: JSON.stringify({ amount, pixKey }) }),
  requestPayout: (amount: number, pixKey?: string) => fetchJson<{ success: boolean; remainingBalance: number }>('/creator/withdraw', { method: 'POST', body: JSON.stringify({ amount, pixKey }) }),

  // Wishlist & Notifications
  getFavorites: () => fetchJson<Favorite[]>('/favorites'),
  toggleFavorite: (productId: string, priceAlertThreshold?: number) => fetchJson<{ success: boolean; isFavorite: boolean }>('/favorites/toggle', { method: 'POST', body: JSON.stringify({ productId, priceAlertThreshold }) }),
  getNotifications: () => fetchJson<Notification[]>('/notifications'),
  markNotificationAsRead: (id: string) => fetchJson<{ success: boolean }>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsAsRead: () => fetchJson<{ success: boolean }>('/notifications/read-all', { method: 'POST' }),

  // Reports
  createReport: (data: { targetType: string; targetId: string; reason: string; details?: string }) => fetchJson<{ success: boolean; message: string }>('/reports', { method: 'POST', body: JSON.stringify(data) }),
  getReports: () => fetchJson<Report[]>('/admin/reports'),
  getAdminReports: () => fetchJson<Report[]>('/admin/reports'),
  resolveReport: (id: string, status: string) => fetchJson<{ success: boolean }>(`/admin/reports/${id}/resolve`, { method: 'POST', body: JSON.stringify({ status: status.toLowerCase() }) }),

  // Admin Logs & Stats & Settings
  getAdminStats: async () => {
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
  },
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const logs = await fetchJson<any[]>('/admin/logs');
    return logs.map(l => ({
      ...l,
      timestamp: l.createdAt,
      userName: l.adminName,
      target: `${l.targetType} ${l.targetId}`
    }));
  },
  getAdminLogs: () => fetchJson<AdminLog[]>('/admin/logs'),
  getPlatformSettings: () => fetchJson<PlatformSettings>('/settings').catch(() => ({
    platformName: 'ReviewHub',
    platformLogoText: 'ReviewHub',
    creatorCommissionRate: 50,
    platformCommissionRate: 50,
    minWithdrawalAmount: 50,
    minimumWithdrawalAmount: 50,
    autoApproveVerifiedCreators: false
  })),
  getSettings: () => fetchJson<PlatformSettings>('/settings'),
  updatePlatformSettings: (data: Partial<PlatformSettings>) => fetchJson<{ success: boolean; settings: PlatformSettings }>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  updateSettings: (data: Partial<PlatformSettings>) => fetchJson<{ success: boolean; settings: PlatformSettings }>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getAds: () => fetchJson<AdBanner[]>('/ads')
};
