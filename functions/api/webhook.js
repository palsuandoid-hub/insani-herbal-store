export async function onRequestPost(context) {
  const { request, env } = context
  try {
    const notification = await request.json()
    const signature = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(`${notification.order_id}${notification.status_code}${notification.gross_amount}${env.MIDTRANS_SERVER_KEY}`))
    const expected = [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
    if (expected !== notification.signature_key) return Response.json({ error: 'Signature tidak valid.' }, { status: 401 })
    const status = notification.transaction_status === 'settlement' ? 'paid' : notification.transaction_status === 'expire' ? 'expired' : notification.transaction_status === 'cancel' ? 'cancelled' : 'pending'
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/orders?order_id=eq.${encodeURIComponent(notification.order_id)}`, { method: 'PATCH', headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'content-type': 'application/json', prefer: 'return=minimal' }, body: JSON.stringify({ payment_status: status, payment_reference: notification.transaction_id }) })
    if (!response.ok) return Response.json({ error: 'Status order gagal diperbarui.' }, { status: 502 })
    return Response.json({ received: true })
  } catch { return Response.json({ error: 'Webhook tidak valid.' }, { status: 400 }) }
}
