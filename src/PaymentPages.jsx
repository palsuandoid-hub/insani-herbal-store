import { Link, useLocation } from 'react-router-dom'

export function PaymentPage({ type }) {
  const { search } = useLocation()
  const copy = { finish: ['Pembayaran diterima', 'Terima kasih. Pesananmu sedang kami siapkan.'], unfinish: ['Pembayaran belum selesai', 'Pesananmu masih menunggu pembayaran. Kamu dapat melanjutkan kembali dari halaman checkout.'], error: ['Pembayaran belum berhasil', 'Terjadi kendala saat memproses pembayaran. Silakan coba lagi atau hubungi kami.'] }[type]
  return <main className="payment-page"><p className="eyebrow">Status pembayaran</p><h1>{copy[0]}</h1><p className="lead">{copy[1]}</p><p className="payment-reference">{search ? 'Detail transaksi diterima oleh sistem.' : 'Simpan halaman ini untuk referensi.'}</p><Link className="button button-primary" to="/insani">Kembali ke katalog</Link></main>
}
