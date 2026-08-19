/**
 * Cloudflare Pages Function — Biteship proxy
 * GET  /api/ongkir?input=...  → area autocomplete (Maps API)
 * POST /api/ongkir            → courier rates calculator
 *
 * Server-only env vars:
 *   BITESHIP_API_KEY         — Biteship API key (never exposed to browser)
 *   VITE_BITESHIP_ORIGIN_ID  — origin area_id for the warehouse
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const BITESHIP_BASE = 'https://api.biteship.com/v1'

export async function onRequestGet(context) {
  const { request, env } = context
  if (request.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders })
  try {
    const url = new URL(request.url)
    const input = url.searchParams.get('input')
    if (!input || input.trim().length < 3) return new Response(JSON.stringify({ areas: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    const apiKey = env.BITESHIP_API_KEY
    if (!apiKey) return new Response(JSON.stringify({ error: 'Biteship API key not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    const apiUrl = `${BITESHIP_BASE}/maps/areas?countries=ID&input=${encodeURIComponent(input)}&type=single`
    const res = await fetch(apiUrl, { headers: { Authorization: apiKey } })
    if (!res.ok) { const text = await res.text(); return new Response(JSON.stringify({ error: `Biteship API error (${res.status})`, detail: text }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }) }
    const data = await res.json()
    const areas = (data.areas || []).map((a) => ({ id: a.id, name: a.name, province: a.administrative_division_level_1_name, city: a.administrative_division_level_2_name, district: a.administrative_division_level_3_name, postal_code: a.postal_code }))
    return new Response(JSON.stringify({ areas }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }) }
}

export async function onRequestPost(context) {
  const { request, env } = context
  if (request.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders })
  try {
    const body = await request.json()
    const { destination_area_id, weight, quantity } = body
    if (!destination_area_id) return new Response(JSON.stringify({ error: 'destination_area_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    const apiKey = env.BITESHIP_API_KEY
    const originAreaId = env.VITE_BITESHIP_ORIGIN_ID
    if (!apiKey) return new Response(JSON.stringify({ error: 'Biteship API key not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    if (!originAreaId) return new Response(JSON.stringify({ error: 'Origin area ID not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    const itemWeight = weight || 300
    const itemQty = quantity || 1
    const totalWeight = itemWeight * itemQty
    const res = await fetch(`${BITESHIP_BASE}/rates/couriers`, {
      method: 'POST',
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin_area_id: originAreaId, destination_area_id: destination_area_id, couriers: 'jne,jnt,sicepat,anteraja,ide,pos,ninja,tiki', items: [{ name: 'Herbal Product', description: 'Insani Herbal', value: 100000, length: 15, width: 10, height: 10, weight: totalWeight, quantity: 1 }] }),
    })
    if (!res.ok) { const text = await res.text(); return new Response(JSON.stringify({ error: `Biteship API error (${res.status})`, detail: text }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }) }
    const data = await res.json()
    const couriers = (data.pricing || []).map((c) => ({ courier: c.courier, courier_name: c.courier_name, service: c.service, service_code: c.service_code, price: c.price, duration: c.duration, type: c.type }))
    return new Response(JSON.stringify({ couriers }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }) }
}

export async function onRequestOptions() { return new Response(null, { status: 200, headers: corsHeaders }) }
