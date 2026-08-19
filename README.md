# Insani Herbal Catalog

Katalog produk herbal Insani dengan halaman detail per produk, form pemesanan dengan ongkir otomatis (Biteship), dan pembayaran online (Midtrans Snap).

## Teknologi

- **React 19** + **Vite** — frontend SPA
- **React Router 7** — routing multi-halaman
- **Tailwind CSS 4** — styling
- **Supabase** — database (produk & pesanan)
- **Biteship API** — autocomplete area & tarif kurir (via Cloudflare Pages Function)
- **Midtrans Snap** — pembayaran online (via Cloudflare Pages Function)
- **Meta Pixel** — tracking PageView & Purchase events
- **Cloudflare Pages Functions** — serverless API proxy ( `/functions/api/` )

## Fitur

- Katalog produk yang diambil dari Supabase
- Halaman detail per produk dengan palet warna per produk
- Form pemesanan dengan autocomplete kecamatan, pilihan kurir, dan ongkir real-time
- Pembayaran via Midtrans Snap popup
- Halaman hasil pembayaran: `/payment/finish`, `/payment/unfinish`, `/payment/error`
- Webhook Midtrans untuk update status pembayaran di Supabase
- Meta Pixel: PageView di halaman produk, Purchase saat pembayaran berhasil

## Environment Variables

### Frontend-safe (di `.env`)
| Variable | Keterangan |
|---|---|
| `VITE_SUPABASE_URL` | URL project Supabase |
| `VITE_SUPABASE_ANON_KEY` | Anon key Supabase (public) |
| `VITE_MIDTRANS_CLIENT_KEY` | Midtrans Client Key (aman untuk browser) |
| `VITE_BITESHIP_ORIGIN_ID` | Biteship area_id gudang asal |
| `VITE_META_PIXEL_ID` | Meta/Facebook Pixel ID |

### Server-only (di Cloudflare Pages dashboard)
| Variable | Keterangan |
|---|---|
| `BITESHIP_API_KEY` | API key Biteship (rahasia) |
| `MIDTRANS_SERVER_KEY` | Midtrans Server Key (rahasia) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (bypass RLS) |

## Cloudflare Pages Functions

- `ongkir.js` — GET: autocomplete area; POST: tarif kurir
- `checkout.js` — POST: buat transaksi Midtrans Snap
- `webhook.js` — POST: notifikasi Midtrans, update status di Supabase

## Memulai

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Midtrans

Saat ini menggunakan **sandbox**. Untuk produksi:
1. Ganti URL di `functions/api/checkout.js` dan `functions/api/webhook.js` dari `sandbox.midtrans.com` ke `midtrans.com`
2. Ganti key dengan key produksi
3. Set redirect URL di dashboard Midtrans ke `/payment/finish`, `/payment/unfinish`, `/payment/error`
4. Set webhook notification URL ke `/api/webhook`
