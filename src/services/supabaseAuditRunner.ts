import { supabasePriceDataLayer } from './supabasePriceDataLayer.js';
import { testSupabaseConnection, getSupabaseAdminClient, getSupabaseClient, getSupabaseConfig } from './supabaseClient.js';
import type { Product, PriceOffer, PriceRobotLog } from '../types/index.js';

interface AuditItemResult {
  step: number;
  title: string;
  passed: boolean;
  details: string;
  postgresVerified?: boolean;
}

export async function runCompleteSupabaseAudit(): Promise<{
  timestamp: string;
  config: {
    isConfigured: boolean;
    hasServiceRole: boolean;
    urlConfigured: boolean;
  };
  results: AuditItemResult[];
  allPassed: boolean;
  summary: {
    passedCount: number;
    failedCount: number;
    warnings: string[];
    filesToReview: string[];
  };
}> {
  const results: AuditItemResult[] = [];
  const warnings: string[] = [];
  const filesToReview: string[] = [];
  const testIdSuffix = `audit_${Date.now()}`;

  const config = getSupabaseConfig();
  const rawDb = getSupabaseAdminClient() || getSupabaseClient();

  // Test 1: Frontend config check (public anon key & url without exposing secrets)
  const isFrontendConfigured = Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY);
  results.push({
    step: 1,
    title: 'Conexão do frontend com o Supabase (Variáveis Públicas)',
    passed: isFrontendConfigured,
    details: isFrontendConfigured 
      ? `Configuração do frontend ativa (URL: ${process.env.VITE_SUPABASE_URL?.replace(/https?:\/\//, '').split('.')[0]}..., VITE_SUPABASE_ANON_KEY presente sem vazamento de Service Role).`
      : 'VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão definidas no ambiente do cliente.'
  });

  // Test 2: Backend connection to Supabase via testSupabaseConnection
  let backendConnOk = false;
  let backendDetails = '';
  try {
    const conn = await testSupabaseConnection();
    backendConnOk = conn.connected;
    backendDetails = `Conectado: ${conn.connected}. Resposta do Supabase: ${conn.message}`;
  } catch (err: any) {
    backendConnOk = false;
    backendDetails = `Erro de conexão backend: ${err.message}`;
  }
  results.push({
    step: 2,
    title: 'Conexão do backend Node.js com o Supabase (PostgreSQL Ping)',
    passed: backendConnOk,
    details: backendDetails
  });

  if (!rawDb || !config.isConfigured) {
    warnings.push('Supabase não está com credenciais válidas configuradas no ambiente. Execução em modo contingência.');
    return {
      timestamp: new Date().toISOString(),
      config: {
        isConfigured: config.isConfigured,
        hasServiceRole: Boolean(config.serviceRoleKey),
        urlConfigured: Boolean(config.url)
      },
      results,
      allPassed: false,
      summary: {
        passedCount: results.filter(r => r.passed).length,
        failedCount: results.filter(r => !r.passed).length,
        warnings,
        filesToReview: ['/.env.example']
      }
    };
  }

  // Test 3: Read from products table
  let test3Passed = false;
  let test3Details = '';
  try {
    const { data, error, count } = await rawDb.from('products').select('id, name', { count: 'exact' }).limit(5);
    if (error) {
      test3Details = `Erro SQL na tabela products: ${error.message}`;
    } else {
      test3Passed = true;
      test3Details = `Leitura direta bem sucedida no PostgreSQL. Total de produtos registrados: ${count || data?.length || 0}. Exemplo lido: ${data?.[0]?.name || 'Nenhum'}`;
    }
  } catch (err: any) {
    test3Details = `Exceção ao ler products: ${err.message}`;
  }
  results.push({
    step: 3,
    title: 'Leitura de produtos da tabela products no Supabase',
    passed: test3Passed,
    details: test3Details,
    postgresVerified: test3Passed
  });

  // Test 4: Insert, Verify and Delete temporary test product using normal application data layer
  let test4Passed = false;
  let test4Details = '';
  const testProduct: Product = {
    id: `prod_test_${testIdSuffix}`,
    name: `Produto Teste Auditoria ${testIdSuffix}`,
    slug: `produto-teste-auditoria-${testIdSuffix}`,
    brandId: 'brand_nvidia',
    brandName: 'NVIDIA',
    categoryId: 'cat_gpu',
    categoryName: 'Placas de Vídeo',
    description: 'Produto temporário de teste para validação de escrita e exclusão.',
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
    galleryImages: [],
    specs: { 'Interface': 'PCIe 4.0' },
    tags: ['Teste', 'Auditoria'],
    referencePrice: 1999.00,
    currentBestPrice: 1899.00,
    idealPrice: 1799.00,
    targetAudience: 'Auditoria Técnica',
    recommendationVerdict: 'RECOMENDADO',
    verdictReason: 'Validação de pipeline',
    ratingOverall: 9.0,
    communityRating: 9.0,
    creatorRating: 9.0,
    performanceScore: 9.0,
    qualityScore: 9.0,
    costBenefitScore: 9.0,
    durabilityScore: 9.0,
    reviewCount: 0,
    ratingCount: 0,
    pros: ['Teste'],
    cons: ['Temporário'],
    status: 'active',
    viewsCount: 1,
    createdAt: new Date().toISOString()
  };

  try {
    // 1. Insert via DataLayer
    await supabasePriceDataLayer.upsertProduct(testProduct);
    
    // 2. Query directly from PostgreSQL to prove it actually landed in the database
    const { data: verifyInsert, error: verifyErr } = await rawDb
      .from('products')
      .select('id, name')
      .eq('id', testProduct.id)
      .maybeSingle();

    if (verifyErr || !verifyInsert) {
      test4Details = `Falha: O registro não foi encontrado no PostgreSQL após o INSERT (${verifyErr?.message || 'não encontrado'}).`;
    } else {
      // 3. Clean up (delete temporary test record)
      await supabasePriceDataLayer.deleteProduct(testProduct.id);
      
      // Verify deletion in Postgres
      const { data: verifyDelete } = await rawDb
        .from('products')
        .select('id')
        .eq('id', testProduct.id)
        .maybeSingle();

      if (!verifyDelete) {
        test4Passed = true;
        test4Details = `INSERT validado no PostgreSQL do Supabase e devidamente excluído após o teste sem deixar resíduos.`;
      } else {
        test4Details = `INSERT funcionou, mas a remoção do registro temporário falhou.`;
      }
    }
  } catch (err: any) {
    test4Details = `Exceção no teste de produto: ${err.message}`;
  }
  results.push({
    step: 4,
    title: 'Inserção, verificação no PostgreSQL e limpeza do produto de teste',
    passed: test4Passed,
    details: test4Details,
    postgresVerified: test4Passed
  });

  // Test 5: Reading from price_offers table
  let test5Passed = false;
  let test5Details = '';
  try {
    const { data, error, count } = await rawDb.from('price_offers').select('id, store_name, price', { count: 'exact' }).limit(5);
    if (error) {
      test5Details = `Erro SQL na tabela price_offers: ${error.message}`;
    } else {
      test5Passed = true;
      test5Details = `Leitura direta de ofertas bem sucedida. Total de ofertas no banco: ${count || data?.length || 0}. Exemplo: ${data?.[0]?.store_name || 'Nenhuma'} (R$ ${data?.[0]?.price || 0})`;
    }
  } catch (err: any) {
    test5Details = `Exceção ao ler price_offers: ${err.message}`;
  }
  results.push({
    step: 5,
    title: 'Leitura das ofertas em price_offers no Supabase',
    passed: test5Passed,
    details: test5Details,
    postgresVerified: test5Passed
  });

  // Test 6: Writing and Reading price history in price_history table
  let test6Passed = false;
  let test6Details = '';
  const testHistProdId = `prod_test_hist_${testIdSuffix}`;
  try {
    // 1. Record point
    await supabasePriceDataLayer.recordPriceHistory(
      testHistProdId,
      'Produto Teste Histórico',
      1299.50,
      'Kabum!',
      'src_kabum'
    );

    // 2. Query Postgres
    const { data: histData, error: histErr } = await rawDb
      .from('price_history')
      .select('*')
      .eq('product_id', testHistProdId);

    if (histErr || !histData || histData.length === 0) {
      test6Details = `Falha ao gravar/consultar histórico no PostgreSQL: ${histErr?.message || 'Registro não encontrado'}`;
    } else {
      test6Passed = true;
      test6Details = `Histórico gravado no PostgreSQL (R$ ${histData[0].price} na ${histData[0].store_name}) e verificado com sucesso.`;
      
      // Cleanup temporary test history record
      await rawDb.from('price_history').delete().eq('product_id', testHistProdId);
    }
  } catch (err: any) {
    test6Details = `Exceção no teste de histórico: ${err.message}`;
  }
  results.push({
    step: 6,
    title: 'Gravação, leitura e limpeza de histórico em price_history',
    passed: test6Passed,
    details: test6Details,
    postgresVerified: test6Passed
  });

  // Test 7: Reading sources in price_sources table
  let test7Passed = false;
  let test7Details = '';
  try {
    const sources = await supabasePriceDataLayer.getSources();
    if (sources && sources.length > 0) {
      test7Passed = true;
      test7Details = `Fontes recuperadas com sucesso (${sources.length} lojas monitoradas: ${sources.map(s => s.name).join(', ')}).`;
    } else {
      test7Details = 'Nenhuma fonte de preço encontrada.';
    }
  } catch (err: any) {
    test7Details = `Erro ao ler price_sources: ${err.message}`;
  }
  results.push({
    step: 7,
    title: 'Leitura das fontes em price_sources',
    passed: test7Passed,
    details: test7Details,
    postgresVerified: test7Passed
  });

  // Test 8: SupabasePriceDataLayer general status and data consistency
  let test8Passed = false;
  let test8Details = '';
  try {
    const layerStatus = supabasePriceDataLayer.getStatus();
    test8Passed = layerStatus.isConfigured && layerStatus.activeProvider === 'SUPABASE_POSTGRESQL';
    test8Details = `Provedor Ativo: ${layerStatus.activeProvider}. Service Role: ${layerStatus.hasServiceRole ? 'Configurado' : 'Ausente'}. Último erro: ${layerStatus.lastError || 'Nenhum'}`;
  } catch (err: any) {
    test8Details = `Erro no SupabasePriceDataLayer: ${err.message}`;
  }
  results.push({
    step: 8,
    title: 'Funcionamento do SupabasePriceDataLayer',
    passed: test8Passed,
    details: test8Details
  });

  // Test 9: Endpoints /api/products and /api/products/:id simulation
  let test9Passed = false;
  let test9Details = '';
  try {
    const prods = await supabasePriceDataLayer.getProducts({ minPrice: 100 });
    const single = prods.length > 0 ? await supabasePriceDataLayer.getProductByIdOrSlug(prods[0].id) : null;
    test9Passed = Boolean(prods && single);
    test9Details = `Consulta de catálogo retornou ${prods.length} produtos. Busca por ID/slug (${single?.slug}) retornou com sucesso.`;
  } catch (err: any) {
    test9Details = `Erro nos métodos de rota de produtos: ${err.message}`;
  }
  results.push({
    step: 9,
    title: 'Funcionamento das rotas /api/products e /api/products/:id',
    passed: test9Passed,
    details: test9Details
  });

  // Test 10: Price robot stats and configuration
  let test10Passed = false;
  let test10Details = '';
  try {
    const stats = await supabasePriceDataLayer.getStats(5);
    test10Passed = Boolean(stats && stats.totalOffersTracked >= 0);
    test10Details = `Estatísticas do robô ativas: ${stats.totalOffersTracked} ofertas monitoradas, ${stats.activeSourcesCount} fontes ativas.`;
  } catch (err: any) {
    test10Details = `Erro nas rotas /api/price-robot/*: ${err.message}`;
  }
  results.push({
    step: 10,
    title: 'Funcionamento das rotas /api/price-robot/*',
    passed: test10Passed,
    details: test10Details
  });

  // Test 11: Robot offer persistence test in Supabase
  let test11Passed = false;
  let test11Details = '';
  const testOfferProdId = `prod_test_offer_${testIdSuffix}`;
  const testOffer: PriceOffer = {
    id: `off_test_${testIdSuffix}`,
    productId: testOfferProdId,
    productName: 'Produto Teste Oferta Robô',
    sourceId: 'src_kabum',
    storeName: 'Kabum!',
    storeLogo: '',
    rawTitle: 'Produto Teste Oferta Robô',
    price: 1549.90,
    originalPrice: 1899.00,
    discountPercentage: 18,
    currency: 'BRL',
    inStock: true,
    affiliateUrl: 'https://kabum.com.br/teste',
    confidenceScore: 98,
    matchQuality: 'exact',
    isOutlier: false,
    verifiedByRobot: true,
    lastCheckedAt: new Date().toISOString()
  };

  try {
    // 1. Save offers via DataLayer
    await supabasePriceDataLayer.saveOffers(testOfferProdId, [testOffer]);

    // 2. Query Postgres directly
    const { data: offerData, error: offerErr } = await rawDb
      .from('price_offers')
      .select('*')
      .eq('product_id', testOfferProdId);

    if (offerErr || !offerData || offerData.length === 0) {
      test11Details = `Falha ao persistir oferta no PostgreSQL: ${offerErr?.message || 'Oferta não encontrada'}`;
    } else {
      test11Passed = true;
      test11Details = `Oferta gravada e confirmada no PostgreSQL do Supabase (R$ ${offerData[0].price} em ${offerData[0].store_name}).`;
      
      // Cleanup temporary offer
      await rawDb.from('price_offers').delete().eq('product_id', testOfferProdId);
    }
  } catch (err: any) {
    test11Details = `Exceção ao persistir oferta: ${err.message}`;
  }
  results.push({
    step: 11,
    title: 'Persistência de oferta do robô em price_offers no Supabase',
    passed: test11Passed,
    details: test11Details,
    postgresVerified: test11Passed
  });

  // Test 12: Price Log recording test
  let test12Passed = false;
  let test12Details = '';
  const testLogId = `log_test_${testIdSuffix}`;
  const testLog: PriceRobotLog = {
    id: testLogId,
    executionType: 'manual',
    sourceName: 'Teste de Auditoria',
    status: 'success',
    offersFound: 1,
    durationMs: 45,
    message: 'Log de auditoria técnica para validação de escrita no PostgreSQL',
    timestamp: new Date().toISOString(),
    confidenceAverage: 99
  };

  try {
    // 1. Insert log
    await supabasePriceDataLayer.insertLog(testLog);

    // 2. Query Postgres directly
    const { data: logData, error: logErr } = await rawDb
      .from('price_logs')
      .select('*')
      .eq('id', testLogId)
      .maybeSingle();

    if (logErr || !logData) {
      test12Details = `Falha ao registrar log no PostgreSQL: ${logErr?.message || 'Log não encontrado'}`;
    } else {
      test12Passed = true;
      test12Details = `Log registrado com sucesso no PostgreSQL (ID: ${logData.id}, Status: ${logData.status}).`;

      // Cleanup test log
      await rawDb.from('price_logs').delete().eq('id', testLogId);
    }
  } catch (err: any) {
    test12Details = `Exceção ao registrar log: ${err.message}`;
  }
  results.push({
    step: 12,
    title: 'Registro de price_log no Supabase',
    passed: test12Passed,
    details: test12Details,
    postgresVerified: test12Passed
  });

  // Test 13: Price history update and analysis calculation
  let test13Passed = false;
  let test13Details = '';
  try {
    const dummyProduct: Product = {
      id: 'prod_rtx4060',
      name: 'NVIDIA GeForce RTX 4060 8GB',
      slug: 'rtx-4060',
      brandId: 'brand_nvidia',
      brandName: 'NVIDIA',
      categoryId: 'cat_gpu',
      categoryName: 'Placas de Vídeo',
      description: '',
      imageUrl: '',
      galleryImages: [],
      specs: {},
      tags: [],
      referencePrice: 2199,
      currentBestPrice: 1849,
      idealPrice: 1799,
      targetAudience: 'Gamers 1080p',
      recommendationVerdict: 'RECOMENDADO',
      verdictReason: 'Excelente eficiência',
      ratingOverall: 8.7,
      communityRating: 8.6,
      creatorRating: 8.8,
      performanceScore: 8.5,
      qualityScore: 9.0,
      costBenefitScore: 8.6,
      durabilityScore: 8.8,
      reviewCount: 14,
      ratingCount: 86,
      pros: [],
      cons: [],
      status: 'active',
      viewsCount: 100,
      createdAt: new Date().toISOString()
    };

    const history = await supabasePriceDataLayer.getProductPriceHistory(dummyProduct);
    if (history && history.history && history.history.length > 0) {
      test13Passed = true;
      test13Details = `Histórico analisado com sucesso: Menor preço histórico R$ ${history.lowest90Days}, Média de 90 dias R$ ${history.average90Days}, Tendência calculada: ${history.priceTrend}.`;
    } else {
      test13Details = 'Histórico vazio ou não processado.';
    }
  } catch (err: any) {
    test13Details = `Erro ao calcular histórico: ${err.message}`;
  }
  results.push({
    step: 13,
    title: 'Atualização e análise correta do histórico de preços',
    passed: test13Passed,
    details: test13Details
  });

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  return {
    timestamp: new Date().toISOString(),
    config: {
      isConfigured: config.isConfigured,
      hasServiceRole: Boolean(config.serviceRoleKey),
      urlConfigured: Boolean(config.url)
    },
    results,
    allPassed: failedCount === 0,
    summary: {
      passedCount,
      failedCount,
      warnings,
      filesToReview
    }
  };
}
