/**
 * Cloudflare Pages Function — Midtrans Snap checkout
 * POST /api/checkout
 *
 * Server-only env vars:
 *   MIDTRANS_SERVER_KEY  — Midtrans Server Key (never exposed to browser)
 *
 * Uses sandbox URLs by default. Switch to production when going live.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const SNAP_API_URL = 'https://app.sandbox.midtrans.com/snap/v1/transactions'

export async function onRequestPost(context) {
  const { request, env } = context
  if (request.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders })
  try {
    const body = await request.json()
    const { order_id, gross_amount, customer_name, customer_email, customer_phone, item_name, quantity, unit_price } = body
    if (!order_id || !gross_amount) return new Response(JSON.stringify({ error: 'order_id and gross_amount are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    const serverKey = env.MIDTRANS_SERVER_KEY
    if (!serverKey) return new Response(JSON.stringify({ error: 'Midtrans server key not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    const auth = btoa(`${serverKey}:`)
    const payload = {
      transaction_details: { order_id, gross_amount: Math.round(gross_amount) },
      customer_details: { first_name: customer_name || 'Customer', email: customer_email || 'customer@insani.id', phone: customer_phone || '' },
      item_details: [{ id: 'herbal-product', name: (item_name || 'Herbal Product').substring(0, 50), quantity: quantity || 1, price: Math.round(unit_price || gross_amount) }],
      credit_card: { secure: true },
    }
    const res = await fetch(SNAP_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Basic ${auth}` }, body: JSON.stringify(payload) })
    if (!res.ok) { const text = await res.text(); return new Response(JSON.stringify({ error: `Midtrans API error (${res.status})`, detail: text }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }) }
    const data = await res.json()
    return new Response(JSON.stringify({ snap_token: data.token, redirect_url: data.redirect_url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }) }
}

export async function onRequestOptions() { return new Response(null, { status: 200, headers: corsHeaders }) }
