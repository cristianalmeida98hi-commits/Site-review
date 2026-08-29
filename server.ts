import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import type { 
  User, Product, Category, Brand, Store, Offer, Review, UserRating, 
  Comment, Favorite, Notification, Conversion, AffiliateClick, Report, 
  AdminLog, AdBanner, PlatformSettings 
} from './src/types/index.js';
import { priceRobotEngine } from './src/services/priceRobotEngine.js';
import { supabasePriceDataLayer } from './src/services/supabasePriceDataLayer.js';
import { checkSupabaseConnection } from './src/services/supabase.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// --- IN-MEMORY DATABASE WITH ROBUST PERSISTENCE ---

let settings: PlatformSettings = {
  platformName: 'C-REVIEW',
  platformLogoText: 'C-REVIEW',
  creatorCommissionRate: 40,
  platformCommissionRate: 60,
  minWithdrawalAmount: 50,
  autoApproveVerifiedCreators: false,
  featuredNotice: 'Explore comparativos técnicos, vereditos de bancada e o robô de monitoramento de preços.'
};

let users: User[] = [
  {
    id: 'user_admin',
    name: 'Carlos Admin',
    email: 'admin@reviewhub.com',
    username: 'carlosadmin',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Administrador e moderador-chefe da plataforma ReviewHub.',
    reputationScore: 100,
    badges: ['👑 Moderador Chefe', '🛡️ Segurança'],
    balance: 0,
    pendingBalance: 0,
    totalEarnings: 0,
    createdAt: '2025-01-10T10:00:00Z'
  },
  {
    id: 'creator_joao',
    name: 'João Tech',
    email: 'joao@techreview.com',
    username: 'joaotech',
    role: 'CREATOR',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Especialista em placas de vídeo, processadores e benchmarks de hardware gamer há 8 anos.',
    creatorLevel: 'Ouro',
    reputationScore: 94,
    badges: ['🏆 Reviewer Ouro', '🎥 100+ Reviews', '⭐ 5 Estrelas', '💰 Top Conversão'],
    balance: 840.50,
    pendingBalance: 215.00,
    totalEarnings: 3420.00,
    youtubeChannelUrl: 'https://youtube.com/@joaotech',
    createdAt: '2025-02-01T12:00:00Z'
  },
  {
    id: 'creator_lucas',
    name: 'Lucas Hardware',
    email: 'lucas@hardwarebrasil.com',
    username: 'lucashardware',
    role: 'CREATOR',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    bio: 'Testes práticos de CPUs, placas-mãe e custo-benefício para orçamentos realistas.',
    creatorLevel: 'Especialista',
    reputationScore: 98,
    badges: ['👑 Reviewer Especialista', '⚡ Benchmark Pro', '🏆 Top Criador'],
    balance: 1450.00,
    pendingBalance: 320.00,
    totalEarnings: 6890.00,
    youtubeChannelUrl: 'https://youtube.com/@lucashardware',
    createdAt: '2025-01-15T15:00:00Z'
  },
  {
    id: 'creator_camila',
    name: 'Camila Tech Review',
    email: 'camila@camilareviews.com',
    username: 'camilatech',
    role: 'CREATOR',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Reviews de smartphones, periféricos ergonômicos e monitores para produtividade e jogos.',
    creatorLevel: 'Prata',
    reputationScore: 88,
    badges: ['🥈 Reviewer Prata', '📱 Mobile Guru'],
    balance: 390.00,
    pendingBalance: 110.00,
    totalEarnings: 1250.00,
    youtubeChannelUrl: 'https://youtube.com/@camilatech',
    createdAt: '2025-03-01T09:00:00Z'
  },
  {
    id: 'user_gamer',
    name: 'Rodrigo Gamer',
    email: 'rodrigo@gmail.com',
    username: 'rodrigogamer',
    role: 'USER',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Entusiasta de PC Gaming e upgrades inteligentes.',
    reputationScore: 45,
    badges: ['🌱 Primeiro Review'],
    balance: 0,
    pendingBalance: 0,
    totalEarnings: 0,
    createdAt: '2025-04-10T18:00:00Z'
  }
];

let categories: Category[] = [
  { id: 'cat_gpu', name: 'Placas de Vídeo', slug: 'placas-de-video', iconName: 'Cpu', description: 'GPUs para jogos, renderização e inteligência artificial', productCount: 2 },
  { id: 'cat_cpu', name: 'Processadores', slug: 'processadores', iconName: 'Zap', description: 'CPUs AMD e Intel para alto desempenho em jogos e produtividade', productCount: 2 },
  { id: 'cat_storage', name: 'Armazenamento & SSD', slug: 'armazenamento-ssd', iconName: 'HardDrive', description: 'SSDs NVMe, SATA e unidades de alta velocidade', productCount: 1 },
  { id: 'cat_monitors', name: 'Monitores', slug: 'monitores', iconName: 'Monitor', description: 'Monitores gamer, alta taxa de atualização e painéis IPS/OLED', productCount: 1 },
  { id: 'cat_peripherals', name: 'Periféricos', slug: 'perifericos', iconName: 'Keyboard', description: 'Teclados mecânicos, mouses precisos e headsets', productCount: 2 },
  { id: 'cat_smartphones', name: 'Smartphones', slug: 'smartphones', iconName: 'Smartphone', description: 'Celulares topo de linha e intermediários premium', productCount: 2 }
];

let brands: Brand[] = [
  { id: 'brand_nvidia', name: 'NVIDIA', slug: 'nvidia', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg', description: 'Líder global em processamento gráfico e inteligência artificial', websiteUrl: 'https://nvidia.com', status: 'active' },
  { id: 'brand_amd', name: 'AMD', slug: 'amd', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/AMD_Logo.svg', description: 'Pioneira em CPUs Ryzen e GPUs Radeon de alto custo-benefício', websiteUrl: 'https://amd.com', status: 'active' },
  { id: 'brand_kingston', name: 'Kingston', slug: 'kingston', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Kingston_Technology_logo.svg', description: 'Líder mundial em memórias RAM e SSDs de alto rendimento', websiteUrl: 'https://kingston.com', status: 'active' },
  { id: 'brand_lg', name: 'LG Electronics', slug: 'lg', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_logo_%282015%29.svg', description: 'Referência em painéis de display, TVs e monitores gamer UltraGear', websiteUrl: 'https://lg.com', status: 'active' },
  { id: 'brand_akko', name: 'Akko', slug: 'akko', logoUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&auto=format&fit=crop&q=80', description: 'Especialista em teclados mecânicos custom e switches de precisão', websiteUrl: 'https://akkogear.com', status: 'active' },
  { id: 'brand_samsung', name: 'Samsung', slug: 'samsung', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', description: 'Inovação em tecnologia móvel, chips e telas AMOLED', websiteUrl: 'https://samsung.com', status: 'active' },
  { id: 'brand_apple', name: 'Apple', slug: 'apple', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', description: 'Ecossistema premium com processadores Bionic e design refinado', websiteUrl: 'https://apple.com', status: 'active' },
  { id: 'brand_hyperx', name: 'HyperX', slug: 'hyperx', logoUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100&auto=format&fit=crop&q=80', description: 'Áudio espacial e equipamentos gamer profissionais', websiteUrl: 'https://hyperx.com', status: 'active' }
];

let stores: Store[] = [
  { id: 'store_kabum', name: 'KaBuM!', slug: 'kabum', logoUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80', websiteUrl: 'https://kabum.com.br', defaultCommissionPercentage: 3.5, status: 'active' },
  { id: 'store_amazon', name: 'Amazon Brasil', slug: 'amazon', logoUrl: 'https://images.unsplash.com/photo-1523474253246-72fb9c27030d?w=100&auto=format&fit=crop&q=80', websiteUrl: 'https://amazon.com.br', defaultCommissionPercentage: 4.0, status: 'active' },
  { id: 'store_pichau', name: 'Pichau Informática', slug: 'pichau', logoUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80', websiteUrl: 'https://pichau.com.br', defaultCommissionPercentage: 3.0, status: 'active' },
  { id: 'store_terabyte', name: 'TerabyteShop', slug: 'terabyte', logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&auto=format&fit=crop&q=80', websiteUrl: 'https://terabyteshop.com.br', defaultCommissionPercentage: 3.2, status: 'active' },
  { id: 'store_ml', name: 'Mercado Livre', slug: 'mercado-livre', logoUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&auto=format&fit=crop&q=80', websiteUrl: 'https://mercadolivre.com.br', defaultCommissionPercentage: 4.5, status: 'active' }
];

let products: Product[] = [
  {
    id: 'prod_rtx4060',
    name: 'NVIDIA GeForce RTX 4060 8GB',
    slug: 'rtx-4060',
    brandId: 'brand_nvidia',
    brandName: 'NVIDIA',
    categoryId: 'cat_gpu',
    categoryName: 'Placas de Vídeo',
    description: 'A GeForce RTX 4060 oferece excelente eficiência energética com arquitetura Ada Lovelace, suporte total a DLSS 3 com Frame Generation e desempenho sólido em 1080p Ultra com Ray Tracing leve a moderado.',
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Memória VRAM': '8 GB GDDR6 (128-bit)',
      'TDP / Consumo': '115 Watts',
      'Tecnologias': 'DLSS 3, Reflex, Ray Tracing 3ª Geração, AV1 Encoder',
      'Interface': 'PCIe 4.0 x8',
      'Resolução Ideal': '1080p Ultra / 1440p com DLSS Balanceado',
      'Fonte Recomendada': '450W a 500W 80 Plus'
    },
    tags: ['GPU', 'RTX', 'DLSS 3', 'NVIDIA', '1080p', 'Eficiência'],
    referencePrice: 2199.00,
    currentBestPrice: 1849.00,
    idealPrice: 1799.00,
    targetAudience: 'Jogadores focados em 1080p com máxima taxa de quadros e criadores de conteúdo que usam NVENC e IA.',
    recommendationVerdict: 'RECOMENDADO',
    verdictReason: 'Excelente opção para quem busca baixo consumo (115W) e tecnologia DLSS 3, desde que encontrada abaixo de R$ 1.950.',
    ratingOverall: 8.7,
    communityRating: 8.6,
    creatorRating: 8.8,
    performanceScore: 8.5,
    qualityScore: 9.0,
    costBenefitScore: 8.6,
    durabilityScore: 8.8,
    reviewCount: 14,
    ratingCount: 86,
    pros: [
      'Altíssima eficiência energética com consumo médio de apenas 115W',
      'Suporte a DLSS 3 com Frame Generation que dobra o FPS em títulos pesados',
      'Encoder NVENC de 8ª geração com suporte nativo a AV1 para streaming',
      'Temperaturas muito baixas e operação silenciosa'
    ],
    cons: [
      '8 GB de VRAM com barramento de 128-bit pode limitar resoluções acima de 1080p',
      'Interface PCIe 4.0 x8 perde cerca de 3% a 5% de desempenho em placas-mãe PCIe 3.0 antigas',
      'Ganho de força bruta pequeno em relação à RTX 3060 12GB sem DLSS ativado'
    ],
    status: 'active',
    viewsCount: 14820,
    isSponsored: true,
    sponsoredTag: 'Destaque Custo-Benefício 1080p',
    createdAt: '2025-01-20T10:00:00Z'
  },
  {
    id: 'prod_rx7600',
    name: 'AMD Radeon RX 7600 8GB',
    slug: 'rx-7600',
    brandId: 'brand_amd',
    brandName: 'AMD',
    categoryId: 'cat_gpu',
    categoryName: 'Placas de Vídeo',
    description: 'Placa gráfica RDNA 3 focada no segmento de entrada/intermediário competitivo, entregando alta taxa de quadros em rasterização pura em Full HD com drivers Adrenalin completos e suporte a FSR 3.',
    imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Memória VRAM': '8 GB GDDR6 (128-bit)',
      'TDP / Consumo': '165 Watts',
      'Tecnologias': 'FSR 3, AFMF (AMD Fluid Motion Frames), AV1 Encoder',
      'Interface': 'PCIe 4.0 x8',
      'Resolução Ideal': '1080p Máxima Qualidade',
      'Fonte Recomendada': '550W 80 Plus'
    },
    tags: ['GPU', 'Radeon', 'AMD', 'FSR 3', 'Rasterização', '1080p'],
    referencePrice: 1999.00,
    currentBestPrice: 1599.00,
    idealPrice: 1550.00,
    targetAudience: 'Jogadores competitivos que priorizam menor custo por frame em jogos competitivos e casuais em 1080p.',
    recommendationVerdict: 'RECOMENDADO',
    verdictReason: 'Melhor custo por frame bruto em rasterização quando o preço estiver R$ 250 a R$ 300 abaixo da RTX 4060.',
    ratingOverall: 8.4,
    communityRating: 8.3,
    creatorRating: 8.5,
    performanceScore: 8.3,
    qualityScore: 8.5,
    costBenefitScore: 9.1,
    durabilityScore: 8.6,
    reviewCount: 9,
    ratingCount: 54,
    pros: [
      'Excelente custo por FPS em rasterização pura',
      'Software AMD Adrenalin muito completo e com overclock simplificado',
      'Suporte a DisplayPort 2.1 em modelos específicos',
      'Preço de entrada mais acessível que a concorrência direta'
    ],
    cons: [
      'Desempenho em Ray Tracing significativamente inferior ao da NVIDIA',
      'Consumo elétrico de 165W (maior que os 115W da RTX 4060)',
      'FSR 3 ainda apresenta qualidade de imagem levemente inferior ao DLSS 3.7'
    ],
    status: 'active',
    viewsCount: 11250,
    createdAt: '2025-01-22T14:30:00Z'
  },
  {
    id: 'prod_ryzen5700x',
    name: 'AMD Ryzen 7 5700X (8 Núcleos / 16 Threads)',
    slug: 'ryzen-7-5700x',
    brandId: 'brand_amd',
    brandName: 'AMD',
    categoryId: 'cat_cpu',
    categoryName: 'Processadores',
    description: 'Processador de 8 núcleos Zen 3 com excelente eficiência térmica (TDP 65W), perfeito para upgrades na plataforma AM4 sem necessidade de trocar placa-mãe ou memórias DDR4.',
    imageUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Núcleos / Threads': '8 Núcleos / 16 Threads',
      'Clock Base / Boost': '3.4 GHz / 4.6 GHz',
      'Cache L3': '32 MB',
      'TDP': '65 Watts',
      'Soquete': 'AM4 (Suporta B450, B550, X570)',
      'Memória Suportada': 'DDR4 até 3200MHz nativo'
    },
    tags: ['CPU', 'Ryzen 7', 'Zen 3', 'AM4', '8 Cores', 'Multitarefa'],
    referencePrice: 1399.00,
    currentBestPrice: 1149.00,
    idealPrice: 1099.00,
    targetAudience: 'Quem já possui plataforma AM4 e quer fazer upgrade definitivo para jogos e criação de conteúdo.',
    recommendationVerdict: 'RECOMENDADO',
    verdictReason: 'O upgrade mais equilibrado da plataforma AM4. Entrega 8 núcleos frios e ótimo desempenho por menos de R$ 1.200.',
    ratingOverall: 9.2,
    communityRating: 9.3,
    creatorRating: 9.1,
    performanceScore: 9.0,
    qualityScore: 9.4,
    costBenefitScore: 9.5,
    durabilityScore: 9.6,
    reviewCount: 18,
    ratingCount: 132,
    pros: [
      '8 núcleos e 16 threads com TDP de apenas 65W (muito fácil de resfriar)',
      'Compatibilidade universal com soquetes AM4 mediante atualização de BIOS',
      'Excelente desempenho para streaming, edição de vídeo e multitarefas',
      'Relação custo por núcleo imbatível no mercado atual'
    ],
    cons: [
      'Não acompanha cooler box na embalagem',
      'Plataforma AM4 não possui novos lançamentos de gerações futuras',
      'Não possui vídeo integrado (requer placa de vídeo dedicada)'
    ],
    status: 'active',
    viewsCount: 19400,
    createdAt: '2025-01-15T09:00:00Z'
  },
  {
    id: 'prod_ryzen5600',
    name: 'AMD Ryzen 5 5600 (6 Núcleos / 12 Threads)',
    slug: 'ryzen-5-5600',
    brandId: 'brand_amd',
    brandName: 'AMD',
    categoryId: 'cat_cpu',
    categoryName: 'Processadores',
    description: 'O rei do custo-benefício gamer da plataforma AM4. Equipado com 6 núcleos e 32MB de cache L3, empurra praticamente qualquer placa de vídeo intermediária com facilidade.',
    imageUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Núcleos / Threads': '6 Núcleos / 12 Threads',
      'Clock Base / Boost': '3.5 GHz / 4.4 GHz',
      'Cache L3': '32 MB',
      'TDP': '65 Watts',
      'Soquete': 'AM4',
      'Cooler Incluso': 'Sim (AMD Wraith Stealth)'
    },
    tags: ['CPU', 'Ryzen 5', 'Custo-Benefício', 'AM4', 'Gamer'],
    referencePrice: 949.00,
    currentBestPrice: 779.00,
    idealPrice: 750.00,
    targetAudience: 'Gamers montando PC do zero ou fazendo upgrade econômico com foco exclusivo em jogos.',
    recommendationVerdict: 'RECOMENDADO',
    verdictReason: 'Insuperável na faixa de R$ 750 a R$ 800. Vem com cooler box e entrega quase a mesma performance em jogos que modelos bem mais caros.',
    ratingOverall: 9.4,
    communityRating: 9.5,
    creatorRating: 9.3,
    performanceScore: 8.8,
    qualityScore: 9.3,
    costBenefitScore: 9.8,
    durabilityScore: 9.5,
    reviewCount: 22,
    ratingCount: 198,
    pros: [
      'Melhor relação preço x FPS do mercado de entrada/médio',
      'Inclui cooler box funcional de fábrica',
      '32MB de Cache L3 garantem 1% low frames estáveis em jogos',
      'Consumo térmico baixo e fácil overclock com PBO'
    ],
    cons: [
      'Plataforma AM4 em fim de ciclo de novas gerações',
      'Sem gráficos integrados (requer GPU dedicada)',
      'Cooler box pode ficar ruidoso em gabinetes com fluxo de ar restrito'
    ],
    status: 'active',
    viewsCount: 22100,
    createdAt: '2025-01-10T11:00:00Z'
  },
  {
    id: 'prod_kc3000',
    name: 'SSD Kingston KC3000 1TB M.2 NVMe PCIe 4.0',
    slug: 'ssd-kingston-kc3000-1tb',
    brandId: 'brand_kingston',
    brandName: 'Kingston',
    categoryId: 'cat_storage',
    categoryName: 'Armazenamento & SSD',
    description: 'SSD topo de linha com velocidades reais de leitura de até 7.000 MB/s e gravação de 6.000 MB/s, controlador Phison E18 e dissipador de calor de alumínio com grafeno.',
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Capacidade': '1.024 GB (1 TB)',
      'Leitura Sequencial': 'Até 7.000 MB/s',
      'Gravação Sequencial': 'Até 6.000 MB/s',
      'Interface': 'PCIe 4.0 x4 NVMe 1.4',
      'Controlador': 'Phison PS5018-E18 com DRAM Cache',
      'Durabilidade (TBW)': '800 TBW / 5 Anos de Garantia'
    },
    tags: ['SSD', 'NVMe', 'PCIe 4.0', '7000MBs', 'Kingston', 'PS5 Compatible'],
    referencePrice: 749.00,
    currentBestPrice: 589.00,
    idealPrice: 560.00,
    targetAudience: 'Profissionais de vídeo 4K/8K, gamers exigentes e proprietários de PlayStation 5.',
    recommendationVerdict: 'RECOMENDADO',
    verdictReason: 'Um dos SSDs Gen4 mais rápidos e duráveis (800 TBW) com DRAM Cache dedicada e garantia de 5 anos.',
    ratingOverall: 9.3,
    communityRating: 9.4,
    creatorRating: 9.2,
    performanceScore: 9.8,
    qualityScore: 9.5,
    costBenefitScore: 8.9,
    durabilityScore: 9.7,
    reviewCount: 11,
    ratingCount: 73,
    pros: [
      'Velocidades consistentes de até 7.000 MB/s com DRAM Cache',
      'Alta resistência de escrita com 800 TBW no modelo de 1TB',
      'Dissipador térmico discreto compatível com PlayStation 5',
      '5 anos de garantia nacional com suporte Kingston'
    ],
    cons: [
      'Aquece bastante sob cargas intensas prolongadas sem fluxo de ar no gabinete',
      'Preço superior a SSDs Gen4 de entrada sem DRAM Cache'
    ],
    status: 'active',
    viewsCount: 8900,
    createdAt: '2025-02-05T16:00:00Z'
  },
  {
    id: 'prod_ultragear24',
    name: 'Monitor Gamer LG UltraGear 24" IPS 144Hz 1ms',
    slug: 'monitor-lg-ultragear-24-144hz',
    brandId: 'brand_lg',
    brandName: 'LG Electronics',
    categoryId: 'cat_monitors',
    categoryName: 'Monitores',
    description: 'Monitor gamer referência com painel IPS de cores fiéis, taxa de 144Hz, tempo de resposta real de 1ms MBR, suporte a AMD FreeSync Premium e base com ajuste ergonômico completo.',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Tamanho da Tela': '24 Polegadas (23.8")',
      'Tipo de Painel': 'IPS com 99% sRGB',
      'Resolução': 'Full HD (1920 x 1080)',
      'Taxa de Atualização': '144 Hz',
      'Tempo de Resposta': '1ms MBR',
      'Ergonomia': 'Ajuste de Altura, Inclinação e Pivot 90º'
    },
    tags: ['Monitor', 'IPS', '144Hz', 'LG', 'UltraGear', 'FreeSync'],
    referencePrice: 1099.00,
    currentBestPrice: 879.00,
    idealPrice: 850.00,
    targetAudience: 'Jogadores de FPS competitivo (Valorant, CS2) e profissionais que necessitam de fidelidade de cores e ergonomia.',
    recommendationVerdict: 'RECOMENDADO',
    verdictReason: 'Melhor monitor de entrada/médio com painel IPS e base com regulagem de altura completa por menos de R$ 900.',
    ratingOverall: 9.1,
    communityRating: 9.2,
    creatorRating: 9.0,
    performanceScore: 9.0,
    qualityScore: 9.2,
    costBenefitScore: 9.3,
    durabilityScore: 9.0,
    reviewCount: 15,
    ratingCount: 110,
    pros: [
      'Painel IPS com excelentes ângulos de visão e 99% de cobertura sRGB',
      'Base ergonômica com regulagem de altura, inclinação e rotação vertical',
      'Compatibilidade total com FreeSync Premium e G-Sync Compatible',
      'Menu OSD completo com crosshair embutido e estabilizador de pretos'
    ],
    cons: [
      'Contraste típico de painéis IPS (pretos menos profundos no escuro total)',
      'Brilho máximo de 300 nits pode ser baixo para salas muito ensolaradas'
    ],
    status: 'active',
    viewsCount: 16300,
    createdAt: '2025-02-12T13:00:00Z'
  },
  {
    id: 'prod_galaxys25',
    name: 'Samsung Galaxy S25 5G 256GB',
    slug: 'samsung-galaxy-s25',
    brandId: 'brand_samsung',
    brandName: 'Samsung',
    categoryId: 'cat_smartphones',
    categoryName: 'Smartphones',
    description: 'Flagship compacto com processador Snapdragon 8 Elite, tela Dynamic AMOLED 2X de 120Hz com brilho de 2.600 nits, Galaxy AI completo e 7 anos de atualizações garantidas de sistema.',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Processador': 'Qualcomm Snapdragon 8 Elite (3nm)',
      'Memória & Armazenamento': '12 GB RAM / 256 GB UFS 4.0',
      'Tela': '6.2" Dynamic AMOLED 2X 1-120Hz (2600 nits)',
      'Câmeras Traseiras': '50 MP (Principal) + 12 MP (Ultra Wide) + 10 MP (Telefoto 3x)',
      'Bateria': '4.000 mAh com recarga rápida 25W',
      'Suporte de Software': '7 Anos de Atualizações Android e Segurança'
    },
    tags: ['Smartphone', 'Galaxy', 'Snapdragon 8 Elite', 'Samsung', 'Galaxy AI', 'Compacto'],
    referencePrice: 5999.00,
    currentBestPrice: 4699.00,
    idealPrice: 4399.00,
    targetAudience: 'Usuários que buscam um smartphone topo de linha com tamanho compacto, câmeras de alta precisão e longo suporte.',
    recommendationVerdict: 'DEPENDE',
    verdictReason: 'Aparelho fantástico, mas vale a pena aguardar promoções na faixa de R$ 4.200 ou considerar o Galaxy S24 se a diferença de preço for superior a R$ 1.000.',
    ratingOverall: 8.9,
    communityRating: 8.8,
    creatorRating: 9.0,
    performanceScore: 9.8,
    qualityScore: 9.5,
    costBenefitScore: 7.9,
    durabilityScore: 9.2,
    reviewCount: 8,
    ratingCount: 42,
    pros: [
      'Desempenho colossal com o Snapdragon 8 Elite e 12GB de RAM',
      'Formato compacto premium muito confortável na mão',
      'Promessa de 7 anos de atualizações de software e segurança',
      'Recursos Galaxy AI funcionais e bem integrados'
    ],
    cons: [
      'Bateria de 4.000 mAh requer recarga no final do dia sob uso intenso',
      'Velocidade de carregamento ainda travada em 25W',
      'Preço de lançamento elevado no mercado brasileiro'
    ],
    status: 'active',
    viewsCount: 13400,
    createdAt: '2025-02-18T10:00:00Z'
  },
  {
    id: 'prod_iphone15',
    name: 'Apple iPhone 15 128GB',
    slug: 'apple-iphone-15',
    brandId: 'brand_apple',
    brandName: 'Apple',
    categoryId: 'cat_smartphones',
    categoryName: 'Smartphones',
    description: 'Equipado com o chip A16 Bionic, câmera principal de 48 MP com modo Retrato automático, Dynamic Island e conector USB-C com construção em vidro colorido infusionado.',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Processador': 'Apple A16 Bionic (4nm)',
      'Memória & Armazenamento': '6 GB RAM / 128 GB NVMe',
      'Tela': '6.1" Super Retina XDR OLED (2000 nits)',
      'Câmeras': '48 MP (Principal) + 12 MP (Ultra Wide) com zoom 2x óptico digital',
      'Conector': 'USB-C (USB 2.0)',
      'Recurso Chave': 'Dynamic Island e modo Ação de vídeo'
    },
    tags: ['iPhone', 'Apple', 'A16 Bionic', 'USB-C', 'Dynamic Island', '48MP'],
    referencePrice: 5299.00,
    currentBestPrice: 4299.00,
    idealPrice: 3999.00,
    targetAudience: 'Fãs do ecossistema iOS que desejam câmeras modernas de 48MP e porta USB-C sem pagar o valor da linha Pro.',
    recommendationVerdict: 'RECOMENDADO',
    verdictReason: 'Excelente salto em relação ao iPhone 14 devido à câmera de 48MP, Dynamic Island e USB-C.',
    ratingOverall: 8.8,
    communityRating: 8.9,
    creatorRating: 8.7,
    performanceScore: 9.3,
    qualityScore: 9.6,
    costBenefitScore: 8.0,
    durabilityScore: 9.4,
    reviewCount: 16,
    ratingCount: 89,
    pros: [
      'Sensor principal de 48 MP com excelente pós-processamento e recorte 2x sem perda',
      'Dynamic Island agora presente no modelo base',
      'Troca definitiva para a porta USB-C',
      'Valor de revenda muito estável no mercado nacional'
    ],
    cons: [
      'Tela ainda limitada a taxa de atualização de 60 Hz em pleno 2025/2026',
      'Sem lente telefoto dedicada 3x ou 5x',
      'Velocidade da porta USB-C limitada a taxas de USB 2.0 (480 Mbps)'
    ],
    status: 'active',
    viewsCount: 17800,
    createdAt: '2025-01-28T14:00:00Z'
  },
  {
    id: 'prod_akko3084',
    name: 'Teclado Mecânico Akko 3084B Plus Switch Yellow',
    slug: 'teclado-akko-3084b-plus',
    brandId: 'brand_akko',
    brandName: 'Akko',
    categoryId: 'cat_peripherals',
    categoryName: 'Periféricos',
    description: 'Teclado mecânico compacto 75% com tripla conectividade (Bluetooth 5.0, Wireless 2.4GHz e USB-C), switches Akko CS Jelly Yellow pré-lubrificados de fábrica e keycaps PBT Double-Shot perfil ASA.',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Formato': '75% Compacto (84 teclas com setas e F-row)',
      'Switches': 'Akko CS Jelly Yellow (Linear 50gf) Hot-Swappable 5 pinos',
      'Keycaps': 'PBT Double-Shot Perfil ASA (Não desgastam o brilho)',
      'Conectividade': 'Bluetooth 5.0 + 2.4GHz Dongle + Cabo USB-C',
      'Bateria': '3.000 mAh recarregável',
      'Iluminação': 'RGB Per-Key com múltiplos efeitos'
    },
    tags: ['Teclado', 'Mecânico', 'Akko', 'Sem Fio', 'Hot-Swap', 'PBT'],
    referencePrice: 549.00,
    currentBestPrice: 419.00,
    idealPrice: 399.00,
    targetAudience: 'Entusiastas de digitação suave, programadores e gamers que prezam por acústica refinada sem ruído estridente.',
    recommendationVerdict: 'RECOMENDADO',
    verdictReason: 'Acústica de digitação premium direto da caixa, sem necessidade de mods, com keycaps PBT eternas e tripla conexão sem fio.',
    ratingOverall: 9.5,
    communityRating: 9.6,
    creatorRating: 9.4,
    performanceScore: 9.5,
    qualityScore: 9.7,
    costBenefitScore: 9.4,
    durabilityScore: 9.8,
    reviewCount: 7,
    ratingCount: 38,
    pros: [
      'Switches Jelly Yellow incrivelmente macios e estáveis com som encorpado ("thock")',
      'Keycaps PBT Double-Shot de alta densidade que não ficam brilhantes com o tempo',
      'Soquetes Hot-Swap que permitem trocar switches sem solda',
      'Bateria de 3.000 mAh com excelente autonomia sem RGB ligado'
    ],
    cons: [
      'Software de configuração da Akko poderia ser mais intuitivo',
      'Não possui layout ABNT2 com tecla Ç nativa (layout ANSI)'
    ],
    status: 'active',
    viewsCount: 6500,
    createdAt: '2025-02-08T18:00:00Z'
  },
  {
    id: 'prod_cloud2wireless',
    name: 'Headset Gamer HyperX Cloud II Wireless 7.1',
    slug: 'headset-hyperx-cloud-ii-wireless',
    brandId: 'brand_hyperx',
    brandName: 'HyperX',
    categoryId: 'cat_peripherals',
    categoryName: 'Periféricos',
    description: 'Versão sem fio do lendário Cloud II com conexão 2.4GHz sem delay, drivers de 53mm de neodímio, estrutura em alumínio e autonomia de até 30 horas de bateria.',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Drivers de Áudio': '53mm com ímãs de neodímio',
      'Conexão': 'Wireless 2.4GHz via Dongle USB',
      'Bateria': 'Até 30 Horas de uso contínuo',
      'Estrutura': 'Alumínio durável com almofadas Memory Foam',
      'Microfone': 'Removível com cancelamento de ruído e monitoramento',
      'Compatibilidade': 'PC, PS4, PS5, Nintendo Switch'
    },
    tags: ['Headset', 'Wireless', 'HyperX', '7.1', 'Gamer', 'Conforto'],
    referencePrice: 899.00,
    currentBestPrice: 679.00,
    idealPrice: 650.00,
    targetAudience: 'Gamers que jogam longas sessões diárias e buscam extremo conforto com áudio posicional nítido.',
    recommendationVerdict: 'RECOMENDADO',
    verdictReason: 'O padrão ouro de conforto no mercado. Conexão sem fio sólida e bateria confiável.',
    ratingOverall: 9.0,
    communityRating: 9.1,
    creatorRating: 8.9,
    performanceScore: 9.0,
    qualityScore: 9.3,
    costBenefitScore: 8.8,
    durabilityScore: 9.4,
    reviewCount: 12,
    ratingCount: 65,
    pros: [
      'Conforto insuperável das espumas viscoelásticas Memory Foam HyperX',
      'Construção em alumínio extremamente resistente e flexível',
      'Sem latência perceptível em jogos competitivos através do receptor 2.4GHz',
      'LED indicador de mudo no próprio microfone'
    ],
    cons: [
      'Microfone apenas razoável para chamadas, não ideal para streaming profissional',
      'Não possui conexão Bluetooth simultânea para celular'
    ],
    status: 'active',
    viewsCount: 7800,
    createdAt: '2025-02-14T11:00:00Z'
  }
];

let offers: Offer[] = [
  // RTX 4060 Offers
  { id: 'off_4060_kabum', productId: 'prod_rtx4060', storeId: 'store_kabum', storeName: 'KaBuM!', storeLogo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80', price: 1849.00, originalPrice: 2199.00, discountPercentage: 16, affiliateUrl: 'https://kabum.com.br/produto/rtx4060?af=reviewhub', inStock: true, lastUpdated: 'Há 20 minutos', isSponsored: true, couponCode: 'TECH100' },
  { id: 'off_4060_amazon', productId: 'prod_rtx4060', storeId: 'store_amazon', storeName: 'Amazon Brasil', storeLogo: 'https://images.unsplash.com/photo-1523474253246-72fb9c27030d?w=100&auto=format&fit=crop&q=80', price: 1899.90, originalPrice: 2199.00, discountPercentage: 14, affiliateUrl: 'https://amazon.com.br/dp/rtx4060?tag=reviewhub-20', inStock: true, lastUpdated: 'Há 1 hora' },
  { id: 'off_4060_terabyte', productId: 'prod_rtx4060', storeId: 'store_terabyte', storeName: 'TerabyteShop', storeLogo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&auto=format&fit=crop&q=80', price: 1879.00, originalPrice: 2149.00, discountPercentage: 12, affiliateUrl: 'https://terabyteshop.com.br/rtx4060?p=reviewhub', inStock: true, lastUpdated: 'Há 3 horas' },
  { id: 'off_4060_pichau', productId: 'prod_rtx4060', storeId: 'store_pichau', storeName: 'Pichau', storeLogo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80', price: 1869.00, originalPrice: 2189.00, discountPercentage: 15, affiliateUrl: 'https://pichau.com.br/rtx4060?af=rhub', inStock: true, lastUpdated: 'Há 4 horas' },

  // RX 7600 Offers
  { id: 'off_7600_kabum', productId: 'prod_rx7600', storeId: 'store_kabum', storeName: 'KaBuM!', storeLogo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80', price: 1599.00, originalPrice: 1999.00, discountPercentage: 20, affiliateUrl: 'https://kabum.com.br/produto/rx7600?af=reviewhub', inStock: true, lastUpdated: 'Há 30 minutos', couponCode: 'AMDPROMO' },
  { id: 'off_7600_terabyte', productId: 'prod_rx7600', storeId: 'store_terabyte', storeName: 'TerabyteShop', storeLogo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&auto=format&fit=crop&q=80', price: 1629.00, originalPrice: 1949.00, discountPercentage: 16, affiliateUrl: 'https://terabyteshop.com.br/rx7600?p=reviewhub', inStock: true, lastUpdated: 'Há 2 horas' },

  // Ryzen 7 5700X Offers
  { id: 'off_5700x_amazon', productId: 'prod_ryzen5700x', storeId: 'store_amazon', storeName: 'Amazon Brasil', storeLogo: 'https://images.unsplash.com/photo-1523474253246-72fb9c27030d?w=100&auto=format&fit=crop&q=80', price: 1149.00, originalPrice: 1399.00, discountPercentage: 18, affiliateUrl: 'https://amazon.com.br/dp/ryzen5700x?tag=reviewhub-20', inStock: true, lastUpdated: 'Há 15 minutos' },
  { id: 'off_5700x_kabum', productId: 'prod_ryzen5700x', storeId: 'store_kabum', storeName: 'KaBuM!', storeLogo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80', price: 1169.00, originalPrice: 1399.00, discountPercentage: 16, affiliateUrl: 'https://kabum.com.br/produto/ryzen5700x?af=reviewhub', inStock: true, lastUpdated: 'Há 1 hora' },

  // Ryzen 5 5600 Offers
  { id: 'off_5600_kabum', productId: 'prod_ryzen5600', storeId: 'store_kabum', storeName: 'KaBuM!', storeLogo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80', price: 779.00, originalPrice: 949.00, discountPercentage: 18, affiliateUrl: 'https://kabum.com.br/produto/ryzen5600?af=reviewhub', inStock: true, lastUpdated: 'Há 10 minutos' },
  { id: 'off_5600_terabyte', productId: 'prod_ryzen5600', storeId: 'store_terabyte', storeName: 'TerabyteShop', storeLogo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&auto=format&fit=crop&q=80', price: 789.00, originalPrice: 949.00, discountPercentage: 17, affiliateUrl: 'https://terabyteshop.com.br/ryzen5600?p=reviewhub', inStock: true, lastUpdated: 'Há 50 minutos' },

  // KC3000 Offers
  { id: 'off_kc3000_amazon', productId: 'prod_kc3000', storeId: 'store_amazon', storeName: 'Amazon Brasil', storeLogo: 'https://images.unsplash.com/photo-1523474253246-72fb9c27030d?w=100&auto=format&fit=crop&q=80', price: 589.00, originalPrice: 749.00, discountPercentage: 21, affiliateUrl: 'https://amazon.com.br/dp/kc3000?tag=reviewhub-20', inStock: true, lastUpdated: 'Há 45 minutos' },

  // LG UltraGear Offers
  { id: 'off_lg_kabum', productId: 'prod_ultragear24', storeId: 'store_kabum', storeName: 'KaBuM!', storeLogo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80', price: 879.00, originalPrice: 1099.00, discountPercentage: 20, affiliateUrl: 'https://kabum.com.br/produto/lg-ultragear?af=reviewhub', inStock: true, lastUpdated: 'Há 1 hora' },

  // Galaxy S25 Offers
  { id: 'off_s25_ml', productId: 'prod_galaxys25', storeId: 'store_ml', storeName: 'Mercado Livre', storeLogo: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&auto=format&fit=crop&q=80', price: 4699.00, originalPrice: 5999.00, discountPercentage: 22, affiliateUrl: 'https://mercadolivre.com.br/samsung-s25?af=rhub', inStock: true, lastUpdated: 'Há 2 horas' },

  // iPhone 15 Offers
  { id: 'off_ip15_amazon', productId: 'prod_iphone15', storeId: 'store_amazon', storeName: 'Amazon Brasil', storeLogo: 'https://images.unsplash.com/photo-1523474253246-72fb9c27030d?w=100&auto=format&fit=crop&q=80', price: 4299.00, originalPrice: 5299.00, discountPercentage: 19, affiliateUrl: 'https://amazon.com.br/dp/iphone15?tag=reviewhub-20', inStock: true, lastUpdated: 'Há 35 minutos' },

  // Akko 3084B Offers
  { id: 'off_akko_amazon', productId: 'prod_akko3084', storeId: 'store_amazon', storeName: 'Amazon Brasil', storeLogo: 'https://images.unsplash.com/photo-1523474253246-72fb9c27030d?w=100&auto=format&fit=crop&q=80', price: 419.00, originalPrice: 549.00, discountPercentage: 24, affiliateUrl: 'https://amazon.com.br/dp/akko3084b?tag=reviewhub-20', inStock: true, lastUpdated: 'Há 3 horas' },

  // HyperX Cloud II Offers
  { id: 'off_hyperx_kabum', productId: 'prod_cloud2wireless', storeId: 'store_kabum', storeName: 'KaBuM!', storeLogo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80', price: 679.00, originalPrice: 899.00, discountPercentage: 24, affiliateUrl: 'https://kabum.com.br/produto/hyperx-cloud-2-wireless?af=reviewhub', inStock: true, lastUpdated: 'Há 1 hora' }
];

let reviews: Review[] = [
  {
    id: 'rev_4060_joao',
    productId: 'prod_rtx4060',
    productName: 'NVIDIA GeForce RTX 4060 8GB',
    productSlug: 'rtx-4060',
    creatorId: 'creator_joao',
    creatorName: 'João Tech',
    creatorUsername: 'joaotech',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    creatorLevel: 'Ouro',
    title: 'RTX 4060 em 2025/2026: Vale a pena comprar ou melhor ir de RX 7600?',
    summary: 'Testamos a RTX 4060 em 15 jogos em 1080p e 1440p com e sem DLSS 3. Analisamos se os 8GB de VRAM pesam no longo prazo e o impacto do consumo de apenas 115W na conta de luz.',
    fullContent: 'Após mais de 30 dias de benchmarks rigorosos, a RTX 4060 se provou uma placa extremamente competente para 1080p Ultra. O DLSS 3 com Frame Generation realmente muda o jogo em Cyberpunk 2077 e Alan Wake 2, entregando mais de 90 FPS com excelente fluidez. O consumo de energia é surpreendentemente baixo (raramente passa de 115W), o que permite utilizar fontes simples de 450W a 500W. Contudo, se você joga em 1440p nativo, os 8GB de VRAM em barramento de 128 bits começam a engasgar com texturas no Ultra. Pelo preço atual de R$ 1.849, ela é uma compra recomendada!',
    rating: 8.8,
    recommendation: 'RECOMENDADO',
    pros: [
      'Consumo térmico e elétrico baixíssimo (115W)',
      'DLSS 3 e Reflex entregam excelente taxa de quadros e baixa latência',
      'NVENC com AV1 excelente para lives e vídeos'
    ],
    cons: [
      '8GB de VRAM exige prudência em texturas em 1440p',
      'Preço de lançamento original era elevado'
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeVideoId: 'dQw4w9WgXcQ',
    images: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80'],
    views: 12400,
    likes: 830,
    likedBy: ['user_gamer'],
    commentsCount: 24,
    status: 'published',
    createdAt: '2025-01-25T14:00:00Z',
    updatedAt: '2025-01-25T14:00:00Z'
  },
  {
    id: 'rev_7600_lucas',
    productId: 'prod_rx7600',
    productName: 'AMD Radeon RX 7600 8GB',
    productSlug: 'rx-7600',
    creatorId: 'creator_lucas',
    creatorName: 'Lucas Hardware',
    creatorUsername: 'lucashardware',
    creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    creatorLevel: 'Especialista',
    title: 'RX 7600: O Verdadeiro Custo-Benefício para 1080p sem enrolação',
    summary: 'Comparativo direto entre RX 7600 e RTX 4060. Mostramos onde a AMD vence no bolso e quando a NVIDIA vale a diferença de R$ 300.',
    fullContent: 'Se o seu objetivo é jogar títulos competitivos (CS2, Warzone, Rainbow Six, Fortnite) e jogos em rasterização pura, a RX 7600 por R$ 1.599 é a escolha mais lógica financeiramente. Ela entrega praticamente o mesmo FPS nativo que a RTX 4060 custando cerca de R$ 250 a R$ 300 a menos. Os drivers Adrenalin melhoraram drasticamente e o AFMF 2 funciona muito bem. O único ponto onde ela perde feio é no Ray Tracing.',
    rating: 8.6,
    recommendation: 'RECOMENDADO',
    pros: [
      'Melhor preço por FPS bruto da categoria',
      'Drivers AMD Adrenalin repletos de recursos fáceis',
      'Desempenho impecável em 1080p nativo'
    ],
    cons: [
      'Desempenho com Ray Tracing ligado cai muito',
      'Consome mais energia que a RTX 4060 (165W vs 115W)'
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=jLg2d5c3z6Y',
    youtubeVideoId: 'jLg2d5c3z6Y',
    images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80'],
    views: 8900,
    likes: 610,
    likedBy: [],
    commentsCount: 18,
    status: 'published',
    createdAt: '2025-01-26T16:20:00Z',
    updatedAt: '2025-01-26T16:20:00Z'
  },
  {
    id: 'rev_5700x_lucas',
    productId: 'prod_ryzen5700x',
    productName: 'AMD Ryzen 7 5700X',
    productSlug: 'ryzen-7-5700x',
    creatorId: 'creator_lucas',
    creatorName: 'Lucas Hardware',
    creatorUsername: 'lucashardware',
    creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    creatorLevel: 'Especialista',
    title: 'Ryzen 7 5700X: Ainda vale a pena comprar AM4 em 2025/2026?',
    summary: 'Vale a pena investir no AM4 hoje ou migrar direto para AM5 com DDR5? Fizemos a matemática do custo total de plataforma.',
    fullContent: 'Para quem já possui uma placa-mãe AM4 (como B450 ou B550) com memórias DDR4, o Ryzen 7 5700X é simplesmente a salvação do orçamento. Por R$ 1.149 você ganha 8 núcleos modernos que aguentam placas como RTX 4070 ou RX 7800 XT sem gargalo significativo em 1440p. Além disso, esquenta muito pouco graças ao TDP de 65W.',
    rating: 9.3,
    recommendation: 'RECOMENDADO',
    pros: [
      '8 núcleos frios e fáceis de resfriar com Air Cooler básico',
      'Evita o gasto pesado de trocar placa-mãe e memória para DDR5',
      'Estabilidade fantástica em jogos e edição de vídeo'
    ],
    cons: [
      'Sem upgrade para gerações futuras no mesmo soquete',
      'Não vem cooler incluso na caixa'
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=9fK2b_q1m5o',
    youtubeVideoId: '9fK2b_q1m5o',
    images: ['https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80'],
    views: 14200,
    likes: 980,
    likedBy: ['creator_joao', 'user_gamer'],
    commentsCount: 31,
    status: 'published',
    createdAt: '2025-01-18T10:15:00Z',
    updatedAt: '2025-01-18T10:15:00Z'
  },
  {
    id: 'rev_akko_camila',
    productId: 'prod_akko3084',
    productName: 'Teclado Mecânico Akko 3084B Plus Switch Yellow',
    productSlug: 'teclado-akko-3084b-plus',
    creatorId: 'creator_camila',
    creatorName: 'Camila Tech Review',
    creatorUsername: 'camilatech',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    creatorLevel: 'Prata',
    title: 'Akko 3084B Plus: O Teclado Mecânico Sem Fio Perfeito para Home Office e Jogos',
    summary: 'Testamos a digitação, bateria de 3000mAh e o som cremoso dos switches Jelly Yellow pré-lubrificados de fábrica.',
    fullContent: 'Este teclado é um marco em qualidade construtiva na faixa dos R$ 400. As keycaps PBT ASA são espessas e não acumulam gordura dos dedos, e os switches Jelly Yellow têm uma sensação linear amanteigada sem nenhuma ressonância metálica. A conexão wireless 2.4GHz é imediata e sem engasgos.',
    rating: 9.6,
    recommendation: 'RECOMENDADO',
    pros: [
      'Som de digitação delicioso e macio direto da caixa',
      'Keycaps PBT ASA premium',
      'Conexão tripla sem fio excelente'
    ],
    cons: [
      'Layout ANSI requer hábito se você usa muito ABNT2'
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=XqZsoesa55w',
    youtubeVideoId: 'XqZsoesa55w',
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'],
    views: 5400,
    likes: 420,
    likedBy: [],
    commentsCount: 12,
    status: 'published',
    createdAt: '2025-02-10T17:00:00Z',
    updatedAt: '2025-02-10T17:00:00Z'
  }
];

let userRatings: UserRating[] = [
  {
    id: 'rate_1',
    productId: 'prod_rtx4060',
    userId: 'user_gamer',
    userName: 'Rodrigo Gamer',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 9.0,
    title: 'Surpreendeu no consumo e no silêncio!',
    comment: 'Comprei na KaBuM com a indicação daqui. Saí de uma GTX 1060 e a diferença é brutal. Não passa de 58 graus jogando Warzone em Full HD tudo no talo.',
    pros: ['Fria e silenciosa', 'DLSS 3 salvou em Cyberpunk'],
    cons: ['Poderia ter 12GB pelo preço'],
    wouldRecommend: true,
    isVerifiedPurchase: true,
    helpfulCount: 14,
    helpfulBy: [],
    reported: false,
    createdAt: '2025-02-01T20:00:00Z'
  },
  {
    id: 'rate_2',
    productId: 'prod_rx7600',
    userId: 'user_gamer',
    userName: 'Rodrigo Gamer',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 8.5,
    title: 'Muito forte em 1080p!',
    comment: 'Placa super estável nos drivers novos. Paguei R$ 1.599 e não me arrependo de nada.',
    pros: ['Preço justo', 'FPS alto'],
    cons: ['Esquenta um pouco mais'],
    wouldRecommend: true,
    isVerifiedPurchase: true,
    helpfulCount: 8,
    helpfulBy: [],
    reported: false,
    createdAt: '2025-02-05T18:30:00Z'
  }
];

let comments: Comment[] = [
  {
    id: 'com_1',
    reviewId: 'rev_4060_joao',
    userId: 'user_gamer',
    userName: 'Rodrigo Gamer',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    userRole: 'USER',
    text: 'Review super lúcido, João! Minha maior dúvida era a fonte de 450W que eu tinha, e funcionou perfeitamente aqui sem precisar trocar a fonte.',
    likes: 6,
    likedBy: [],
    createdAt: '2025-01-26T09:12:00Z'
  },
  {
    id: 'com_2',
    reviewId: 'rev_4060_joao',
    userId: 'creator_joao',
    userName: 'João Tech',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    userRole: 'CREATOR',
    text: 'Valeu Rodrigo! Exatamente isso, a eficiência da arquitetura Ada Lovelace é um dos maiores pontos fortes.',
    likes: 4,
    likedBy: [],
    parentCommentId: 'com_1',
    createdAt: '2025-01-26T10:00:00Z'
  }
];

let favorites: Favorite[] = [
  { id: 'fav_1', userId: 'user_gamer', productId: 'prod_rtx4060', addedAt: '2025-02-01T10:00:00Z', priceAlertThreshold: 1800 }
];

let notifications: Notification[] = [
  { id: 'notif_1', userId: 'creator_joao', title: 'Comissão Registrada!', message: 'Você recebeu R$ 25,88 de comissão pela compra de uma RTX 4060 via KaBuM!', link: '/painel-criador', read: false, type: 'commission', createdAt: '2025-02-15T10:00:00Z' },
  { id: 'notif_2', userId: 'creator_joao', title: 'Review Aprovado', message: 'Seu review "RTX 4060 em 2025" foi aprovado pela moderação e está público.', link: '/review/rtx-4060', read: true, type: 'review_approved', createdAt: '2025-01-25T14:05:00Z' }
];

let affiliateClicks: AffiliateClick[] = [
  { id: 'click_1', productId: 'prod_rtx4060', productName: 'NVIDIA GeForce RTX 4060 8GB', offerId: 'off_4060_kabum', creatorId: 'creator_joao', creatorName: 'João Tech', storeName: 'KaBuM!', createdAt: '2025-02-15T09:30:00Z' },
  { id: 'click_2', productId: 'prod_rx7600', productName: 'AMD Radeon RX 7600 8GB', offerId: 'off_7600_kabum', creatorId: 'creator_lucas', creatorName: 'Lucas Hardware', storeName: 'KaBuM!', createdAt: '2025-02-15T11:20:00Z' }
];

let conversions: Conversion[] = [
  { id: 'conv_1', clickId: 'click_1', productId: 'prod_rtx4060', productName: 'NVIDIA GeForce RTX 4060 8GB', creatorId: 'creator_joao', creatorName: 'João Tech', storeName: 'KaBuM!', saleAmount: 1849.00, platformCommission: 38.83, creatorCommission: 25.88, status: 'confirmed', createdAt: '2025-02-15T10:00:00Z' }
];

let reports: Report[] = [];

let adminLogs: AdminLog[] = [
  { id: 'log_1', adminId: 'user_admin', adminName: 'Carlos Admin', action: 'CREATE_PRODUCT', targetType: 'Product', targetId: 'prod_rtx4060', details: 'Cadastrou o produto NVIDIA GeForce RTX 4060', createdAt: '2025-01-20T10:00:00Z' },
  { id: 'log_2', adminId: 'user_admin', adminName: 'Carlos Admin', action: 'APPROVE_REVIEW', targetType: 'Review', targetId: 'rev_4060_joao', details: 'Aprovou review publicado pelo criador João Tech', createdAt: '2025-01-25T14:05:00Z' }
];

let adBanners: AdBanner[] = [
  {
    id: 'ad_1',
    title: 'KaBuM! Mega Ofertas Hardware',
    sponsorName: 'KaBuM!',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    linkUrl: 'https://kabum.com.br?af=reviewhub',
    position: 'home_hero',
    active: true,
    clickCount: 142,
    impressionCount: 3890
  }
];

// --- AUTH HELPER / SESSION RESOLVER ---
let currentSessionUser: User = users[1]; // Fallback default (João Tech - Creator)

// Helper function to extract authenticated user from request header or session
function getAuthUser(req: express.Request): User {
  const headerUserId = req.headers['x-user-id'] as string | undefined;
  if (headerUserId) {
    const user = users.find(u => u.id === headerUserId);
    if (user) return user;
  }
  return currentSessionUser;
}

// Robust helper function to extract youtube video ID safely across all standard formats
function extractYouTubeId(url?: string): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  const cleanUrl = url.trim();
  // Match youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID, etc.
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = cleanUrl.match(regExp);
  return match && match[1] ? match[1] : undefined;
}

// ==========================================
// API ROUTES
// ==========================================

// --- AUTH & USER ENDPOINTS ---
app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  res.json({ user });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Por favor, informe seu email.' });
  }
  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (user) {
    currentSessionUser = user;
    res.json({ success: true, user });
  } else {
    res.status(401).json({ error: 'Email não encontrado. Cadastre-se gratuitamente ou escolha um perfil de teste.' });
  }
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Informe seu endereço de email.' });
  }
  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (user) {
    res.json({ success: true, message: `Um link seguro de recuperação de senha foi enviado para ${email}. Verifique sua caixa de entrada.` });
  } else {
    // Return friendly generic confirmation for privacy
    res.json({ success: true, message: `Se o email ${email} estiver cadastrado, um link de recuperação foi enviado.` });
  }
});

app.post('/api/auth/switch-profile', (req, res) => {
  const { userId } = req.body;
  const user = users.find(u => u.id === userId);
  if (user) {
    currentSessionUser = user;
    res.json({ success: true, user });
  } else {
    res.status(404).json({ error: 'Perfil de demonstração não encontrado.' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, role, username, bio, youtubeChannelUrl } = req.body;
  if (!name || !name.trim() || !email || !email.trim()) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios.' });
  }

  // Check email collision
  const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Este endereço de email já está cadastrado. Faça login ou use outro email.' });
  }

  const cleanUsername = username 
    ? username.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() 
    : name.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9_]/g, '');

  const newUser: User = {
    id: `user_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    username: cleanUsername || `user_${Date.now().toString().slice(-4)}`,
    role: (role === 'CREATOR' || role === 'ADMIN') ? role : 'USER',
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername || Date.now()}`,
    bio: bio || 'Entusiasta de tecnologia no ReviewHub.',
    creatorLevel: role === 'CREATOR' ? 'Novato' : undefined,
    reputationScore: 10,
    badges: role === 'CREATOR' ? ['🌱 Novo Criador'] : ['🌱 Membro da Comunidade'],
    balance: 0,
    pendingBalance: 0,
    totalEarnings: 0,
    youtubeChannelUrl: youtubeChannelUrl ? youtubeChannelUrl.trim() : undefined,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  currentSessionUser = newUser;
  res.json({ success: true, user: newUser });
});

app.put('/api/auth/profile', (req, res) => {
  const user = getAuthUser(req);
  const { name, bio, youtubeChannelUrl, avatarUrl } = req.body;
  
  if (name) user.name = name.trim();
  if (bio !== undefined) user.bio = bio;
  if (youtubeChannelUrl !== undefined) user.youtubeChannelUrl = youtubeChannelUrl;
  if (avatarUrl) user.avatarUrl = avatarUrl;

  res.json({ success: true, user });
});

app.post('/api/auth/logout', (req, res) => {
  currentSessionUser = users[4] || users[0];
  res.json({ success: true });
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

// --- PLATFORM SETTINGS & METRICS ---
app.get('/api/settings', (req, res) => {
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  const authUser = getAuthUser(req);
  if (authUser.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem alterar as configurações da plataforma.' });
  }
  settings = { ...settings, ...req.body };
  adminLogs.unshift({
    id: `log_${Date.now()}`,
    adminId: authUser.id,
    adminName: authUser.name,
    action: 'UPDATE_SETTINGS',
    targetType: 'PlatformSettings',
    targetId: 'settings',
    details: `Atualizou configurações: Comissão Criador=${settings.creatorCommissionRate}%, Saque Mínimo=R$${settings.minWithdrawalAmount}`,
    createdAt: new Date().toISOString()
  });
  res.json({ success: true, settings });
});

// --- CATEGORIES & BRANDS ---
app.get('/api/categories', (req, res) => {
  // dynamically calculate counts
  const result = categories.map(cat => ({
    ...cat,
    productCount: products.filter(p => p.categoryId === cat.id && p.status === 'active').length
  }));
  res.json(result);
});

app.get('/api/brands', (req, res) => {
  res.json(brands.filter(b => b.status === 'active'));
});

app.get('/api/stores', (req, res) => {
  res.json(stores.filter(s => s.status === 'active'));
});

// --- PRODUCTS ---
app.get('/api/products', (req, res) => {
  const { category, brand, search, sort, verdict, minPrice, maxPrice, minRating } = req.query;
  let list = [...products];

  // Filters
  if (category) {
    list = list.filter(p => p.categoryId === category || p.categoryName.toLowerCase() === (category as string).toLowerCase());
  }
  if (brand) {
    list = list.filter(p => p.brandId === brand || p.brandName.toLowerCase() === (brand as string).toLowerCase());
  }
  if (verdict) {
    list = list.filter(p => p.recommendationVerdict === verdict);
  }
  if (minPrice) {
    list = list.filter(p => p.currentBestPrice >= Number(minPrice));
  }
  if (maxPrice) {
    list = list.filter(p => p.currentBestPrice <= Number(maxPrice));
  }
  if (minRating) {
    list = list.filter(p => p.ratingOverall >= Number(minRating));
  }
  if (search) {
    const q = (search as string).toLowerCase().trim();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.brandName.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Sort
  if (sort === 'cost_benefit') {
    list.sort((a, b) => b.costBenefitScore - a.costBenefitScore);
  } else if (sort === 'best_rating') {
    list.sort((a, b) => b.ratingOverall - a.ratingOverall);
  } else if (sort === 'price_asc') {
    list.sort((a, b) => a.currentBestPrice - b.currentBestPrice);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.currentBestPrice - a.currentBestPrice);
  } else if (sort === 'reviews') {
    list.sort((a, b) => b.reviewCount - a.reviewCount);
  } else if (sort === 'popular') {
    list.sort((a, b) => b.viewsCount - a.viewsCount);
  }

  res.json(list);
});

// Search suggestions for instant search bar
app.get('/api/products/search/suggest', (req, res) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  if (!query) {
    return res.json({ products: [], brands: [], categories: [] });
  }

  const matchingProducts = products
    .filter(p => p.name.toLowerCase().includes(query) || p.tags.some(t => t.toLowerCase().includes(query)))
    .slice(0, 6)
    .map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      imageUrl: p.imageUrl,
      price: p.currentBestPrice,
      rating: p.ratingOverall,
      verdict: p.recommendationVerdict,
      categoryName: p.categoryName
    }));

  const matchingBrands = brands
    .filter(b => b.name.toLowerCase().includes(query))
    .slice(0, 3)
    .map(b => ({ id: b.id, name: b.name, slug: b.slug }));

  const matchingCategories = categories
    .filter(c => c.name.toLowerCase().includes(query))
    .slice(0, 3)
    .map(c => ({ id: c.id, name: c.name, slug: c.slug }));

  res.json({
    products: matchingProducts,
    brands: matchingBrands,
    categories: matchingCategories
  });
});

app.get('/api/products/:slugOrId', (req, res) => {
  const { slugOrId } = req.params;
  const product = products.find(p => p.slug === slugOrId || p.id === slugOrId);
  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado.' });
  }
  // increment view count
  product.viewsCount += 1;

  // Get offers for this product
  const productOffers = offers.filter(o => o.productId === product.id);

  // Get reviews for this product
  const productReviews = reviews.filter(r => r.productId === product.id && r.status === 'published');

  // Get user ratings
  const ratings = userRatings.filter(r => r.productId === product.id);

  res.json({
    product,
    offers: productOffers,
    reviews: productReviews,
    ratings
  });
});

// Create product (Admin only)
app.post('/api/products', (req, res) => {
  const authUser = getAuthUser(req);
  if (authUser.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Apenas administradores podem cadastrar produtos.' });
  }
  const { name, brandId, categoryId, description, imageUrl, specs, referencePrice, currentBestPrice, idealPrice, targetAudience, recommendationVerdict, verdictReason, pros, cons } = req.body;
  if (!name || !brandId || !categoryId) {
    return res.status(400).json({ error: 'Nome, marca e categoria são obrigatórios.' });
  }

  const brand = brands.find(b => b.id === brandId);
  const category = categories.find(c => c.id === categoryId);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    name,
    slug,
    brandId,
    brandName: brand?.name || 'Marca',
    categoryId,
    categoryName: category?.name || 'Categoria',
    description: description || '',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
    galleryImages: [imageUrl || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80'],
    specs: specs || {},
    tags: [brand?.name || '', category?.name || ''].filter(Boolean),
    referencePrice: Number(referencePrice) || 0,
    currentBestPrice: Number(currentBestPrice) || Number(referencePrice) || 0,
    idealPrice: Number(idealPrice) || Number(currentBestPrice) || 0,
    targetAudience: targetAudience || 'Entusiastas e consumidores exigentes.',
    recommendationVerdict: recommendationVerdict || 'RECOMENDADO',
    verdictReason: verdictReason || 'Análise de custo-benefício baseada em especificações.',
    ratingOverall: 8.5,
    communityRating: 8.5,
    creatorRating: 8.5,
    performanceScore: 8.5,
    qualityScore: 8.5,
    costBenefitScore: 8.5,
    durabilityScore: 8.5,
    reviewCount: 0,
    ratingCount: 0,
    pros: pros || ['Excelente desempenho', 'Construção sólida'],
    cons: cons || ['Preço pode oscilar'],
    status: 'active',
    viewsCount: 0,
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);
  adminLogs.unshift({
    id: `log_${Date.now()}`,
    adminId: authUser.id,
    adminName: authUser.name,
    action: 'CREATE_PRODUCT',
    targetType: 'Product',
    targetId: newProduct.id,
    details: `Cadastrou o produto ${newProduct.name}`,
    createdAt: new Date().toISOString()
  });

  res.json({ success: true, product: newProduct });
});

// Update product (Admin only)
app.put('/api/products/:id', (req, res) => {
  const authUser = getAuthUser(req);
  if (authUser.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Apenas administradores podem atualizar produtos.' });
  }
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Produto não encontrado.' });
  }
  products[index] = { ...products[index], ...req.body };
  adminLogs.unshift({
    id: `log_${Date.now()}`,
    adminId: authUser.id,
    adminName: authUser.name,
    action: 'UPDATE_PRODUCT',
    targetType: 'Product',
    targetId: req.params.id,
    details: `Atualizou dados do produto ${products[index].name}`,
    createdAt: new Date().toISOString()
  });
  res.json({ success: true, product: products[index] });
});

// Archive/Soft-delete product
app.delete('/api/products/:id', (req, res) => {
  const authUser = getAuthUser(req);
  if (authUser.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Apenas administradores podem excluir produtos.' });
  }
  const product = products.find(p => p.id === req.params.id);
  if (product) {
    product.status = 'archived';
    adminLogs.unshift({
      id: `log_${Date.now()}`,
      adminId: authUser.id,
      adminName: authUser.name,
      action: 'ARCHIVE_PRODUCT',
      targetType: 'Product',
      targetId: req.params.id,
      details: `Arquivou o produto ${product.name}`,
      createdAt: new Date().toISOString()
    });
  }
  res.json({ success: true });
});

// --- COMPARISON ENGINE ---
app.post('/api/products/compare', (req, res) => {
  const { productIds } = req.body;
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: 'Envie uma lista com até 4 produtos para comparar.' });
  }

  const selectedProducts = products.filter(p => productIds.includes(p.id)).slice(0, 4);
  if (selectedProducts.length === 0) {
    return res.status(404).json({ error: 'Nenhum dos produtos selecionados foi encontrado.' });
  }

  // Automatic smart awards calculation
  let bestOverall = selectedProducts[0];
  let bestValue = selectedProducts[0];
  let bestPerformance = selectedProducts[0];
  let cheapest = selectedProducts[0];

  for (const p of selectedProducts) {
    if (p.ratingOverall > bestOverall.ratingOverall) bestOverall = p;
    if (p.costBenefitScore > bestValue.costBenefitScore) bestValue = p;
    if (p.performanceScore > bestPerformance.performanceScore) bestPerformance = p;
    if (p.currentBestPrice < cheapest.currentBestPrice && p.currentBestPrice > 0) cheapest = p;
  }

  // Gather unique spec keys across all compared products
  const allSpecKeys = Array.from(
    new Set(selectedProducts.flatMap(p => Object.keys(p.specs || {})))
  );

  res.json({
    products: selectedProducts,
    specKeys: allSpecKeys,
    awards: {
      bestOverallId: bestOverall.id,
      bestValueId: bestValue.id,
      bestPerformanceId: bestPerformance.id,
      cheapestId: cheapest.id
    }
  });
});

// --- REVIEWS & CREATORS ---
app.get('/api/reviews', (req, res) => {
  const authUser = getAuthUser(req);
  const { status, creatorId, productId } = req.query;
  let list = [...reviews];
  if (status) {
    list = list.filter(r => r.status === status);
  } else {
    // default public only unless creator viewing their own or admin
    if (authUser.role !== 'ADMIN') {
      list = list.filter(r => r.status === 'published' || (r.creatorId === authUser.id));
    }
  }
  if (creatorId) {
    list = list.filter(r => r.creatorId === creatorId);
  }
  if (productId) {
    list = list.filter(r => r.productId === productId);
  }
  res.json(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

app.get('/api/reviews/:id', (req, res) => {
  const review = reviews.find(r => r.id === req.params.id);
  if (!review) {
    return res.status(404).json({ error: 'Review não encontrado.' });
  }
  review.views += 1;
  const reviewComments = comments.filter(c => c.reviewId === review.id);
  const relatedProduct = products.find(p => p.id === review.productId);
  const relatedOffers = offers.filter(o => o.productId === review.productId);

  res.json({
    review,
    comments: reviewComments,
    product: relatedProduct,
    offers: relatedOffers
  });
});

// Create Review (Creator or Admin)
app.post('/api/reviews', (req, res) => {
  const authUser = getAuthUser(req);
  if (authUser.role !== 'CREATOR' && authUser.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Apenas criadores aprovados e administradores podem publicar reviews.' });
  }
  const { productId, title, summary, fullContent, rating, recommendation, pros, cons, youtubeUrl, images, isDraft } = req.body;
  if (!productId || !title || !summary) {
    return res.status(400).json({ error: 'Produto, título e resumo são obrigatórios.' });
  }

  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado.' });
  }

  const youtubeVideoId = extractYouTubeId(youtubeUrl);
  const status: 'draft' | 'pending' | 'published' = isDraft 
    ? 'draft' 
    : (authUser.role === 'ADMIN' || settings.autoApproveVerifiedCreators ? 'published' : 'pending');

  const newReview: Review = {
    id: `rev_${Date.now()}`,
    productId,
    productName: product.name,
    productSlug: product.slug,
    creatorId: authUser.id,
    creatorName: authUser.name,
    creatorUsername: authUser.username,
    creatorAvatar: authUser.avatarUrl,
    creatorLevel: authUser.creatorLevel || 'Novato',
    title: title.trim(),
    summary: summary.trim(),
    fullContent: fullContent || summary,
    rating: Math.min(10, Math.max(0, Number(rating) || 8.0)),
    recommendation: recommendation || 'RECOMENDADO',
    pros: Array.isArray(pros) ? pros : [],
    cons: Array.isArray(cons) ? cons : [],
    youtubeUrl: youtubeUrl || undefined,
    youtubeVideoId,
    images: Array.isArray(images) && images.length > 0 ? images : [product.imageUrl],
    views: 0,
    likes: 0,
    likedBy: [],
    commentsCount: 0,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  reviews.unshift(newReview);

  // If auto-published, update product reviewCount and average creator rating
  if (status === 'published') {
    product.reviewCount += 1;
    const pubReviews = reviews.filter(r => r.productId === product.id && r.status === 'published');
    const avgScore = pubReviews.reduce((acc, curr) => acc + curr.rating, 0) / pubReviews.length;
    product.creatorRating = Number(avgScore.toFixed(1));
    product.ratingOverall = Number(((product.communityRating + product.creatorRating) / 2).toFixed(1));
  }

  res.json({ success: true, review: newReview });
});

// Like / Unlike review
app.post('/api/reviews/:id/like', (req, res) => {
  const authUser = getAuthUser(req);
  const review = reviews.find(r => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: 'Review não encontrado.' });

  const userId = authUser.id;
  const hasLiked = review.likedBy.includes(userId);

  if (hasLiked) {
    review.likedBy = review.likedBy.filter(id => id !== userId);
    review.likes = Math.max(0, review.likes - 1);
  } else {
    review.likedBy.push(userId);
    review.likes += 1;
    // Add notification to creator if not self
    if (review.creatorId !== userId) {
      notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: review.creatorId,
        title: 'Nova curtida! 👍',
        message: `${authUser.name} curtiu seu review "${review.title.slice(0, 35)}..."`,
        link: `/review/${review.productSlug}`,
        read: false,
        type: 'like',
        createdAt: new Date().toISOString()
      });
    }
  }

  res.json({ success: true, likes: review.likes, hasLiked: !hasLiked });
});

// Comments on review
app.post('/api/reviews/:id/comments', (req, res) => {
  const authUser = getAuthUser(req);
  const { text, parentCommentId } = req.body;
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Texto do comentário não pode estar vazio.' });
  }
  const review = reviews.find(r => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: 'Review não encontrado.' });

  const newComment: Comment = {
    id: `com_${Date.now()}`,
    reviewId: review.id,
    userId: authUser.id,
    userName: authUser.name,
    userAvatar: authUser.avatarUrl,
    userRole: authUser.role,
    text: text.trim(),
    likes: 0,
    likedBy: [],
    parentCommentId: parentCommentId || undefined,
    createdAt: new Date().toISOString()
  };

  comments.push(newComment);
  review.commentsCount += 1;

  res.json({ success: true, comment: newComment });
});

// Review Moderation (Admin)
app.post('/api/admin/reviews/:id/moderate', (req, res) => {
  const authUser = getAuthUser(req);
  if (authUser.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Apenas administradores podem moderar reviews.' });
  }
  const { status, rejectionReason, moderationNotes } = req.body;
  const review = reviews.find(r => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: 'Review não encontrado.' });

  review.status = status;
  review.rejectionReason = rejectionReason;
  review.moderationNotes = moderationNotes;
  review.updatedAt = new Date().toISOString();

  // Notify creator
  notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: review.creatorId,
    title: status === 'published' ? 'Review Aprovado! 🎉' : 'Review Rejeitado ou em Revisão',
    message: status === 'published' 
      ? `Seu review "${review.title}" foi aprovado e agora está disponível para todos os usuários!`
      : `Seu review "${review.title}" foi ${status === 'rejected' ? 'rejeitado' : 'atualizado'}. Motivo: ${rejectionReason || 'Não especificado.'}`,
    link: `/review/${review.productSlug}`,
    read: false,
    type: status === 'published' ? 'review_approved' : 'review_rejected',
    createdAt: new Date().toISOString()
  });

  adminLogs.unshift({
    id: `log_${Date.now()}`,
    adminId: authUser.id,
    adminName: authUser.name,
    action: `MODERATE_REVIEW_${status.toUpperCase()}`,
    targetType: 'Review',
    targetId: review.id,
    details: `${status === 'published' ? 'Aprovou' : 'Rejeitou'} o review "${review.title}" do criador ${review.creatorName}`,
    createdAt: new Date().toISOString()
  });

  res.json({ success: true, review });
});

// --- USER RATINGS & EVALUATIONS ---
app.post('/api/ratings', (req, res) => {
  const authUser = getAuthUser(req);
  const { productId, rating, title, comment, pros, cons, wouldRecommend, isVerifiedPurchase } = req.body;
  if (!productId || rating === undefined) {
    return res.status(400).json({ error: 'Produto e nota são obrigatórios.' });
  }

  // Prevent duplicate spam from the same user on the same product
  const existing = userRatings.find(r => r.productId === productId && r.userId === authUser.id);
  if (existing) {
    // update existing
    existing.rating = Number(rating);
    existing.title = title || '';
    existing.comment = comment || '';
    existing.pros = Array.isArray(pros) ? pros : [];
    existing.cons = Array.isArray(cons) ? cons : [];
    existing.wouldRecommend = wouldRecommend !== false;
    existing.isVerifiedPurchase = isVerifiedPurchase || existing.isVerifiedPurchase;
    existing.createdAt = new Date().toISOString();
  } else {
    const newRating: UserRating = {
      id: `rate_${Date.now()}`,
      productId,
      userId: authUser.id,
      userName: authUser.name,
      userAvatar: authUser.avatarUrl,
      rating: Number(rating),
      title: title || '',
      comment: comment || '',
      pros: Array.isArray(pros) ? pros : [],
      cons: Array.isArray(cons) ? cons : [],
      wouldRecommend: wouldRecommend !== false,
      isVerifiedPurchase: Boolean(isVerifiedPurchase),
      helpfulCount: 0,
      helpfulBy: [],
      reported: false,
      createdAt: new Date().toISOString()
    };
    userRatings.push(newRating);
  }

  // Recalculate weighted community rating
  const product = products.find(p => p.id === productId);
  if (product) {
    const prodRatings = userRatings.filter(r => r.productId === productId);
    const avgRating = prodRatings.reduce((acc, curr) => acc + curr.rating, 0) / prodRatings.length;
    product.communityRating = Number(avgRating.toFixed(1));
    product.ratingCount = prodRatings.length;
    product.ratingOverall = Number(((product.communityRating + product.creatorRating) / 2).toFixed(1));
  }

  res.json({ success: true });
});

// Helpful vote on user rating
app.post('/api/ratings/:id/helpful', (req, res) => {
  const authUser = getAuthUser(req);
  const r = userRatings.find(item => item.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Avaliação não encontrada.' });

  const userId = authUser.id;
  if (!r.helpfulBy.includes(userId)) {
    r.helpfulBy.push(userId);
    r.helpfulCount += 1;
  } else {
    r.helpfulBy = r.helpfulBy.filter(id => id !== userId);
    r.helpfulCount = Math.max(0, r.helpfulCount - 1);
  }
  res.json({ success: true, helpfulCount: r.helpfulCount });
});

// --- OFFERS & AFFILIATE ENGINE (SAFE TRACKING) ---
app.get('/api/offers', (req, res) => {
  const { productId, featured } = req.query;
  let list = [...offers];
  if (productId) list = list.filter(o => o.productId === productId);
  if (featured === 'true') list = list.sort((a, b) => b.discountPercentage - a.discountPercentage);
  res.json(list);
});

// Track Affiliate Click (Returns destination URL and records event)
app.post('/api/affiliates/click', (req, res) => {
  const { offerId, creatorId } = req.body;
  const offer = offers.find(o => o.id === offerId);
  if (!offer) {
    return res.status(404).json({ error: 'Oferta não encontrada.' });
  }

  const product = products.find(p => p.id === offer.productId);
  const creator = creatorId ? users.find(u => u.id === creatorId) : undefined;

  const click: AffiliateClick = {
    id: `click_${Date.now()}`,
    productId: offer.productId,
    productName: product?.name || 'Produto',
    offerId: offer.id,
    creatorId: creator?.id,
    creatorName: creator?.name,
    storeName: offer.storeName,
    createdAt: new Date().toISOString()
  };

  affiliateClicks.unshift(click);

  res.json({
    success: true,
    clickId: click.id,
    redirectUrl: offer.affiliateUrl
  });
});

// Simulation of purchase conversion for Creator monetization demo
app.post('/api/affiliates/simulate-conversion', (req, res) => {
  const { offerId, creatorId } = req.body;
  const offer = offers.find(o => o.id === offerId) || offers[0];
  const product = products.find(p => p.id === offer.productId);
  const creator = creatorId ? users.find(u => u.id === creatorId) : users.find(u => u.role === 'CREATOR');

  const saleAmount = offer.price;
  const store = stores.find(s => s.name === offer.storeName);
  const storeCommissionRate = (store?.defaultCommissionPercentage || 3.5) / 100;
  const totalCommission = Number((saleAmount * storeCommissionRate).toFixed(2));
  
  // Platform & Creator split based on settings
  const creatorShare = settings.creatorCommissionRate / 100;
  const creatorCommission = Number((totalCommission * creatorShare).toFixed(2));
  const platformCommission = Number((totalCommission - creatorCommission).toFixed(2));

  const conv: Conversion = {
    id: `conv_${Date.now()}`,
    clickId: `click_${Date.now()}`,
    productId: offer.productId,
    productName: product?.name || 'Produto',
    creatorId: creator?.id,
    creatorName: creator?.name,
    storeName: offer.storeName,
    saleAmount,
    platformCommission,
    creatorCommission,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  conversions.unshift(conv);

  // Credit creator balance
  if (creator) {
    creator.balance += creatorCommission;
    creator.totalEarnings += creatorCommission;

    notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: creator.id,
      title: 'Nova comissão confirmada! 💰',
      message: `Você recebeu R$ ${creatorCommission.toFixed(2)} pela venda de ${product?.name} na ${offer.storeName}!`,
      link: '/painel-criador',
      read: false,
      type: 'commission',
      createdAt: new Date().toISOString()
    });
  }

  res.json({ success: true, conversion: conv });
});

// --- CREATOR PORTAL & DASHBOARD ---
app.get('/api/creators', (req, res) => {
  const creators = users.filter(u => u.role === 'CREATOR');
  const result = creators.map(c => {
    const creatorReviews = reviews.filter(r => r.creatorId === c.id && r.status === 'published');
    const totalViews = creatorReviews.reduce((acc, curr) => acc + curr.views, 0);
    const creatorConversions = conversions.filter(conv => conv.creatorId === c.id);
    return {
      ...c,
      totalReviews: creatorReviews.length,
      totalViews,
      totalConversions: creatorConversions.length
    };
  });
  res.json(result);
});

app.get('/api/creators/:usernameOrId', (req, res) => {
  const { usernameOrId } = req.params;
  const creator = users.find(u => (u.username === usernameOrId || u.id === usernameOrId) && u.role === 'CREATOR');
  if (!creator) return res.status(404).json({ error: 'Criador não encontrado.' });

  const creatorReviews = reviews.filter(r => r.creatorId === creator.id && r.status === 'published');
  const creatorConversions = conversions.filter(c => c.creatorId === creator.id);

  res.json({
    creator,
    reviews: creatorReviews,
    conversionsCount: creatorConversions.length
  });
});

app.get('/api/creator/dashboard', (req, res) => {
  const authUser = getAuthUser(req);
  if (authUser.role !== 'CREATOR' && authUser.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso restrito a criadores de conteúdo.' });
  }

  const creatorId = authUser.id;
  const myReviews = reviews.filter(r => r.creatorId === creatorId);
  const myClicks = affiliateClicks.filter(c => c.creatorId === creatorId);
  const myConversions = conversions.filter(c => c.creatorId === creatorId);

  const totalViews = myReviews.reduce((acc, curr) => acc + curr.views, 0);
  const totalLikes = myReviews.reduce((acc, curr) => acc + curr.likes, 0);
  const estimatedEarnings = myConversions.reduce((acc, curr) => acc + curr.creatorCommission, 0);

  // Performance timeline mock
  const chartData = [
    { day: 'Seg', views: 820, clicks: 45, conversions: 2, earnings: 51.76 },
    { day: 'Ter', views: 1140, clicks: 68, conversions: 4, earnings: 103.52 },
    { day: 'Qua', views: 950, clicks: 52, conversions: 1, earnings: 25.88 },
    { day: 'Qui', views: 1400, clicks: 89, conversions: 5, earnings: 129.40 },
    { day: 'Sex', views: 1890, clicks: 120, conversions: 7, earnings: 181.16 },
    { day: 'Sáb', views: 2200, clicks: 145, conversions: 9, earnings: 232.92 },
    { day: 'Dom', views: 1750, clicks: 110, conversions: 6, earnings: 155.28 }
  ];

  res.json({
    user: authUser,
    metrics: {
      totalReviews: myReviews.length,
      publishedReviews: myReviews.filter(r => r.status === 'published').length,
      pendingReviews: myReviews.filter(r => r.status === 'pending').length,
      totalViews,
      totalLikes,
      totalClicks: myClicks.length,
      totalConversions: myConversions.length,
      balance: authUser.balance,
      pendingBalance: authUser.pendingBalance,
      totalEarnings: authUser.totalEarnings || estimatedEarnings
    },
    reviews: myReviews,
    recentConversions: myConversions.slice(0, 10),
    chartData
  });
});

// Request withdrawal simulation
app.post('/api/creator/withdraw', (req, res) => {
  const authUser = getAuthUser(req);
  if (authUser.role !== 'CREATOR' && authUser.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Apenas criadores podem solicitar saque.' });
  }

  const { amount } = req.body;
  const numAmount = Number(amount);

  if (numAmount < settings.minWithdrawalAmount) {
    return res.status(400).json({ error: `Valor mínimo para saque é de R$ ${settings.minWithdrawalAmount.toFixed(2)}.` });
  }

  if (numAmount > authUser.balance) {
    return res.status(400).json({ error: 'Saldo insuficiente para realizar este saque.' });
  }

  authUser.balance -= numAmount;

  notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: authUser.id,
    title: 'Solicitação de Saque Efetuada! 💸',
    message: `Seu saque de R$ ${numAmount.toFixed(2)} foi enviado para processamento PIX com sucesso.`,
    link: '/painel-criador',
    read: false,
    type: 'system',
    createdAt: new Date().toISOString()
  });

  res.json({ success: true, remainingBalance: authUser.balance });
});

// --- FAVORITES / WISHLIST ---
app.get('/api/favorites', (req, res) => {
  const authUser = getAuthUser(req);
  const userFavs = favorites.filter(f => f.userId === authUser.id);
  const populated = userFavs.map(f => ({
    ...f,
    product: products.find(p => p.id === f.productId)
  })).filter(f => f.product !== undefined);
  res.json(populated);
});

app.post('/api/favorites/toggle', (req, res) => {
  const authUser = getAuthUser(req);
  const { productId, priceAlertThreshold } = req.body;
  const index = favorites.findIndex(f => f.userId === authUser.id && f.productId === productId);
  if (index >= 0) {
    favorites.splice(index, 1);
    res.json({ success: true, isFavorite: false });
  } else {
    favorites.push({
      id: `fav_${Date.now()}`,
      userId: authUser.id,
      productId,
      priceAlertThreshold: Number(priceAlertThreshold) || undefined,
      addedAt: new Date().toISOString()
    });
    res.json({ success: true, isFavorite: true });
  }
});

// --- NOTIFICATIONS ---
app.get('/api/notifications', (req, res) => {
  const authUser = getAuthUser(req);
  const userNotifs = notifications.filter(n => n.userId === authUser.id);
  res.json(userNotifs);
});

app.post('/api/notifications/:id/read', (req, res) => {
  const authUser = getAuthUser(req);
  const notif = notifications.find(n => n.id === req.params.id && n.userId === authUser.id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

app.post('/api/notifications/read-all', (req, res) => {
  const authUser = getAuthUser(req);
  notifications.filter(n => n.userId === authUser.id).forEach(n => n.read = true);
  res.json({ success: true });
});

// --- REPORTS & MODERATION ---
app.post('/api/reports', (req, res) => {
  const authUser = getAuthUser(req);
  const { targetType, targetId, reason, details } = req.body;
  const newReport: Report = {
    id: `rep_${Date.now()}`,
    targetType,
    targetId,
    reason: reason || 'Spam',
    details: details || '',
    reportedByUserId: authUser.id,
    reportedByUserName: authUser.name,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  reports.unshift(newReport);
  res.json({ success: true, message: 'Denúncia recebida com sucesso. Nossa moderação analisará o caso.' });
});

app.get('/api/admin/reports', (req, res) => {
  const authUser = getAuthUser(req);
  if (authUser.role !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado.' });
  res.json(reports);
});

app.post('/api/admin/reports/:id/resolve', (req, res) => {
  const authUser = getAuthUser(req);
  if (authUser.role !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado.' });
  const { status } = req.body;
  const report = reports.find(r => r.id === req.params.id);
  if (report) {
    report.status = status || 'resolved';
    adminLogs.unshift({
      id: `log_${Date.now()}`,
      adminId: authUser.id,
      adminName: authUser.name,
      action: 'RESOLVE_REPORT',
      targetType: report.targetType,
      targetId: report.targetId,
      details: `Marcou denúncia ${report.id} como ${report.status}`,
      createdAt: new Date().toISOString()
    });
  }
  res.json({ success: true });
});

// --- ADMIN AUDIT LOGS & STATS ---
app.get('/api/admin/logs', (req, res) => {
  const authUser = getAuthUser(req);
  if (authUser.role !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado.' });
  res.json(adminLogs);
});

app.get('/api/admin/stats', (req, res) => {
  const authUser = getAuthUser(req);
  if (authUser.role !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado.' });

  const totalViews = products.reduce((acc, curr) => acc + curr.viewsCount, 0);
  const totalRevenue = conversions.reduce((acc, curr) => acc + curr.platformCommission + curr.creatorCommission, 0);
  const platformEarnings = conversions.reduce((acc, curr) => acc + curr.platformCommission, 0);
  const creatorPayouts = conversions.reduce((acc, curr) => acc + curr.creatorCommission, 0);

  res.json({
    totalUsers: users.length,
    totalCreators: users.filter(u => u.role === 'CREATOR').length,
    totalProducts: products.filter(p => p.status === 'active').length,
    totalReviews: reviews.length,
    pendingReviews: reviews.filter(r => r.status === 'pending').length,
    totalClicks: affiliateClicks.length,
    totalConversions: conversions.length,
    totalViews,
    totalRevenue,
    platformEarnings,
    creatorPayouts,
    openReports: reports.filter(r => r.status === 'pending').length
  });
});

// --- ADS ---
app.get('/api/ads', (req, res) => {
  res.json(adBanners.filter(a => a.active));
});

// --- PRICE ROBOT & SUPABASE API ENDPOINTS ---
app.get('/api/supabase/status', async (req, res) => {
  try {
    const status = await checkSupabaseConnection();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/price-robot/stats', async (req, res) => {
  try {
    const stats = priceRobotEngine.getStats(products.length);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/price-robot/sources', async (req, res) => {
  try {
    const sources = await priceRobotEngine.getSourcesAsync();
    res.json(sources);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/price-robot/sources/:id/toggle', async (req, res) => {
  try {
    const updated = await priceRobotEngine.toggleSourceStatusAsync(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Fonte não encontrada' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/price-robot/offers', async (req, res) => {
  try {
    const { productId } = req.query;
    if (productId && typeof productId === 'string') {
      const offers = await supabasePriceDataLayer.getOffersByProductId(productId);
      return res.json(offers);
    }
    const allOffers = await supabasePriceDataLayer.getAllOffers();
    res.json(allOffers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/price-robot/history/:productId', async (req, res) => {
  try {
    const prod = products.find(p => p.id === req.params.productId || p.slug === req.params.productId);
    if (!prod) return res.status(404).json({ error: 'Produto não encontrado' });
    const history = priceRobotEngine.getProductPriceHistory(prod);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/price-robot/analysis/:productId', async (req, res) => {
  try {
    const prod = products.find(p => p.id === req.params.productId || p.slug === req.params.productId);
    if (!prod) return res.status(404).json({ error: 'Produto não encontrado' });
    const analysis = priceRobotEngine.analyzePrice(prod);
    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/price-robot/logs', async (req, res) => {
  try {
    const logs = await priceRobotEngine.getLogsAsync();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/price-robot/scan', async (req, res) => {
  try {
    const result = await priceRobotEngine.executeScan(products);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/price-robot/scan-product/:productId', async (req, res) => {
  try {
    const prod = products.find(p => p.id === req.params.productId || p.slug === req.params.productId);
    if (!prod) return res.status(404).json({ error: 'Produto não encontrado' });
    const result = await priceRobotEngine.scanSingleProduct(prod);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), platform: settings.platformName });
});

// ==========================================
// VITE MIDDLEWARE & SERVER STARTUP
// ==========================================
export async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only start standalone listener if not in serverless runtime
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`ReviewHub server running on http://0.0.0.0:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
