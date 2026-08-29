export type UserRole = 'USER' | 'CREATOR' | 'ADMIN';

export type CreatorLevel = 'Novato' | 'Bronze' | 'Prata' | 'Ouro' | 'Especialista';

export type RecommendationVerdict = 'RECOMENDADO' | 'DEPENDE' | 'NAO_RECOMENDADO';

export type ReviewStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'DRAFT' | 'PENDING_MODERATION' | 'PUBLISHED' | 'REJECTED';

export type ConversionStatus = 'pending' | 'confirmed' | 'cancelled' | 'paid';

export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl: string;
  bio?: string;
  creatorLevel?: CreatorLevel;
  reputationScore: number;
  badges: string[];
  balance: number;
  pendingBalance: number;
  totalEarnings: number;
  createdAt: string;
  youtubeChannelUrl?: string;
}

export type CreatorProfile = User & {
  totalReviews: number;
  totalViews: number;
  totalConversions?: number;
  isVerified?: boolean;
  level: CreatorLevel;
};

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  websiteUrl: string;
  status: 'active' | 'inactive';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  imageUrl: string;
  galleryImages: string[];
  specs: Record<string, string>;
  specificationsDetailed?: Record<string, SpecificationItem>;
  tags: string[];
  referencePrice: number;
  currentBestPrice: number;
  idealPrice: number;
  targetAudience: string;
  recommendationVerdict: RecommendationVerdict;
  verdictReason: string;
  ratingOverall: number;
  communityRating: number;
  creatorRating: number;
  performanceScore: number;
  qualityScore: number;
  costBenefitScore: number;
  durabilityScore: number;
  reviewCount: number;
  ratingCount: number;
  pros: string[];
  cons: string[];
  status: 'active' | 'archived';
  viewsCount: number;
  isSponsored?: boolean;
  sponsoredTag?: string;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  websiteUrl: string;
  defaultCommissionPercentage: number;
  status: 'active' | 'inactive';
}

export interface Offer {
  id: string;
  productId: string;
  storeId: string;
  storeName: string;
  storeLogo: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  affiliateUrl: string;
  inStock: boolean;
  lastUpdated: string;
  isSponsored?: boolean;
  couponCode?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  creatorLevel: CreatorLevel;
  title: string;
  summary: string;
  fullContent: string;
  rating: number; // 0 to 10
  recommendation: RecommendationVerdict;
  pros: string[];
  cons: string[];
  youtubeUrl?: string;
  youtubeVideoId?: string;
  images: string[];
  views: number;
  viewsCount?: number;
  likes: number;
  likedBy: string[];
  commentsCount: number;
  status: ReviewStatus;
  rejectionReason?: string;
  moderationNotes?: string;
  moderationFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRating {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 0 to 10
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  helpfulBy: string[];
  reported: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  reviewId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: UserRole;
  text: string;
  likes: number;
  likedBy: string[];
  parentCommentId?: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  priceAlertThreshold?: number;
  addedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  type: 'review_approved' | 'review_rejected' | 'commission' | 'like' | 'system' | 'price_alert';
  createdAt: string;
}

export interface Conversion {
  id: string;
  clickId: string;
  productId: string;
  productName: string;
  creatorId?: string;
  creatorName?: string;
  storeName: string;
  saleAmount: number;
  platformCommission: number;
  creatorCommission: number;
  status: ConversionStatus;
  createdAt: string;
}

export interface AffiliateClick {
  id: string;
  productId: string;
  productName: string;
  offerId: string;
  creatorId?: string;
  creatorName?: string;
  storeName: string;
  ipHash?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  targetType: 'review' | 'comment' | 'rating' | 'user';
  targetId: string;
  targetTitle?: string;
  reason: 'Spam' | 'Fake review' | 'Conteúdo ofensivo' | 'Informação falsa' | 'Publicidade não identificada' | 'Outro' | string;
  details?: string;
  reportedByUserId: string;
  reportedByUserName: string;
  status: ReportStatus;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  badgeLevel: string;
}

export interface SpecificationItem {
  key: string;
  label: string;
  value: string;
  source: string;
  confidence: 'high' | 'medium' | 'low';
  updatedAt: string;
  categoryKey?: string;
}

export interface SpecificationSchemaField {
  key: string;
  label: string;
  unit?: string;
  description?: string;
  importance: 'critical' | 'standard' | 'optional';
  dataType: 'number' | 'string' | 'boolean';
  higherIsBetter?: boolean;
}

export interface CategorySpecificationSchema {
  categoryId: string;
  categoryName: string;
  fields: SpecificationSchemaField[];
}

export interface ProductSpecificationData {
  items: Record<string, SpecificationItem>;
  overallConfidence: number; // 0 to 100
  lastVerifiedAt: string;
  sourceSummary: string[];
}

export interface ComparisonWeights {
  performanceWeight: number; // default 40%
  priceWeight: number;       // default 25%
  efficiencyWeight: number;  // default 15%
  ratingWeight: number;      // default 10%
  featuresWeight: number;    // default 10%
}

export interface ComparisonScoreBreakdown {
  totalScore: number;
  performanceScore: number;
  priceScore: number;
  efficiencyScore: number;
  ratingScore: number;
  featuresScore: number;
}

export interface ComparisonEvaluation {
  winnerId: string | null;
  winnerName: string | null;
  verdictTitle: string;
  explanation: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  confidencePercentage: number;
  dataCompleteness: number; // percentage
  hasSufficientData: boolean;
  scores: Record<string, ComparisonScoreBreakdown>;
  highlights: Record<string, string[]>;
  categorySpecificAdvantages: Record<string, string[]>;
}

export interface PlatformSettings {
  platformName: string;
  platformLogoText: string;
  creatorCommissionRate: number; // e.g. 40 (%)
  platformCommissionRate: number; // e.g. 60 (%)
  minWithdrawalAmount: number; // e.g. 50 (BRL)
  minimumWithdrawalAmount?: number;
  autoApproveVerifiedCreators: boolean;
  featuredNotice?: string;
  comparisonWeights?: ComparisonWeights;
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
  timestamp?: string;
  userName?: string;
  target?: string;
}

export type AuditLog = AdminLog;

export interface CreatorDashboardData {
  user: User;
  stats: {
    totalReviews: number;
    publishedReviews: number;
    pendingReviews: number;
    totalViews: number;
    totalLikes: number;
    totalClicks: number;
    totalConversions: number;
    availableBalance: number;
    pendingBalance: number;
    totalEarnings: number;
  };
  recentReviews: Review[];
  earningsHistory: Array<{ id: string; date: string; amount: number; description: string }>;
  chartData?: Array<{ day: string; views: number; clicks: number; conversions: number; earnings: number }>;
}

export interface AdBanner {
  id: string;
  title: string;
  sponsorName: string;
  imageUrl: string;
  linkUrl: string;
  position: 'home_hero' | 'category_top' | 'sidebar' | 'product_bottom';
  active: boolean;
  clickCount: number;
  impressionCount: number;
}

// ============================================================================
// ETAPA 2 - PRICE ROBOT INTELLIGENT MONITORING & NORMALIZATION MODELS
// ============================================================================

export type PriceSourceStatus = 'active' | 'inactive' | 'rate_limited' | 'error';
export type MatchQuality = 'exact' | 'high' | 'medium' | 'low';
export type PriceTrend = 'falling' | 'stable' | 'rising';

export interface PriceSource {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  baseUrl: string;
  status: PriceSourceStatus;
  reliabilityScore: number; // 0 to 100
  lastSyncAt: string;
  scrapeIntervalMinutes: number;
  errorCount: number;
  successCount: number;
  parserType: 'html_scraper' | 'api_connector' | 'rss_catalog';
}

export interface PriceOffer {
  id: string;
  productId: string;
  productName: string;
  productModel?: string;
  sourceId: string;
  storeName: string;
  storeLogo: string;
  rawTitle: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  currency: 'BRL';
  inStock: boolean;
  affiliateUrl: string;
  couponCode?: string;
  couponDiscountText?: string;
  confidenceScore: number; // 0 to 100
  matchQuality: MatchQuality;
  isOutlier: boolean;
  verifiedByRobot: boolean;
  lastCheckedAt: string;
  cashPrice?: number;
  installmentText?: string;
}

export interface PriceHistoryPoint {
  timestamp: string;
  date: string;
  price: number;
  storeName: string;
  sourceId?: string;
  isLowestEver?: boolean;
}

export interface ProductPriceHistory {
  productId: string;
  productName: string;
  currentLowestPrice: number;
  lowest30Days: number;
  lowest60Days: number;
  lowest90Days: number;
  highest90Days: number;
  average90Days: number;
  priceTrend: PriceTrend;
  lastCheckedAt: string;
  history: PriceHistoryPoint[];
}

export interface PriceSearchQuery {
  id: string;
  query: string;
  category?: string;
  brand?: string;
  resultsCount: number;
  createdAt: string;
  cachedUntil: string;
}

export interface PriceRobotLog {
  id: string;
  executionType: 'scheduled' | 'manual' | 'ondemand';
  sourceName: string;
  productId?: string;
  productName?: string;
  status: 'success' | 'warning' | 'error';
  offersFound: number;
  durationMs: number;
  message: string;
  timestamp: string;
  confidenceAverage: number;
}

export interface PriceRobotStats {
  status: 'active' | 'idle' | 'running';
  lastRunAt: string;
  nextRunAt: string;
  totalMonitoredProducts: number;
  totalOffersTracked: number;
  activeSourcesCount: number;
  averageConfidence: number;
  priceDropsDetectedToday: number;
  scanIntervalHours: number;
}

export interface PriceRobotScanResult {
  success: boolean;
  scannedProductsCount: number;
  totalOffersFound: number;
  priceDropsFound: number;
  durationMs: number;
  logs: PriceRobotLog[];
}
