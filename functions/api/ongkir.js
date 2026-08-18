export async function onRequestPost(context) {
  const { request, env } = context
  try {
    const body = await request.json()
    const district = String(body?.district || '').trim()
    if (!district) return Response.json({ error: 'District tujuan wajib diisi.' }, { status: 400 })
    if (!env.BITESHIP_API_KEY) return Response.json({ error: 'Konfigurasi ongkir belum tersedia.' }, { status: 503 })
    const response = await fetch('https://api.biteship.com/v1/rates/couriers', {
      method: 'POST',
      headers: { authorization: env.BITESHIP_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ origin_area_id: body.origin_area_id || env.BITESHIP_ORIGIN_AREA_ID, destination_area_id: district, couriers: body.couriers || 'jne:pos:tiki:anteraja:sicepat: lion: ninja' })
    })
    const payload = await response.json()
    if (!response.ok) return Response.json({ error: 'Tarif ongkir tidak tersedia.' }, { status: response.status })
    return Response.json({ success: true, ...payload })
  } catch {
    return Response.json({ error: 'Permintaan ongkir tidak valid.' }, { status: 400 })
  }
}
