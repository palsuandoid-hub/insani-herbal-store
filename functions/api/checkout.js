export async function onRequestPost(context) {
  const { request, env } = context
  try {
    const order = await request.json()
    if (!order?.order_id || !order?.amount || !order?.customer_name || !order?.customer_phone) return Response.json({ error: 'Data checkout belum lengkap.' }, { status: 400 })
    if (!env.MIDTRANS_SERVER_KEY) return Response.json({ error: 'Konfigurasi pembayaran belum tersedia.' }, { status: 503 })
    const auth = btoa(`${env.MIDTRANS_SERVER_KEY}:`)
    const response = await fetch(`${env.MIDTRANS_IS_PRODUCTION === 'true' ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com'}/snap/v1/transactions`, { method: 'POST', headers: { authorization: `Basic ${auth}`, 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ transaction_details: { order_id: String(order.order_id), gross_amount: Math.round(Number(order.amount)) }, item_details: order.item_details, customer_details: { first_name: order.customer_name, phone: order.customer_phone, address: order.customer_address }, callbacks: { finish: `${new URL(request.url).origin}/payment/finish`, unfinish: `${new URL(request.url).origin}/payment/unfinish`, error: `${new URL(request.url).origin}/payment/error` } }) })
    const payload = await response.json()
    if (!response.ok) return Response.json({ error: payload?.error_messages?.[0] || 'Checkout gagal dibuat.' }, { status: response.status })
    return Response.json({ snap_token: payload.token })
  } catch { return Response.json({ error: 'Permintaan checkout tidak valid.' }, { status: 400 }) }
}
