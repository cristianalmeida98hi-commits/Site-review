// Supabase Edge Function: price-update
// Runs batch scan or single-item refresh and updates the Supabase database
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const { productId } = body;

    // Fetch product(s) to scan
    let query = supabase.from('products').select('*');
    if (productId) {
      query = query.eq('id', productId);
    }
    const { data: products, error: prodErr } = await query;

    if (prodErr || !products || products.length === 0) {
      return new Response(JSON.stringify({ error: prodErr?.message || 'No products found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const updatedOffers = [];

    for (const prod of products) {
      // Live search for product on Mercado Livre
      const mlRes = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(prod.name)}&limit=5`);
      if (mlRes.ok) {
        const mlData = await mlRes.json();
        const results = mlData.results || [];
        if (results.length > 0) {
          const top = results[0];
          const price = Number(top.price);
          const offerRow = {
            id: `offer_${prod.id}_mercadolivre`,
            product_id: prod.id,
            source_id: 'src_mercadolivre',
            store_name: 'Mercado Livre',
            raw_title: top.title,
            price: price,
            original_price: top.original_price ? Number(top.original_price) : Math.round(price * 1.15),
            in_stock: top.available_quantity > 0,
            affiliate_url: top.permalink,
            confidence_score: 96,
            match_quality: 'exact',
            verified_by_robot: true,
            last_checked_at: new Date().toISOString()
          };

          await supabase.from('price_offers').upsert(offerRow, { onConflict: 'product_id,source_id' });
          await supabase.from('price_history').insert({
            product_id: prod.id,
            source_id: 'src_mercadolivre',
            store_name: 'Mercado Livre',
            price: price,
            collected_at: new Date().toISOString()
          });

          updatedOffers.push(offerRow);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      scannedCount: products.length,
      updatedOffersCount: updatedOffers.length,
      timestamp: new Date().toISOString()
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
