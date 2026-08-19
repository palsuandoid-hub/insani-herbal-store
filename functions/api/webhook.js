/**
 * Cloudflare Pages Function — Midtrans webhook handler
 * POST /api/webhook
 *
 * Server-only env vars:
 *   MIDTRANS_SERVER_KEY       — Midtrans Server Key (for verifying notifications)
 *   SUPABASE_URL              — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY  — Supabase service role key (bypasses RLS)
 *
 * Uses sandbox URLs by default. Switch to production when going live.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const STATUS_API_BASE = 'https://api.sandbox.midtrans.com/v2'

export async function onRequestPost(context) {
  const { request, env } = context
  if (request.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders })
  try {
    const body = await request.json()
    const { order_id, transaction_status, fraud_status } = body
    if (!order_id) return new Response(JSON.stringify({ error: 'order_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    const serverKey = env.MIDTRANS_SERVER_KEY
    if (!serverKey) return new Response(JSON.stringify({ error: 'Midtrans server key not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    const auth = btoa(`${serverKey}:`)
    const statusRes = await fetch(`${STATUS_API_BASE}/${order_id}/status`, { headers: { Accept: 'application/json', Authorization: `Basic ${auth}` } })
    if (!statusRes.ok) { const text = await statusRes.text(); return new Response(JSON.stringify({ error: `Midtrans status check failed (${statusRes.status})`, detail: text }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }) }
    const statusData = await statusRes.json()
    const verifiedStatus = statusData.transaction_status || transaction_status
    const verifiedFraud = statusData.fraud_status || fraud_status

    let paymentStatus = 'pending'
    if (verifiedStatus === 'settlement' || verifiedStatus === 'capture') {
      if (verifiedFraud && verifiedFraud !== 'accept') { paymentStatus = 'deny' } else { paymentStatus = 'settlement' }
    } else if (verifiedStatus === 'deny') { paymentStatus = 'deny' }
    else if (verifiedStatus === 'cancel') { paymentStatus = 'cancel' }
    else if (verifiedStatus === 'expire') { paymentStatus = 'expire' }
    else if (verifiedStatus === 'pending') { paymentStatus = 'pending' }

    const supabaseUrl = env.SUPABASE_URL
    const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) return new Response(JSON.stringify({ error: 'Supabase service role key not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const updateRes = await fetch(`${supabaseUrl}/rest/v1/orders?order_id=eq.${encodeURIComponent(order_id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, Prefer: 'return=minimal' },
      body: JSON.stringify({ payment_status: paymentStatus }),
    })
    if (!updateRes.ok) { const text = await updateRes.text(); return new Response(JSON.stringify({ error: `Supabase update failed (${updateRes.status})`, detail: text }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }) }

    return new Response(JSON.stringify({ success: true, order_id, payment_status: paymentStatus }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }) }
}

export async function onRequestOptions() { return new Response(null, { status: 200, headers: corsHeaders }) }
