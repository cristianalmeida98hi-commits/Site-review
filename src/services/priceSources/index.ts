export * from './types.js';
export * from './mercadolivreConnector.js';
export * from './storeConnectors.js';

import { mercadoLivreConnector } from './mercadolivreConnector.js';
import { kabumConnector, amazonConnector, pichauConnector, terabyteConnector, magaluConnector } from './storeConnectors.js';
import type { PriceSourceConnector } from './types.js';

export const ALL_PRICE_CONNECTORS: Record<string, PriceSourceConnector> = {
  'mercadolivre': mercadoLivreConnector,
  'src_mercadolivre': mercadoLivreConnector,
  'kabum': kabumConnector,
  'src_kabum': kabumConnector,
  'amazon-br': amazonConnector,
  'src_amazon': amazonConnector,
  'pichau': pichauConnector,
  'src_pichau': pichauConnector,
  'terabyte': terabyteConnector,
  'src_terabyte': terabyteConnector,
  'magalu': magaluConnector,
  'src_magalu': magaluConnector,
};
