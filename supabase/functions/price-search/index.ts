// Supabase Edge Function: price-search
// Searches real live prices across active connectors for a specific query or product
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, productId } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: 'Query parameter is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const startTime = Date.now();
    // Live query to Mercado Livre open Brazilian retail API
    const mlResponse = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=8`, {
      headers: { 'Accept': 'application/json' }
    });

    let rawResults = [];
    if (mlResponse.ok) {
      const data = await mlResponse.json();
      rawResults = data.results || [];
    }

    const offers = rawResults.map((item: any) => ({
      sourceId: 'src_mercadolivre',
      storeName: 'Mercado Livre',
      title: item.title,
      price: Number(item.price),
      originalPrice: item.original_price ? Number(item.original_price) : undefined,
      url: item.permalink,
      thumbnail: item.thumbnail,
      inStock: item.available_quantity > 0,
      freeShipping: item.shipping?.free_shipping
    }));

    return new Response(JSON.stringify({
      success: true,
      query,
      productId,
      totalFound: offers.length,
      offers,
      durationMs: Date.now() - startTime
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
