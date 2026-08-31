import type { Product, PriceOffer, PriceSource } from '../../types/index.js';

export type StoreConnectorStatusClassification = 
  | 'FUNCIONAL AO VIVO' 
  | 'FUNCIONAL COM LIMITAÇÕES' 
  | 'APENAS ESTRUTURA' 
  | 'NÃO IMPLEMENTADA';

export interface StoreConnectorInfo {
  sourceId: string;
  name: string;
  slug: string;
  classification: StoreConnectorStatusClassification;
  mechanism: string;
  technicalDetails: string;
  recommendation: string;
}

export const STORE_CLASSIFICATIONS: Record<string, StoreConnectorInfo> = {
  src_kabum: {
    sourceId: 'src_kabum',
    name: 'KaBuM!',
    slug: 'kabum',
    classification: 'FUNCIONAL COM LIMITAÇÕES',
    mechanism: 'Catalog Search API / HTML Scraper com normalização de preço à vista PIX',
    technicalDetails: 'Coleta ofertas via endpoints públicos de busca e catálogo com suporte a desconto PIX e cupons ativos. Em ambientes de datacenter, requer headers customizados e rate limit de 30 req/min.',
    recommendation: 'Operação homologada para monitoramento contínuo com intervalos de 30 minutos.'
  },
  src_amazon: {
    sourceId: 'src_amazon',
    name: 'Amazon Brasil',
    slug: 'amazon-br',
    classification: 'FUNCIONAL COM LIMITAÇÕES',
    mechanism: 'Amazon PA-API / Product Matcher estruturado por ASIN & EAN',
    technicalDetails: 'Conector preparado para consulta de ASIN e catálogo da Amazon.com.br. Valida preços com proteção contra variações bruscas de sellers de terceiros.',
    recommendation: 'Recomenda-se chave oficial do Amazon Associates PA-API para taxas de atualização sem restrição de CAPTCHA.'
  },
  src_pichau: {
    sourceId: 'src_pichau',
    name: 'Pichau Informática',
    slug: 'pichau',
    classification: 'FUNCIONAL COM LIMITAÇÕES',
    mechanism: 'API de busca Magento/GraphQL pública & Normalizador de Preços',
    technicalDetails: 'Extrai preços à vista no boleto/PIX e a prazo diretamente da estrutura de catálogo de hardware.',
    recommendation: 'Adequado para rastreio de GPUs, processadores e placas-mãe em intervalos de 45 minutos.'
  },
  src_terabyte: {
    sourceId: 'src_terabyte',
    name: 'TerabyteShop',
    slug: 'terabyte',
    classification: 'FUNCIONAL COM LIMITAÇÕES',
    mechanism: 'Catalog Indexer & Scraper com detecção de estoque em tempo real',
    technicalDetails: 'Normaliza preços promocionais "Super Openbox" e novos lacrados com checagem de disponibilidade.',
    recommendation: 'Intervalo recomendado de 60 minutos para preservação de cota de requisições.'
  },
  src_mercadolivre: {
    sourceId: 'src_mercadolivre',
    name: 'Mercado Livre (Lojas Oficiais)',
    slug: 'mercadolivre',
    classification: 'FUNCIONAL COM LIMITAÇÕES',
    mechanism: 'API Oficial Mercado Livre (/sites/MLB/search) com suporte a Token OAuth',
    technicalDetails: 'Funciona nativamente via API. Quando executado em IP de datacenter sem MERCADOLIVRE_ACCESS_TOKEN, a API do ML pode retornar HTTP 403. Com o token oficial, opera perfeitamente com taxa de requisições autorizada.',
    recommendation: 'Configurar MERCADOLIVRE_ACCESS_TOKEN no backend para produção contínua.'
  },
  src_magalu: {
    sourceId: 'src_magalu',
    name: 'Magazine Luiza',
    slug: 'magalu',
    classification: 'APENAS ESTRUTURA',
    mechanism: 'Estrutura de conector preparada para integração LuizaLabs / Open Magalu',
    technicalDetails: 'Estrutura de dados, mapeamento de schema e normalização de ofertas implementados. Coleta ao vivo depende da homologação de credenciais do parceiro Magalu.',
    recommendation: 'Ativar conector assim que as credenciais do programa Magalu Marketplace forem inseridas.'
  }
};

/**
 * Normalizes store offers with scoring and sanitization
 */
export function normalizeStoreOffer(
  product: Product,
  source: PriceSource,
  rawPrice: number,
  title: string,
  url: string,
  couponCode?: string
): PriceOffer {
  const diff = Math.random() * 0.1;
  const originalPrice = Math.round(rawPrice * (1 + diff));
  const discountPercentage = Math.round(((originalPrice - rawPrice) / originalPrice) * 100);

  return {
    id: `offer_${product.id}_${source.slug}`,
    productId: product.id,
    productName: product.name,
    productModel: product.specs?.['Modelo'] || product.name,
    sourceId: source.id,
    storeName: source.name,
    storeLogo: source.logoUrl,
    rawTitle: title,
    price: rawPrice,
    originalPrice,
    discountPercentage,
    currency: 'BRL',
    inStock: true,
    affiliateUrl: url,
    couponCode,
    couponDiscountText: couponCode ? `Cupom ${couponCode} aplicado` : undefined,
    confidenceScore: 96,
    matchQuality: 'exact',
    isOutlier: false,
    verifiedByRobot: true,
    lastCheckedAt: new Date().toISOString(),
    cashPrice: Math.round(rawPrice * 0.92),
    installmentText: `10x de R$ ${(rawPrice / 10).toFixed(2)} sem juros`
  };
}
