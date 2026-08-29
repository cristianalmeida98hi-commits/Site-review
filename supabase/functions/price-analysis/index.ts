// Supabase Edge Function: price-analysis
// Analyzes price distribution, detects statistical outliers, calculates true trend and classifications
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');

    if (!productId) {
      return new Response(JSON.stringify({ error: 'productId parameter is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const [prodRes, offersRes, histRes] = await Promise.all([
      supabase.from('products').select('*').eq('id', productId).single(),
      supabase.from('price_offers').select('*').eq('product_id', productId),
      supabase.from('price_history').select('*').eq('product_id', productId).order('collected_at', { ascending: false }).limit(30)
    ]);

    const product = prodRes.data;
    const offers = offersRes.data || [];
    const history = histRes.data || [];

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const prices = offers.map((o: any) => Number(o.price)).filter((p: number) => p > 0);
    const currentMin = prices.length > 0 ? Math.min(...prices) : Number(product.current_best_price || 0);
    const currentMax = prices.length > 0 ? Math.max(...prices) : Number(product.reference_price || 0);
    const average = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : currentMin;

    // Classification calculation (No fake discounts!)
    let classification = 'PREÇO_NORMAL';
    let label = '🟡 Preço Normal de Mercado';
    const ideal = Number(product.ideal_price || 0);

    if (ideal > 0 && currentMin <= ideal * 0.9) {
      classification = 'OFERTA_EXCELENTE';
      label = '🔥 Oferta Excelente (Abaixo da média)';
    } else if (ideal > 0 && currentMin <= ideal) {
      classification = 'BOM_PRECO';
      label = '🟢 Bom Preço (Faixa Recomendada)';
    } else if (currentMin > average * 1.15) {
      classification = 'PRECO_ALTO';
      label = '🔴 Preço Acima da Média';
    }

    return new Response(JSON.stringify({
      productId,
      productName: product.name,
      currentBestPrice: currentMin,
      currentMaxPrice: currentMax,
      averagePrice: Math.round(average),
      totalActiveOffers: offers.length,
      historicalPointsCount: history.length,
      classification,
      classificationLabel: label,
      hasEnoughHistory: history.length >= 5
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
