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

export interface PlatformSettings {
  platformName: string;
  platformLogoText: string;
  creatorCommissionRate: number; // e.g. 40 (%)
  platformCommissionRate: number; // e.g. 60 (%)
  minWithdrawalAmount: number; // e.g. 50 (BRL)
  minimumWithdrawalAmount?: number;
  autoApproveVerifiedCreators: boolean;
  featuredNotice?: string;
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
