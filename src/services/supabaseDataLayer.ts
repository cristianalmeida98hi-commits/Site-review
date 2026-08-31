import { getSupabaseClient, getSupabaseAdminClient, getSupabaseConfig } from './supabaseClient.js';
import { supabasePriceDataLayer } from './supabasePriceDataLayer.js';
import type { 
  User, Product, Category, Brand, Store, Review, UserRating, 
  Comment, AffiliateClick, Conversion, AdminLog 
} from '../types/index.js';

export class SupabaseDataLayer {
  private getDb() {
    return getSupabaseAdminClient() || getSupabaseClient();
  }

  // ==========================================
  // USERS
  // ==========================================
  public mapUserFromDb(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      username: row.username,
      role: row.role || 'USER',
      avatarUrl: row.avatar_url || '',
      bio: row.bio || '',
      creatorLevel: row.creator_level || undefined,
      reputationScore: Number(row.reputation_score) || 0,
      badges: Array.isArray(row.badges) ? row.badges : [],
      balance: Number(row.balance) || 0,
      pendingBalance: Number(row.pending_balance) || 0,
      totalEarnings: Number(row.total_earnings) || 0,
      youtubeChannelUrl: row.youtube_channel_url || undefined,
      createdAt: row.created_at || new Date().toISOString()
    };
  }

  public mapUserToDb(u: User) {
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      username: u.username,
      role: u.role,
      avatar_url: u.avatarUrl,
      bio: u.bio || null,
      creator_level: u.creatorLevel || null,
      reputation_score: u.reputationScore || 0,
      badges: u.badges || [],
      balance: u.balance || 0,
      pending_balance: u.pendingBalance || 0,
      total_earnings: u.totalEarnings || 0,
      youtube_channel_url: u.youtubeChannelUrl || null,
      updated_at: new Date().toISOString()
    };
  }

  public async getUsers(): Promise<User[]> {
    const client = this.getDb();
    if (!client) return [];
    try {
      const { data, error } = await client.from('users').select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map(r => this.mapUserFromDb(r));
    } catch {
      return [];
    }
  }

  public async getUserById(id: string): Promise<User | null> {
    const client = this.getDb();
    if (!client) return null;
    try {
      const { data, error } = await client.from('users').select('*').eq('id', id).maybeSingle();
      if (error || !data) return null;
      return this.mapUserFromDb(data);
    } catch {
      return null;
    }
  }

  public async upsertUser(user: User): Promise<User> {
    const client = this.getDb();
    if (!client) return user;
    try {
      const row = this.mapUserToDb(user);
      const { data, error } = await client.from('users').upsert(row, { onConflict: 'id' }).select().single();
      if (error || !data) return user;
      return this.mapUserFromDb(data);
    } catch {
      return user;
    }
  }

  public async seedUsersIfEmpty(initialUsers: User[]): Promise<void> {
    const client = this.getDb();
    if (!client) return;
    try {
      const { count, error } = await client.from('users').select('id', { count: 'exact', head: true });
      if (error || (count !== null && count > 0)) return;
      const rows = initialUsers.map(u => this.mapUserToDb(u));
      await client.from('users').upsert(rows, { onConflict: 'id' });
    } catch (err) {
      console.warn('[SupabaseDataLayer] Seed users warning:', err);
    }
  }

  // ==========================================
  // CATEGORIES
  // ==========================================
  public async getCategories(): Promise<Category[]> {
    const client = this.getDb();
    if (!client) return [];
    try {
      const { data, error } = await client.from('categories').select('*').order('name', { ascending: true });
      if (error || !data) return [];
      return data.map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        iconName: r.icon_name || 'Tag',
        description: r.description || '',
        productCount: 0
      }));
    } catch {
      return [];
    }
  }

  public async seedCategoriesIfEmpty(initialCategories: Category[]): Promise<void> {
    const client = this.getDb();
    if (!client) return;
    try {
      const { count, error } = await client.from('categories').select('id', { count: 'exact', head: true });
      if (error || (count !== null && count > 0)) return;
      const rows = initialCategories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon_name: c.iconName,
        description: c.description
      }));
      await client.from('categories').upsert(rows, { onConflict: 'id' });
    } catch (err) {
      console.warn('[SupabaseDataLayer] Seed categories warning:', err);
    }
  }

  // ==========================================
  // BRANDS
  // ==========================================
  public async getBrands(): Promise<Brand[]> {
    const client = this.getDb();
    if (!client) return [];
    try {
      const { data, error } = await client.from('brands').select('*').eq('status', 'active').order('name', { ascending: true });
      if (error || !data) return [];
      return data.map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        logoUrl: r.logo_url || '',
        description: r.description || '',
        websiteUrl: r.website_url || '',
        status: r.status || 'active'
      }));
    } catch {
      return [];
    }
  }

  public async seedBrandsIfEmpty(initialBrands: Brand[]): Promise<void> {
    const client = this.getDb();
    if (!client) return;
    try {
      const { count, error } = await client.from('brands').select('id', { count: 'exact', head: true });
      if (error || (count !== null && count > 0)) return;
      const rows = initialBrands.map(b => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        logo_url: b.logoUrl,
        description: b.description,
        website_url: b.websiteUrl,
        status: b.status
      }));
      await client.from('brands').upsert(rows, { onConflict: 'id' });
    } catch (err) {
      console.warn('[SupabaseDataLayer] Seed brands warning:', err);
    }
  }

  // ==========================================
  // STORES
  // ==========================================
  public async getStores(): Promise<Store[]> {
    const client = this.getDb();
    if (!client) return [];
    try {
      const { data, error } = await client.from('stores').select('*').eq('status', 'active').order('name', { ascending: true });
      if (error || !data) return [];
      return data.map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        logoUrl: r.logo_url || '',
        websiteUrl: r.website_url || '',
        defaultCommissionPercentage: Number(r.default_commission_percentage) || 3.0,
        status: r.status || 'active'
      }));
    } catch {
      return [];
    }
  }

  public async seedStoresIfEmpty(initialStores: Store[]): Promise<void> {
    const client = this.getDb();
    if (!client) return;
    try {
      const { count, error } = await client.from('stores').select('id', { count: 'exact', head: true });
      if (error || (count !== null && count > 0)) return;
      const rows = initialStores.map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        logo_url: s.logoUrl,
        website_url: s.websiteUrl,
        default_commission_percentage: s.defaultCommissionPercentage,
        status: s.status
      }));
      await client.from('stores').upsert(rows, { onConflict: 'id' });
    } catch (err) {
      console.warn('[SupabaseDataLayer] Seed stores warning:', err);
    }
  }

  // ==========================================
  // REVIEWS
  // ==========================================
  public mapReviewFromDb(row: any): Review {
    return {
      id: row.id,
      productId: row.product_id,
      productName: row.product_name,
      productSlug: row.product_slug,
      creatorId: row.creator_id,
      creatorName: row.creator_name,
      creatorUsername: row.creator_username || '',
      creatorAvatar: row.creator_avatar || '',
      creatorLevel: row.creator_level || 'Novato',
      title: row.title,
      summary: row.summary,
      fullContent: row.full_content || row.summary,
      rating: Number(row.rating) || 8.0,
      recommendation: row.recommendation || 'RECOMENDADO',
      pros: Array.isArray(row.pros) ? row.pros : [],
      cons: Array.isArray(row.cons) ? row.cons : [],
      youtubeUrl: row.youtube_url || undefined,
      youtubeVideoId: row.youtube_video_id || undefined,
      images: Array.isArray(row.images) ? row.images : [],
      views: Number(row.views) || 0,
      likes: Number(row.likes) || 0,
      likedBy: Array.isArray(row.liked_by) ? row.liked_by : [],
      commentsCount: Number(row.comments_count) || 0,
      status: row.status || 'published',
      rejectionReason: row.rejection_reason || undefined,
      moderationNotes: row.moderation_notes || undefined,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString()
    };
  }

  public mapReviewToDb(r: Review) {
    return {
      id: r.id,
      product_id: r.productId,
      product_name: r.productName,
      product_slug: r.productSlug,
      creator_id: r.creatorId,
      creator_name: r.creatorName,
      creator_username: r.creatorUsername,
      creator_avatar: r.creatorAvatar,
      creator_level: r.creatorLevel,
      title: r.title,
      summary: r.summary,
      full_content: r.fullContent,
      rating: r.rating,
      recommendation: r.recommendation,
      pros: r.pros || [],
      cons: r.cons || [],
      youtube_url: r.youtubeUrl || null,
      youtube_video_id: r.youtubeVideoId || null,
      images: r.images || [],
      views: r.views || 0,
      likes: r.likes || 0,
      liked_by: r.likedBy || [],
      comments_count: r.commentsCount || 0,
      status: r.status || 'published',
      rejection_reason: r.rejectionReason || null,
      moderation_notes: r.moderationNotes || null,
      updated_at: new Date().toISOString()
    };
  }

  public async getReviews(filter?: { status?: string; creatorId?: string; productId?: string }): Promise<Review[]> {
    const client = this.getDb();
    if (!client) return [];
    try {
      let query = client.from('reviews').select('*');
      if (filter?.status) query = query.eq('status', filter.status);
      if (filter?.creatorId) query = query.eq('creator_id', filter.creatorId);
      if (filter?.productId) query = query.eq('product_id', filter.productId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map(r => this.mapReviewFromDb(r));
    } catch {
      return [];
    }
  }

  public async getReviewById(id: string): Promise<Review | null> {
    const client = this.getDb();
    if (!client) return null;
    try {
      const { data, error } = await client.from('reviews').select('*').eq('id', id).maybeSingle();
      if (error || !data) return null;
      return this.mapReviewFromDb(data);
    } catch {
      return null;
    }
  }

  public async upsertReview(review: Review): Promise<Review> {
    const client = this.getDb();
    if (!client) return review;
    try {
      const row = this.mapReviewToDb(review);
      const { data, error } = await client.from('reviews').upsert(row, { onConflict: 'id' }).select().single();
      if (error || !data) return review;
      return this.mapReviewFromDb(data);
    } catch {
      return review;
    }
  }

  public async seedReviewsIfEmpty(initialReviews: Review[]): Promise<void> {
    const client = this.getDb();
    if (!client) return;
    try {
      const { count, error } = await client.from('reviews').select('id', { count: 'exact', head: true });
      if (error || (count !== null && count > 0)) return;
      const rows = initialReviews.map(r => this.mapReviewToDb(r));
      await client.from('reviews').upsert(rows, { onConflict: 'id' });
    } catch (err) {
      console.warn('[SupabaseDataLayer] Seed reviews warning:', err);
    }
  }

  // ==========================================
  // USER RATINGS
  // ==========================================
  public mapUserRatingFromDb(row: any): UserRating {
    return {
      id: row.id,
      productId: row.product_id,
      userId: row.user_id,
      userName: row.user_name,
      userAvatar: row.user_avatar || '',
      rating: Number(row.rating) || 8.0,
      title: row.title || '',
      comment: row.comment || '',
      pros: Array.isArray(row.pros) ? row.pros : [],
      cons: Array.isArray(row.cons) ? row.cons : [],
      wouldRecommend: Boolean(row.would_recommend),
      isVerifiedPurchase: Boolean(row.is_verified_purchase),
      helpfulCount: Number(row.helpful_count) || 0,
      helpfulBy: Array.isArray(row.helpful_by) ? row.helpful_by : [],
      reported: Boolean(row.reported),
      createdAt: row.created_at || new Date().toISOString()
    };
  }

  public mapUserRatingToDb(r: UserRating) {
    return {
      id: r.id,
      product_id: r.productId,
      user_id: r.userId,
      user_name: r.userName,
      user_avatar: r.userAvatar || null,
      rating: r.rating,
      title: r.title || null,
      comment: r.comment || null,
      pros: r.pros || [],
      cons: r.cons || [],
      would_recommend: r.wouldRecommend,
      is_verified_purchase: r.isVerifiedPurchase,
      helpful_count: r.helpfulCount || 0,
      helpful_by: r.helpfulBy || [],
      reported: r.reported || false
    };
  }

  public async getUserRatings(productId?: string): Promise<UserRating[]> {
    const client = this.getDb();
    if (!client) return [];
    try {
      let query = client.from('user_ratings').select('*');
      if (productId) query = query.eq('product_id', productId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map(r => this.mapUserRatingFromDb(r));
    } catch {
      return [];
    }
  }

  public async upsertUserRating(rating: UserRating): Promise<UserRating> {
    const client = this.getDb();
    if (!client) return rating;
    try {
      const row = this.mapUserRatingToDb(rating);
      const { data, error } = await client.from('user_ratings').upsert(row, { onConflict: 'id' }).select().single();
      if (error || !data) return rating;
      return this.mapUserRatingFromDb(data);
    } catch {
      return rating;
    }
  }

  public async seedRatingsIfEmpty(initialRatings: UserRating[]): Promise<void> {
    const client = this.getDb();
    if (!client) return;
    try {
      const { count, error } = await client.from('user_ratings').select('id', { count: 'exact', head: true });
      if (error || (count !== null && count > 0)) return;
      const rows = initialRatings.map(r => this.mapUserRatingToDb(r));
      await client.from('user_ratings').upsert(rows, { onConflict: 'id' });
    } catch (err) {
      console.warn('[SupabaseDataLayer] Seed ratings warning:', err);
    }
  }

  // ==========================================
  // COMMENTS
  // ==========================================
  public mapCommentFromDb(row: any): Comment {
    return {
      id: row.id,
      reviewId: row.review_id,
      userId: row.user_id,
      userName: row.user_name,
      userAvatar: row.user_avatar || '',
      userRole: row.user_role || 'USER',
      text: row.text,
      likes: Number(row.likes) || 0,
      likedBy: Array.isArray(row.liked_by) ? row.liked_by : [],
      parentCommentId: row.parent_comment_id || undefined,
      createdAt: row.created_at || new Date().toISOString()
    };
  }

  public mapCommentToDb(c: Comment) {
    return {
      id: c.id,
      review_id: c.reviewId,
      user_id: c.userId,
      user_name: c.userName,
      user_avatar: c.userAvatar || null,
      user_role: c.userRole,
      text: c.text,
      likes: c.likes || 0,
      liked_by: c.likedBy || [],
      parent_comment_id: c.parentCommentId || null
    };
  }

  public async getComments(reviewId?: string): Promise<Comment[]> {
    const client = this.getDb();
    if (!client) return [];
    try {
      let query = client.from('comments').select('*');
      if (reviewId) query = query.eq('review_id', reviewId);
      const { data, error } = await query.order('created_at', { ascending: true });
      if (error || !data) return [];
      return data.map(r => this.mapCommentFromDb(r));
    } catch {
      return [];
    }
  }

  public async insertComment(comment: Comment): Promise<Comment> {
    const client = this.getDb();
    if (!client) return comment;
    try {
      const row = this.mapCommentToDb(comment);
      const { data, error } = await client.from('comments').insert(row).select().single();
      if (error || !data) return comment;
      return this.mapCommentFromDb(data);
    } catch {
      return comment;
    }
  }

  public async seedCommentsIfEmpty(initialComments: Comment[]): Promise<void> {
    const client = this.getDb();
    if (!client) return;
    try {
      const { count, error } = await client.from('comments').select('id', { count: 'exact', head: true });
      if (error || (count !== null && count > 0)) return;
      const rows = initialComments.map(c => this.mapCommentToDb(c));
      await client.from('comments').upsert(rows, { onConflict: 'id' });
    } catch (err) {
      console.warn('[SupabaseDataLayer] Seed comments warning:', err);
    }
  }

  // ==========================================
  // AFFILIATE CLICKS & CONVERSIONS
  // ==========================================
  public async insertAffiliateClick(click: AffiliateClick): Promise<void> {
    const client = this.getDb();
    if (!client) return;
    try {
      await client.from('affiliate_clicks').insert({
        id: click.id,
        product_id: click.productId,
        product_name: click.productName,
        offer_id: click.offerId,
        creator_id: click.creatorId || null,
        creator_name: click.creatorName || null,
        store_name: click.storeName
      });
    } catch (err) {
      console.warn('[SupabaseDataLayer] insertAffiliateClick warning:', err);
    }
  }

  public async getAffiliateClicks(): Promise<AffiliateClick[]> {
    const client = this.getDb();
    if (!client) return [];
    try {
      const { data, error } = await client.from('affiliate_clicks').select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map(r => ({
        id: r.id,
        productId: r.product_id,
        productName: r.product_name,
        offerId: r.offer_id,
        creatorId: r.creator_id,
        creatorName: r.creator_name,
        storeName: r.store_name,
        createdAt: r.created_at
      }));
    } catch {
      return [];
    }
  }

  public async insertConversion(conv: Conversion): Promise<void> {
    const client = this.getDb();
    if (!client) return;
    try {
      await client.from('conversions').insert({
        id: conv.id,
        click_id: conv.clickId,
        product_id: conv.productId,
        product_name: conv.productName,
        creator_id: conv.creatorId,
        creator_name: conv.creatorName,
        store_name: conv.storeName,
        sale_amount: conv.saleAmount,
        platform_commission: conv.platformCommission,
        creator_commission: conv.creatorCommission,
        status: conv.status
      });
    } catch (err) {
      console.warn('[SupabaseDataLayer] insertConversion warning:', err);
    }
  }

  public async getConversions(): Promise<Conversion[]> {
    const client = this.getDb();
    if (!client) return [];
    try {
      const { data, error } = await client.from('conversions').select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map(r => ({
        id: r.id,
        clickId: r.click_id,
        productId: r.product_id,
        productName: r.product_name,
        creatorId: r.creator_id,
        creatorName: r.creator_name,
        storeName: r.store_name,
        saleAmount: Number(r.sale_amount),
        platformCommission: Number(r.platform_commission),
        creatorCommission: Number(r.creator_commission),
        status: r.status,
        createdAt: r.created_at
      }));
    } catch {
      return [];
    }
  }

  // ==========================================
  // ADMIN LOGS
  // ==========================================
  public async insertAdminLog(log: AdminLog): Promise<void> {
    const client = this.getDb();
    if (!client) return;
    try {
      const detailsObj = typeof log.details === 'object' && log.details !== null
        ? log.details
        : { message: log.details || '' };

      const payload = {
        id: log.id,
        admin_id: log.adminId || null,
        admin_name: log.adminName || 'Admin',
        action: log.action || 'ACTION',
        entity_type: log.targetType || 'SYSTEM',
        entity_id: log.targetId || 'GLOBAL',
        details: detailsObj,
        timestamp: log.createdAt || log.timestamp || new Date().toISOString()
      };

      const { error } = await client.from('admin_logs').insert(payload);
      if (error && error.code === '23503') {
        // If foreign key constraint failed on admin_id, retry safely with admin_id: null
        await client.from('admin_logs').insert({ ...payload, admin_id: null });
      } else if (error) {
        console.warn('[SupabaseDataLayer] insertAdminLog warning:', error.message);
      }
    } catch (err) {
      console.warn('[SupabaseDataLayer] insertAdminLog warning:', err);
    }
  }

  public async getAdminLogs(): Promise<AdminLog[]> {
    const client = this.getDb();
    if (!client) return [];
    try {
      const { data, error } = await client.from('admin_logs').select('*').order('timestamp', { ascending: false }).limit(100);
      if (error || !data) return [];
      return data.map(r => ({
        id: r.id,
        adminId: r.admin_id || '',
        adminName: r.admin_name || '',
        action: r.action || '',
        targetType: r.entity_type || '',
        targetId: r.entity_id || '',
        details: typeof r.details === 'object' ? (r.details.message || JSON.stringify(r.details)) : String(r.details || ''),
        createdAt: r.timestamp || new Date().toISOString(),
        timestamp: r.timestamp || new Date().toISOString()
      }));
    } catch {
      return [];
    }
  }

  // ==========================================
  // GLOBAL SEEDER ORCHESTRATION
  // ==========================================
  public async seedAllInitialDataIfEmpty(dataset: {
    users: User[];
    categories: Category[];
    brands: Brand[];
    stores: Store[];
    products: Product[];
    reviews: Review[];
    userRatings: UserRating[];
    comments: Comment[];
  }): Promise<{ success: boolean; message: string }> {
    const config = getSupabaseConfig();
    if (!config.isConfigured) {
      return { success: false, message: 'Supabase não configurado.' };
    }

    try {
      console.log('[SupabaseDataLayer] Verificando e populando banco Supabase PostgreSQL...');
      await this.seedUsersIfEmpty(dataset.users);
      await this.seedCategoriesIfEmpty(dataset.categories);
      await this.seedBrandsIfEmpty(dataset.brands);
      await this.seedStoresIfEmpty(dataset.stores);
      await supabasePriceDataLayer.seedProductsIfEmpty(dataset.products);
      await supabasePriceDataLayer.seedSourcesToSupabase();
      await this.seedReviewsIfEmpty(dataset.reviews);
      await this.seedRatingsIfEmpty(dataset.userRatings);
      await this.seedCommentsIfEmpty(dataset.comments);
      console.log('[SupabaseDataLayer] Sincronização e população de dados iniciais no Supabase concluída!');
      return { success: true, message: 'Dados sincronizados com o Supabase PostgreSQL.' };
    } catch (err: any) {
      console.error('[SupabaseDataLayer] Erro no seed de dados:', err);
      return { success: false, message: err?.message || String(err) };
    }
  }
}

export const supabaseDataLayer = new SupabaseDataLayer();
