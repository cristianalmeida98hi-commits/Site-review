import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  type Firestore 
} from 'firebase/firestore';
import type { 
  Product, Review, Category, Brand, Store, Offer, 
  UserRating, Comment, Favorite, PlatformSettings, User 
} from '../types/index.js';
import { 
  initialProducts, initialCategories, initialBrands, 
  initialStores, initialOffers, initialReviews, 
  initialUserRatings, initialComments, initialSettings 
} from '../data/initialData.js';

export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  code?: string;
  operationType: OperationType;
  path: string;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string): FirestoreErrorInfo {
  const err = error as { code?: string; message?: string };
  const errCode = err?.code || 'unknown';
  const errMessage = err?.message || 'Erro desconhecido ao acessar o Firestore';
  
  console.error(`[Firestore Error] Operation: ${operationType}, Path: ${path}, Code: ${errCode}`, error);
  return {
    error: errMessage,
    code: errCode,
    operationType,
    path
  };
}

// Config resolution
const env = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || ''
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey && 
    firebaseConfig.projectId && 
    firebaseConfig.projectId !== 'undefined' &&
    firebaseConfig.apiKey !== 'undefined'
  );
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export const getFirebaseApp = (): FirebaseApp | null => {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
  }
  return app;
};

export const getFirestoreDb = (): Firestore | null => {
  if (!db && isFirebaseConfigured()) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) {
      db = getFirestore(firebaseApp);
    }
  }
  return db;
};

/**
 * Diagnostic test to verify live connection to Firestore
 */
export async function testFirestoreConnection(): Promise<{
  connected: boolean;
  message: string;
  projectId?: string;
  productCount?: number;
}> {
  if (!isFirebaseConfigured()) {
    return {
      connected: false,
      message: 'Firebase não está configurado com variáveis VITE_FIREBASE_* no ambiente.',
      projectId: firebaseConfig.projectId || 'não informado'
    };
  }

  try {
    const firestore = getFirestoreDb();
    if (!firestore) throw new Error('Falha ao inicializar o cliente Firestore.');

    const productsCol = collection(firestore, 'products');
    const snapshot = await getDocs(query(productsCol, limit(5)));

    return {
      connected: true,
      message: `Conectado com sucesso ao Firestore no projeto ${firebaseConfig.projectId}!`,
      projectId: firebaseConfig.projectId,
      productCount: snapshot.size
    };
  } catch (error: any) {
    handleFirestoreError(error, OperationType.LIST, 'products');
    return {
      connected: false,
      message: `Erro ao conectar com o Firestore: ${error?.message || 'Verifique as Security Rules e Credenciais.'}`,
      projectId: firebaseConfig.projectId
    };
  }
}

/**
 * Seeds initial catalog into Firestore if collections are empty
 */
export async function seedFirestoreIfEmpty(): Promise<boolean> {
  const firestore = getFirestoreDb();
  if (!firestore) return false;

  try {
    const productsCol = collection(firestore, 'products');
    const existing = await getDocs(query(productsCol, limit(1)));
    
    if (!existing.empty) {
      console.log('[Firestore Seed] Banco já contém produtos, pulando seed.');
      return true;
    }

    console.log('[Firestore Seed] Banco vazio detectado. Populando produtos e dados iniciais no Firestore...');

    // Seed Products
    for (const prod of initialProducts) {
      await setDoc(doc(firestore, 'products', prod.id), prod);
    }

    // Seed Categories
    for (const cat of initialCategories) {
      await setDoc(doc(firestore, 'categories', cat.id), cat);
    }

    // Seed Brands
    for (const brand of initialBrands) {
      await setDoc(doc(firestore, 'brands', brand.id), brand);
    }

    // Seed Stores
    for (const store of initialStores) {
      await setDoc(doc(firestore, 'stores', store.id), store);
    }

    // Seed Offers
    for (const offer of initialOffers) {
      await setDoc(doc(firestore, 'offers', offer.id), offer);
    }

    // Seed Reviews
    for (const review of initialReviews) {
      await setDoc(doc(firestore, 'reviews', review.id), review);
    }

    // Seed User Ratings
    for (const rate of initialUserRatings) {
      await setDoc(doc(firestore, 'userRatings', rate.id), rate);
    }

    // Seed Settings
    await setDoc(doc(firestore, 'settings', 'global'), initialSettings);

    console.log('[Firestore Seed] Banco Firestore inicializado com sucesso!');
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seed');
    return false;
  }
}

// --- FIRESTORE DATA SERVICES ---

export async function getProductsFromFirestore(params?: {
  categoryId?: string;
  brandId?: string;
  search?: string;
  verdict?: string;
  minRating?: number;
  maxPrice?: number;
  sortBy?: string;
}): Promise<Product[]> {
  const firestore = getFirestoreDb();
  if (!firestore) return [];

  try {
    const col = collection(firestore, 'products');
    const snapshot = await getDocs(col);
    let list: Product[] = [];

    snapshot.forEach(d => {
      list.push(d.data() as Product);
    });

    if (list.length === 0) {
      // Try seed
      await seedFirestoreIfEmpty();
      const freshSnap = await getDocs(col);
      freshSnap.forEach(d => {
        list.push(d.data() as Product);
      });
    }

    // Filter active
    list = list.filter(p => p.status === 'active');

    if (params?.categoryId) {
      list = list.filter(p => p.categoryId === params.categoryId);
    }
    if (params?.brandId) {
      list = list.filter(p => p.brandId === params.brandId);
    }
    if (params?.verdict) {
      list = list.filter(p => p.recommendationVerdict.toLowerCase() === params.verdict?.toLowerCase());
    }
    if (params?.minRating) {
      list = list.filter(p => p.ratingOverall >= Number(params.minRating));
    }
    if (params?.maxPrice) {
      list = list.filter(p => p.currentBestPrice <= Number(params.maxPrice));
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (params?.sortBy) {
      switch (params.sortBy) {
        case 'price_asc':
          list.sort((a, b) => a.currentBestPrice - b.currentBestPrice);
          break;
        case 'price_desc':
          list.sort((a, b) => b.currentBestPrice - a.currentBestPrice);
          break;
        case 'rating_desc':
          list.sort((a, b) => b.ratingOverall - a.ratingOverall);
          break;
        case 'cost_benefit':
          list.sort((a, b) => b.costBenefitScore - a.costBenefitScore);
          break;
        case 'views':
          list.sort((a, b) => b.viewsCount - a.viewsCount);
          break;
        case 'newest':
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    }

    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'products');
    return [];
  }
}

export async function getProductFromFirestore(slugOrId: string): Promise<{
  product: Product;
  offers: Offer[];
  reviews: Review[];
  ratings: UserRating[];
} | null> {
  const firestore = getFirestoreDb();
  if (!firestore) return null;

  try {
    const col = collection(firestore, 'products');
    const snapshot = await getDocs(col);
    let product: Product | null = null;

    snapshot.forEach(d => {
      const p = d.data() as Product;
      if (p.id === slugOrId || p.slug === slugOrId) {
        product = p;
      }
    });

    if (!product) return null;

    const prodId = (product as Product).id;

    // Load related offers, reviews, ratings
    const offersSnap = await getDocs(collection(firestore, 'offers'));
    const offers: Offer[] = [];
    offersSnap.forEach(d => {
      const o = d.data() as Offer;
      if (o.productId === prodId) offers.push(o);
    });

    const reviewsSnap = await getDocs(collection(firestore, 'reviews'));
    const reviews: Review[] = [];
    reviewsSnap.forEach(d => {
      const r = d.data() as Review;
      if (r.productId === prodId && r.status === 'published') reviews.push(r);
    });

    const ratingsSnap = await getDocs(collection(firestore, 'userRatings'));
    const ratings: UserRating[] = [];
    ratingsSnap.forEach(d => {
      const rt = d.data() as UserRating;
      if (rt.productId === prodId) ratings.push(rt);
    });

    return { product, offers, reviews, ratings };
  } catch (error) {
    handleFirestoreError(error, OperationType.READ, `products/${slugOrId}`);
    return null;
  }
}

export async function createProductInFirestore(data: Partial<Product>): Promise<Product> {
  const firestore = getFirestoreDb();
  if (!firestore) throw new Error('Firestore não está disponível');

  const newId = `prod_${Date.now()}`;
  const slug = data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : newId);

  const newProduct: Product = {
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

  try {
    await setDoc(doc(firestore, 'products', newProduct.id), newProduct);
    return newProduct;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `products/${newProduct.id}`);
    throw error;
  }
}

export async function updateProductInFirestore(id: string, data: Partial<Product>): Promise<Product> {
  const firestore = getFirestoreDb();
  if (!firestore) throw new Error('Firestore não está disponível');

  try {
    const docRef = doc(firestore, 'products', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Produto não encontrado no Firestore');

    const updated = { ...snap.data(), ...data } as Product;
    await updateDoc(docRef, data as any);
    return updated;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    throw error;
  }
}

export async function getCategoriesFromFirestore(): Promise<Category[]> {
  const firestore = getFirestoreDb();
  if (!firestore) return [];

  try {
    const snap = await getDocs(collection(firestore, 'categories'));
    const list: Category[] = [];
    snap.forEach(d => list.push(d.data() as Category));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'categories');
    return [];
  }
}

export async function getBrandsFromFirestore(): Promise<Brand[]> {
  const firestore = getFirestoreDb();
  if (!firestore) return [];

  try {
    const snap = await getDocs(collection(firestore, 'brands'));
    const list: Brand[] = [];
    snap.forEach(d => list.push(d.data() as Brand));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'brands');
    return [];
  }
}

export async function getOffersFromFirestore(productId?: string, featured?: boolean): Promise<Offer[]> {
  const firestore = getFirestoreDb();
  if (!firestore) return [];

  try {
    const snap = await getDocs(collection(firestore, 'offers'));
    let list: Offer[] = [];
    snap.forEach(d => list.push(d.data() as Offer));

    if (productId) list = list.filter(o => o.productId === productId);
    if (featured) list = list.filter(o => o.isSponsored);

    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'offers');
    return [];
  }
}

export async function getReviewsFromFirestore(params?: { status?: string; creatorId?: string; productId?: string }): Promise<Review[]> {
  const firestore = getFirestoreDb();
  if (!firestore) return [];

  try {
    const snap = await getDocs(collection(firestore, 'reviews'));
    let list: Review[] = [];
    snap.forEach(d => list.push(d.data() as Review));

    if (params?.status) list = list.filter(r => r.status.toLowerCase() === params.status?.toLowerCase());
    if (params?.creatorId) list = list.filter(r => r.creatorId === params.creatorId);
    if (params?.productId) list = list.filter(r => r.productId === params.productId);

    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'reviews');
    return [];
  }
}

export async function getReviewByIdFromFirestore(id: string): Promise<{
  review: Review;
  comments: Comment[];
  product: Product;
  offers: Offer[];
} | null> {
  const firestore = getFirestoreDb();
  if (!firestore) return null;

  try {
    const docRef = doc(firestore, 'reviews', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const review = snap.data() as Review;

    // Load comments
    const commentsSnap = await getDocs(collection(firestore, 'comments'));
    const comments: Comment[] = [];
    commentsSnap.forEach(d => {
      const c = d.data() as Comment;
      if (c.reviewId === id) comments.push(c);
    });

    // Load product
    const prodSnap = await getDoc(doc(firestore, 'products', review.productId));
    const product = prodSnap.exists() ? (prodSnap.data() as Product) : (initialProducts[0] as Product);

    // Load offers
    const offersSnap = await getDocs(collection(firestore, 'offers'));
    const offers: Offer[] = [];
    offersSnap.forEach(d => {
      const o = d.data() as Offer;
      if (o.productId === review.productId) offers.push(o);
    });

    return { review, comments, product, offers };
  } catch (error) {
    handleFirestoreError(error, OperationType.READ, `reviews/${id}`);
    return null;
  }
}
