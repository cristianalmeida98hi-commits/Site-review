import type { 
  User, Product, Category, Brand, Store, Offer, Review, UserRating, 
  Comment, Favorite, Notification, Conversion, AffiliateClick, Report, 
  AdminLog, AdBanner, PlatformSettings 
} from '../types/index.js';

export const initialSettings: PlatformSettings = {
  platformName: 'C-REVIEW',
  platformLogoText: 'C-REVIEW',
  creatorCommissionRate: 40,
  platformCommissionRate: 60,
  minWithdrawalAmount: 50,
  autoApproveVerifiedCreators: false,
  featuredNotice: 'Explore comparativos técnicos, vereditos de bancada e o robô de monitoramento de preços.'
};

export const initialUsers: User[] = [
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
    email: 'lucas@hardwarereviews.com',
    username: 'lucashardware',
    role: 'CREATOR',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    bio: 'Focado em comparativos de custo-benefício e testes de longevidade de componentes.',
    creatorLevel: 'Especialista',
    reputationScore: 89,
    badges: ['⚡ Especialista', '📊 Testador Rigoroso', '🎯 98% Precisão'],
    balance: 520.00,
    pendingBalance: 140.00,
    totalEarnings: 2180.00,
    youtubeChannelUrl: 'https://youtube.com/@lucashardware',
    createdAt: '2025-02-15T15:30:00Z'
  },
  {
    id: 'creator_camila',
    name: 'Camila Tech Review',
    email: 'camila@techreview.com',
    username: 'camilatech',
    role: 'CREATOR',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Reviews de periféricos, teclados mecânicos custom e monitores para produtividade e games.',
    creatorLevel: 'Prata',
    reputationScore: 78,
    badges: ['🎨 Design & Setup', '⌨️ Teclados Custom'],
    balance: 310.00,
    pendingBalance: 95.00,
    totalEarnings: 980.00,
    youtubeChannelUrl: 'https://youtube.com/@camilatech',
    createdAt: '2025-03-01T09:00:00Z'
  },
  {
    id: 'user_gamer',
    name: 'Rodrigo Gamer',
    email: 'rodrigo@gamerbrasil.com',
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

export const initialCategories: Category[] = [
  { id: 'cat_gpu', name: 'Placas de Vídeo', slug: 'placas-de-video', iconName: 'Cpu', description: 'GPUs para jogos, renderização e inteligência artificial', productCount: 2 },
  { id: 'cat_cpu', name: 'Processadores', slug: 'processadores', iconName: 'Zap', description: 'CPUs AMD e Intel para alto desempenho em jogos e produtividade', productCount: 2 },
  { id: 'cat_storage', name: 'Armazenamento & SSD', slug: 'armazenamento-ssd', iconName: 'HardDrive', description: 'SSDs NVMe, SATA e unidades de alta velocidade', productCount: 1 },
  { id: 'cat_monitors', name: 'Monitores', slug: 'monitores', iconName: 'Monitor', description: 'Monitores gamer, alta taxa de atualização e painéis IPS/OLED', productCount: 1 },
  { id: 'cat_peripherals', name: 'Periféricos', slug: 'perifericos', iconName: 'Keyboard', description: 'Teclados mecânicos, mouses precisos e headsets', productCount: 2 },
  { id: 'cat_smartphones', name: 'Smartphones', slug: 'smartphones', iconName: 'Smartphone', description: 'Celulares topo de linha e intermediários premium', productCount: 2 }
];

export const initialBrands: Brand[] = [
  { id: 'brand_nvidia', name: 'NVIDIA', slug: 'nvidia', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg', description: 'Líder global em processamento gráfico e inteligência artificial', websiteUrl: 'https://nvidia.com', status: 'active' },
  { id: 'brand_amd', name: 'AMD', slug: 'amd', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/AMD_Logo.svg', description: 'Pioneira em CPUs Ryzen e GPUs Radeon de alto custo-benefício', websiteUrl: 'https://amd.com', status: 'active' },
  { id: 'brand_kingston', name: 'Kingston', slug: 'kingston', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Kingston_Technology_logo.svg', description: 'Líder mundial em memórias RAM e SSDs de alto rendimento', websiteUrl: 'https://kingston.com', status: 'active' },
  { id: 'brand_lg', name: 'LG Electronics', slug: 'lg', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_logo_%282015%29.svg', description: 'Referência em painéis de display, TVs e monitores gamer UltraGear', websiteUrl: 'https://lg.com', status: 'active' },
  { id: 'brand_akko', name: 'Akko', slug: 'akko', logoUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&auto=format&fit=crop&q=80', description: 'Especialista em teclados mecânicos custom e switches de precisão', websiteUrl: 'https://akkogear.com', status: 'active' },
  { id: 'brand_samsung', name: 'Samsung', slug: 'samsung', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', description: 'Inovação em tecnologia móvel, chips e telas AMOLED', websiteUrl: 'https://samsung.com', status: 'active' },
  { id: 'brand_apple', name: 'Apple', slug: 'apple', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', description: 'Ecossistema premium com processadores Bionic e design refinado', websiteUrl: 'https://apple.com', status: 'active' },
  { id: 'brand_hyperx', name: 'HyperX', slug: 'hyperx', logoUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100&auto=format&fit=crop&q=80', description: 'Áudio espacial e equipamentos gamer profissionais', websiteUrl: 'https://hyperx.com', status: 'active' }
];

export const initialStores: Store[] = [
  { id: 'store_kabum', name: 'KaBuM!', slug: 'kabum', logoUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80', websiteUrl: 'https://kabum.com.br', defaultCommissionPercentage: 3.5, status: 'active' },
  { id: 'store_amazon', name: 'Amazon Brasil', slug: 'amazon', logoUrl: 'https://images.unsplash.com/photo-1523474253246-72fb9c27030d?w=100&auto=format&fit=crop&q=80', websiteUrl: 'https://amazon.com.br', defaultCommissionPercentage: 4.0, status: 'active' },
  { id: 'store_pichau', name: 'Pichau Informática', slug: 'pichau', logoUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80', websiteUrl: 'https://pichau.com.br', defaultCommissionPercentage: 3.0, status: 'active' },
  { id: 'store_terabyte', name: 'TerabyteShop', slug: 'terabyte', logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&auto=format&fit=crop&q=80', websiteUrl: 'https://terabyteshop.com.br', defaultCommissionPercentage: 3.2, status: 'active' },
  { id: 'store_ml', name: 'Mercado Livre', slug: 'mercado-livre', logoUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&auto=format&fit=crop&q=80', websiteUrl: 'https://mercadolivre.com.br', defaultCommissionPercentage: 4.5, status: 'active' }
];

export const initialProducts: Product[] = [
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

export const initialOffers: Offer[] = [
  // RTX 4060
  { id: 'off_4060_kabum', productId: 'prod_rtx4060', storeId: 'store_kabum', storeName: 'KaBuM!', storeLogo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80', price: 1849.00, originalPrice: 2199.00, discountPercentage: 16, affiliateUrl: 'https://kabum.com.br/produto/rtx4060?af=reviewhub', inStock: true, lastUpdated: 'Há 20 minutos', isSponsored: true, couponCode: 'TECH100' },
  { id: 'off_4060_amazon', productId: 'prod_rtx4060', storeId: 'store_amazon', storeName: 'Amazon Brasil', storeLogo: 'https://images.unsplash.com/photo-1523474253246-72fb9c27030d?w=100&auto=format&fit=crop&q=80', price: 1899.90, originalPrice: 2199.00, discountPercentage: 14, affiliateUrl: 'https://amazon.com.br/dp/rtx4060?tag=reviewhub-20', inStock: true, lastUpdated: 'Há 1 hora' },
  { id: 'off_4060_terabyte', productId: 'prod_rtx4060', storeId: 'store_terabyte', storeName: 'TerabyteShop', storeLogo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&auto=format&fit=crop&q=80', price: 1879.00, originalPrice: 2149.00, discountPercentage: 12, affiliateUrl: 'https://terabyteshop.com.br/rtx4060?p=reviewhub', inStock: true, lastUpdated: 'Há 3 horas' },
  { id: 'off_4060_pichau', productId: 'prod_rtx4060', storeId: 'store_pichau', storeName: 'Pichau', storeLogo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80', price: 1869.00, originalPrice: 2189.00, discountPercentage: 15, affiliateUrl: 'https://pichau.com.br/rtx4060?af=rhub', inStock: true, lastUpdated: 'Há 4 horas' },

  // RX 7600
  { id: 'off_7600_kabum', productId: 'prod_rx7600', storeId: 'store_kabum', storeName: 'KaBuM!', storeLogo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80', price: 1599.00, originalPrice: 1999.00, discountPercentage: 20, affiliateUrl: 'https://kabum.com.br/produto/rx7600?af=reviewhub', inStock: true, lastUpdated: 'Há 30 minutos', couponCode: 'AMDPROMO' },
  { id: 'off_7600_terabyte', productId: 'prod_rx7600', storeId: 'store_terabyte', storeName: 'TerabyteShop', storeLogo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&auto=format&fit=crop&q=80', price: 1629.00, originalPrice: 1949.00, discountPercentage: 16, affiliateUrl: 'https://terabyteshop.com.br/rx7600?p=reviewhub', inStock: true, lastUpdated: 'Há 2 horas' },

  // Ryzen 7 5700X
  { id: 'off_5700x_amazon', productId: 'prod_ryzen5700x', storeId: 'store_amazon', storeName: 'Amazon Brasil', storeLogo: 'https://images.unsplash.com/photo-1523474253246-72fb9c27030d?w=100&auto=format&fit=crop&q=80', price: 1149.00, originalPrice: 1399.00, discountPercentage: 18, affiliateUrl: 'https://amazon.com.br/dp/ryzen5700x?tag=reviewhub-20', inStock: true, lastUpdated: 'Há 15 minutos' },
  { id: 'off_5700x_kabum', productId: 'prod_ryzen5700x', storeId: 'store_kabum', storeName: 'KaBuM!', storeLogo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80', price: 1169.00, originalPrice: 1399.00, discountPercentage: 16, affiliateUrl: 'https://kabum.com.br/produto/ryzen5700x?af=reviewhub', inStock: true, lastUpdated: 'Há 1 hora' },

  // Ryzen 5 5600
  { id: 'off_5600_kabum', productId: 'prod_ryzen5600', storeId: 'store_kabum', storeName: 'KaBuM!', storeLogo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80', price: 779.00, originalPrice: 949.00, discountPercentage: 18, affiliateUrl: 'https://kabum.com.br/produto/ryzen5600?af=reviewhub', inStock: true, lastUpdated: 'Há 10 minutos' },
  { id: 'off_5600_terabyte', productId: 'prod_ryzen5600', storeId: 'store_terabyte', storeName: 'TerabyteShop', storeLogo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&auto=format&fit=crop&q=80', price: 789.00, originalPrice: 949.00, discountPercentage: 17, affiliateUrl: 'https://terabyteshop.com.br/ryzen5600?p=reviewhub', inStock: true, lastUpdated: 'Há 50 minutos' },

  // KC3000
  { id: 'off_kc3000_amazon', productId: 'prod_kc3000', storeId: 'store_amazon', storeName: 'Amazon Brasil', storeLogo: 'https://images.unsplash.com/photo-1523474253246-72fb9c27030d?w=100&auto=format&fit=crop&q=80', price: 589.00, originalPrice: 749.00, discountPercentage: 21, affiliateUrl: 'https://amazon.com.br/dp/kc3000?tag=reviewhub-20', inStock: true, lastUpdated: 'Há 45 minutos' },

  // LG UltraGear
  { id: 'off_lg_kabum', productId: 'prod_ultragear24', storeId: 'store_kabum', storeName: 'KaBuM!', storeLogo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80', price: 879.00, originalPrice: 1099.00, discountPercentage: 20, affiliateUrl: 'https://kabum.com.br/produto/lg-ultragear?af=reviewhub', inStock: true, lastUpdated: 'Há 1 hora' },

  // Galaxy S25
  { id: 'off_s25_ml', productId: 'prod_galaxys25', storeId: 'store_ml', storeName: 'Mercado Livre', storeLogo: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&auto=format&fit=crop&q=80', price: 4699.00, originalPrice: 5999.00, discountPercentage: 22, affiliateUrl: 'https://mercadolivre.com.br/samsung-s25?af=rhub', inStock: true, lastUpdated: 'Há 2 horas' },

  // iPhone 15
  { id: 'off_ip15_amazon', productId: 'prod_iphone15', storeId: 'store_amazon', storeName: 'Amazon Brasil', storeLogo: 'https://images.unsplash.com/photo-1523474253246-72fb9c27030d?w=100&auto=format&fit=crop&q=80', price: 4299.00, originalPrice: 5299.00, discountPercentage: 19, affiliateUrl: 'https://amazon.com.br/dp/iphone15?tag=reviewhub-20', inStock: true, lastUpdated: 'Há 35 minutos' },

  // Akko 3084B
  { id: 'off_akko_amazon', productId: 'prod_akko3084', storeId: 'store_amazon', storeName: 'Amazon Brasil', storeLogo: 'https://images.unsplash.com/photo-1523474253246-72fb9c27030d?w=100&auto=format&fit=crop&q=80', price: 419.00, originalPrice: 549.00, discountPercentage: 24, affiliateUrl: 'https://amazon.com.br/dp/akko3084b?tag=reviewhub-20', inStock: true, lastUpdated: 'Há 3 horas' },

  // HyperX Cloud II
  { id: 'off_hyperx_kabum', productId: 'prod_cloud2wireless', storeId: 'store_kabum', storeName: 'KaBuM!', storeLogo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80', price: 679.00, originalPrice: 899.00, discountPercentage: 24, affiliateUrl: 'https://kabum.com.br/produto/hyperx-cloud-2-wireless?af=reviewhub', inStock: true, lastUpdated: 'Há 1 hora' }
];

export const initialReviews: Review[] = [
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

export const initialUserRatings: UserRating[] = [
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

export const initialComments: Comment[] = [
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

export const initialFavorites: Favorite[] = [
  { id: 'fav_1', userId: 'user_gamer', productId: 'prod_rtx4060', addedAt: '2025-02-01T10:00:00Z', priceAlertThreshold: 1800 }
];

export const initialNotifications: Notification[] = [
  { id: 'notif_1', userId: 'creator_joao', title: 'Comissão Registrada!', message: 'Você recebeu R$ 25,88 de comissão pela compra de uma RTX 4060 via KaBuM!', link: '/painel-criador', read: false, type: 'commission', createdAt: '2025-02-15T10:00:00Z' },
  { id: 'notif_2', userId: 'creator_joao', title: 'Review Aprovado', message: 'Seu review "RTX 4060 em 2025" foi aprovado pela moderação e está público.', link: '/review/rtx-4060', read: true, type: 'review_approved', createdAt: '2025-01-25T14:05:00Z' }
];

export const initialAffiliateClicks: AffiliateClick[] = [
  { id: 'click_1', productId: 'prod_rtx4060', productName: 'NVIDIA GeForce RTX 4060 8GB', offerId: 'off_4060_kabum', creatorId: 'creator_joao', creatorName: 'João Tech', storeName: 'KaBuM!', createdAt: '2025-02-15T09:30:00Z' },
  { id: 'click_2', productId: 'prod_rx7600', productName: 'AMD Radeon RX 7600 8GB', offerId: 'off_7600_kabum', creatorId: 'creator_lucas', creatorName: 'Lucas Hardware', storeName: 'KaBuM!', createdAt: '2025-02-15T11:20:00Z' }
];

export const initialConversions: Conversion[] = [
  { id: 'conv_1', clickId: 'click_1', productId: 'prod_rtx4060', productName: 'NVIDIA GeForce RTX 4060 8GB', creatorId: 'creator_joao', creatorName: 'João Tech', storeName: 'KaBuM!', saleAmount: 1849.00, platformCommission: 38.83, creatorCommission: 25.88, status: 'confirmed', createdAt: '2025-02-15T10:00:00Z' }
];

export const initialAdminLogs: AdminLog[] = [
  { id: 'log_1', adminId: 'user_admin', adminName: 'Carlos Admin', action: 'CREATE_PRODUCT', targetType: 'Product', targetId: 'prod_rtx4060', details: 'Cadastrou o produto NVIDIA GeForce RTX 4060', createdAt: '2025-01-20T10:00:00Z' },
  { id: 'log_2', adminId: 'user_admin', adminName: 'Carlos Admin', action: 'APPROVE_REVIEW', targetType: 'Review', targetId: 'rev_4060_joao', details: 'Aprovou review publicado pelo criador João Tech', createdAt: '2025-01-25T14:05:00Z' }
];

export const initialAdBanners: AdBanner[] = [
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
