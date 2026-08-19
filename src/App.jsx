import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, Navigate, Route, Routes, useParams, useSearchParams, useLocation } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, MessageCircle, ShieldCheck, Sparkles, Loader as Loader2, Clock, Circle as XCircle, CircleCheck as CheckCircle2 } from 'lucide-react'
import { supabase } from './lib/supabase'
import { initMetaPixel, trackPageView, trackPurchase, loadMidtransSnap } from './lib/metaPixel'
import { distributors, formatPrice, globalAdvantages } from './data/dummyProducts'

const waUrl = 'https://wa.me/6281234567890'
const defaultPalette = { primary: '#183b32', secondary: '#fffdf8', accent: '#c85d3b', hex1: ['#183b32', '#2f6b58'], hex2: ['#fffdf8', '#f1e7d5'], hex3: ['#c85d3b', '#e58b63'], label1: 'Hijau Insani', label2: 'Putih hangat', label3: 'Terracotta' }
const getPalette = (palette) => ({ ...defaultPalette, ...(palette && typeof palette === 'object' ? palette : {}) })
const normalizeProduct = (product) => ({ ...product, pallet_warna: getPalette(product?.pallet_warna), pain_points: Array.isArray(product?.pain_points) && product.pain_points.length ? product.pain_points : ['Ingin pilihan herbal dengan informasi yang jelas', 'Mencari cara praktis untuk membangun kebiasaan baik', 'Membutuhkan produk yang mudah masuk ke rutinitas'], edukasi: product?.edukasi || 'Padukan produk dengan tidur cukup, makan seimbang, bergerak, dan konsultasi dengan tenaga kesehatan bila diperlukan.', komposisi: Array.isArray(product?.komposisi) ? product.komposisi : [], aturan_pakai: product?.aturan_pakai || 'Ikuti aturan pakai pada kemasan.' })
const isValidProduct = (product) => product && ['slug', 'nama_produk', 'informasi', 'indikasi', 'fungsi_utama', 'harga_utama', 'harga_diskon', 'gambar', 'komposisi', 'aturan_pakai'].every((field) => product[field] !== undefined && product[field] !== null)
const paletteStyle = (palette) => { const p = getPalette(palette); return { '--product-primary': p.primary, '--product-secondary': p.secondary, '--product-accent': p.accent, '--product-bg-gradient': `linear-gradient(135deg, ${p.hex1?.[0] || defaultPalette.hex1[0]}, ${p.hex1?.[1] || defaultPalette.hex1[1]})`, '--product-card-gradient': `linear-gradient(135deg, ${p.hex2?.[0] || defaultPalette.hex2[0]}, ${p.hex2?.[1] || defaultPalette.hex2[1]})`, '--product-accent-gradient': `linear-gradient(135deg, ${p.hex3?.[0] || defaultPalette.hex3[0]}, ${p.hex3?.[1] || defaultPalette.hex3[1]})` } }

const Section = ({ eyebrow, title, children, dark = false }) => <section className={`section ${dark ? 'section-dark' : ''}`}><div className="container"><p className="eyebrow">{eyebrow}</p><h2 className="section-title">{title}</h2>{children}</div></section>
const Header = () => <header className="site-header"><Link to="/insani" className="brand"><span className="brand-mark">I</span><span>INSANI<small>HERBAL</small></span></Link><nav><Link to="/insani">Katalog</Link><a href="#tentang">Tentang Insani</a></nav><a className="header-chat" href={waUrl} target="_blank" rel="noreferrer"><MessageCircle size={16}/> Chat kami</a></header>
const ProductBadges = () => <div className="product-badges" aria-label="Sertifikasi dan karakteristik produk"><span>Alami</span><span>BPOM</span><span>Halal</span></div>
const ProductCard = ({ product }) => <article className="product-card"><div className="product-image"><img src={product.gambar || '/fallback-herbal.svg'} alt={`Kemasan ${product.nama_produk}`} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/fallback-herbal.svg' }}/><span>Pilihan Insani</span></div><div className="product-card-body"><ProductBadges/><p className="eyebrow">{product.fungsi_utama}</p><h3>{product.nama_produk}</h3><p>{product.informasi}</p><div className="price-row"><strong>{formatPrice(product.harga_diskon)}</strong><del>{formatPrice(product.harga_utama)}</del></div><Link className="button button-dark full" to={`/insani/herbal/${product.slug}`}>Lihat produk <ArrowRight size={16}/></Link></div></article>
const DistributorTicker = () => <div className="ticker" aria-label="Wilayah distributor"><div className="ticker-track">{[...distributors, ...distributors].map((d, i) => <span key={i}><b>{d.wilayah}</b> · {d.kontak}<i>✦</i></span>)}</div></div>
const Testimonials = () => <div className="testimonial-grid"><blockquote>"Saya suka karena cara pakainya jelas dan rasanya mudah masuk ke rutinitas."<cite>— Rina, Bandung</cite></blockquote><blockquote>"Respons admin ramah, pengirimannya juga rapi. Jadi lebih tenang saat pesan."<cite>— Dimas, Jakarta</cite></blockquote><blockquote>"Bukan janji berlebihan, hanya pilihan herbal yang terasa dekat."<cite>— Nia, Surabaya</cite></blockquote></div>
const Footer = () => <footer id="tentang"><div className="container footer-inner"><div><Link to="/insani" className="brand"><span className="brand-mark">I</span><span>INSANI<small>HERBAL</small></span></Link><p>Ikhtiar baik, setiap hari.</p></div><p>© 2026 PT. Insani. Dibuat dengan perhatian.</p></div></footer>

const Catalog = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError('')
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      if (error) { setError('Gagal memuat produk. Silakan coba lagi nanti.') }
      else { setProducts(data || []) }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  return <><Header/><main><section className="catalog-hero"><div className="container catalog-grid"><div><p className="eyebrow">Racikan baik untuk hari ini</p><h1>Temani ikhtiar sehatmu, <em>dengan cara yang jujur.</em></h1><p className="lead">Produk herbal pilihan Insani hadir untuk melengkapi kebiasaan baik—bukan menggantikannya.</p><a className="button button-primary" href="#produk">Jelajahi produk <ArrowRight size={17}/></a></div><div className="hero-note"><Sparkles size={20}/><p>"Merawat diri adalah bentuk syukur yang bisa dimulai dari hal sederhana."</p><span>— Catatan Insani</span></div></div></section><section id="produk" className="section"><div className="container"><div className="section-heading"><div><p className="eyebrow">Koleksi herbal</p><h2 className="section-title">Temukan teman baikmu.</h2></div><p className="muted">Pilihan sederhana, dengan informasi yang mudah dipahami.</p></div>{loading ? <div className="loading-state"><div className="loading-spinner"/><p>Memuat produk...</p></div> : error ? <p className="form-error" role="alert">{error}</p> : <div className="product-grid-wrap"><div className="product-grid" aria-label="Daftar produk herbal">{products.filter(isValidProduct).map(p => <ProductCard key={p.slug} product={p}/>)}</div><div className="carousel-hint" aria-hidden="true"><span>Geser untuk melihat herbal lain</span><ArrowRight size={15}/></div></div>}</div></section></main><Footer/></>
}

const Detail = () => {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      if (!supabase) { setProduct(null); setLoading(false); return }
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle()
      if (error || !data || !isValidProduct(data)) { setProduct(null) }
      else { setProduct(normalizeProduct(data)); trackPageView() }
      setLoading(false)
    }
    fetchProduct()
  }, [slug])

  if (loading) return <><Header/><main className="loading-state"><div className="loading-spinner"/><p>Memuat produk...</p></main><Footer/></>
  if (!product) return <><Header/><main className="not-found" role="alert"><p className="eyebrow">404 / Produk</p><h1>Produk tidak ditemukan.</h1><p className="lead">Tautan produk mungkin sudah berubah atau datanya belum lengkap.</p><Link to="/insani" className="button button-primary">Kembali ke katalog</Link></main></>

  return <><Header/><main style={paletteStyle(product.pallet_warna)} className="product-theme"><section className="detail-hero"><div className="container detail-grid"><div><p className="eyebrow">{product.fungsi_utama}</p><h1>{product.indikasi}.</h1><p className="lead">{product.informasi}</p><div className="hero-actions"><a href="#beli" className="button button-primary">Beli sekarang <ArrowRight size={17}/></a><a href={waUrl} target="_blank" rel="noreferrer" className="button button-light"><MessageCircle size={17}/> Chat saya</a></div><ProductBadges/><small className="trust-line"><ShieldCheck size={16}/> Informasi jelas · harga transparan · tanpa janji berlebihan</small></div><div className="detail-image"><img src={product.gambar || '/fallback-herbal.svg'} alt={`Kemasan ${product.nama_produk}`} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/fallback-herbal.svg' }}/><div className="floating-price"><span>Harga hari ini</span><strong>{formatPrice(product.harga_diskon)}</strong><del>{formatPrice(product.harga_utama)}</del></div></div></div></section><Section eyebrow="01 / Kita mulai dari yang terasa" title="Mungkin ini yang sedang kamu rasakan."><div className="pain-grid">{product.pain_points.map((p, i) => <div className="pain-item" key={p}><span>0{i+1}</span><p>{p}</p></div>)}</div></Section><Section eyebrow="02 / Edukasi ringan" title="Tubuh layak didengarkan, bukan dipaksa."><div className="education"><p>{product.edukasi}</p><div className="education-note"><Sparkles size={19}/><p>Produk herbal adalah pelengkap. Kebiasaan baik tetap menjadi fondasi utama.</p></div></div></Section><Section eyebrow="03 / Cerita dari mereka" title="Dipilih karena rasanya dekat."><Testimonials/><DistributorTicker/><div className="distributor-table-wrap"><table><thead><tr><th>Wilayah utama</th><th>Kota / Kabupaten / Kecamatan</th><th>Kontak / Penerima</th><th>Nomor telepon</th></tr></thead><tbody>{distributors.map((d, i) => <tr key={i}><td>{d.wilayah}</td><td>{d.area}</td><td>{d.kontak}</td><td>{d.telepon}</td></tr>)}</tbody></table></div></Section><Section eyebrow="04 / Nilai yang kamu dapat" title="Lebih dari sekadar satu botol."><div className="comparison"><div className="comparison-row head"><span></span><b>Pilihan Insani</b><b>Pilihan biasa</b></div>{['Bahan dengan informasi jelas', 'Panduan penggunaan', 'Dukungan tim ramah', 'Harga transparan'].map((x) => <div className="comparison-row" key={x}><span>{x}</span><b><Check size={17}/></b><b className="muted-dash">—</b></div>)}</div></Section><Section eyebrow="05 / Kenali isinya" title="Kandungan yang kami pilih dengan perhatian."><div className="accordion">{product.komposisi.map((item, i) => <div className="accordion-item" key={item.nama}><button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}><span><b>0{i+1}</b>{item.nama}</span><ChevronDown size={18} className={open === i ? 'rotate' : ''}/></button>{open === i && <p>{item.detail}</p>}</div>)}</div></Section><Section eyebrow="06 / Cara menggunakan" title="Sederhana, ikuti kebutuhanmu."><div className="usage-grid"><div><p className="usage-copy">{product.aturan_pakai}</p><p className="prayer">Berdoalah sebelum minum.</p></div><div className="contra"><b>Perhatikan juga</b><p>Hentikan penggunaan bila muncul ketidaknyamanan. Konsultasikan dengan tenaga kesehatan bila sedang hamil, menyusui, memiliki kondisi khusus, atau mengonsumsi obat tertentu.</p></div></div></Section><Section eyebrow="07 / Tentang Insani" title="Kami percaya pada ikhtiar yang masuk akal." dark><div className="advantages">{globalAdvantages.map((x, i) => <div key={x}><span>0{i+1}</span><p>{x}</p></div>)}</div></Section><section id="beli" className="section buy-section"><div className="container"><p className="eyebrow">08 / Beli dengan tenang</p><h2 className="section-title">Satu langkah kecil untuk rutinitas baik.</h2><PurchaseForm product={product}/></div></section><Section eyebrow="09 / Jaminan Insani" title="Kalau tidak sesuai, kami bantu cari jalan keluarnya."><div className="guarantee"><ShieldCheck size={32}/><div><h3>Jaminan kepedulian</h3><p>Pesanan dikemas dengan rapi dan informasi disampaikan terbuka. Jika ada kendala pada pesanan, hubungi tim kami—kami akan membantu menindaklanjuti dengan ramah.</p></div></div></Section></main><Footer/></>
}

const KecamatanAutocomplete = ({ onSelect }) => {
  const [query, setQuery] = useState('')
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(false)
  const [showList, setShowList] = useState(false)
  const debounceRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowList(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = useCallback((input) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (input.trim().length < 3) { setAreas([]); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/ongkir?input=${encodeURIComponent(input)}`)
        const data = await res.json()
        if (data.areas) { setAreas(data.areas); setShowList(true) }
      } catch { setAreas([]) }
      setLoading(false)
    }, 300)
  }, [])

  const handleSelect = (area) => { setQuery(area.name); setShowList(false); onSelect(area) }

  return <div className="autocomplete-wrap" ref={wrapRef}><input type="text" value={query} onChange={(e) => { setQuery(e.target.value); search(e.target.value) }} onFocus={() => areas.length > 0 && setShowList(true)} placeholder="Ketik nama kecamatan atau kota" autoComplete="off" />{showList && <div className="autocomplete-list">{loading ? <div className="autocomplete-hint">Mencari area...</div> : areas.length === 0 ? <div className="autocomplete-hint">Tidak ada hasil. Coba kata kunci lain.</div> : areas.map((a) => <button key={a.id} type="button" onClick={() => handleSelect(a)}>{a.name}</button>)}</div>}</div>
}

const CourierSelector = ({ destinationAreaId, quantity, onSelect }) => {
  const [couriers, setCouriers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!destinationAreaId) { setCouriers([]); return }
    const fetchRates = async () => {
      setLoading(true); setError(''); setSelected(null); onSelect(null)
      try {
        const res = await fetch('/api/ongkir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ destination_area_id: destinationAreaId, weight: 300, quantity }) })
        const data = await res.json()
        if (data.error) { setError(data.error) } else { setCouriers(data.couriers || []) }
      } catch { setError('Gagal mengambil tarif kurir. Silakan coba lagi.') }
      setLoading(false)
    }
    fetchRates()
  }, [destinationAreaId, quantity, onSelect])

  if (!destinationAreaId) return null
  if (loading) return <div className="courier-section"><div className="loading-spinner"/><p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Mencari pilihan kurir...</p></div>
  if (error) return <div className="courier-section"><p className="form-error">{error}</p></div>
  if (couriers.length === 0) return null

  return <div className="courier-section"><label style={{ fontWeight: 500, fontSize: 14, marginBottom: 8, display: 'block' }}>Pilih kurir</label><div className="courier-list">{couriers.map((c, i) => <label key={i} className={`courier-option ${selected === i ? 'selected' : ''}`}><input type="radio" name="courier" value={i} onChange={() => { setSelected(i); onSelect(c) }} /><div className="courier-info"><b>{c.courier_name || c.courier} — {c.service}</b><small>{c.duration || 'Estimasi tidak tersedia'}</small></div><span className="courier-price">{formatPrice(c.price)}</span></label>)}</div></div>
}

const PurchaseForm = ({ product }) => {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedArea, setSelectedArea] = useState(null)
  const [selectedCourier, setSelectedCourier] = useState(null)

  const unitPrice = product.harga_diskon
  const subtotal = unitPrice * quantity
  const shippingCost = selectedCourier ? selectedCourier.price : 0
  const totalAmount = subtotal + shippingCost

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const data = new FormData(e.currentTarget)
    const nama = String(data.get('nama') || '').trim()
    const phone = String(data.get('wa') || '').replace(/\D/g, '')
    const alamat = String(data.get('alamat') || '').trim()

    if (!nama) { setError('Nama lengkap wajib diisi.'); return }
    if (phone.length < 10 || phone.length > 15) { setError('Masukkan nomor WhatsApp yang valid agar kami dapat menghubungi Anda.'); return }
    if (!alamat) { setError('Alamat lengkap wajib diisi.'); return }
    if (!selectedArea) { setError('Pilih kecamatan tujuan dari daftar yang muncul.'); return }
    if (!selectedCourier) { setError('Pilih kurir pengiriman terlebih dahulu.'); return }
    if (quantity < 1) { setError('Jumlah minimal 1 botol.'); return }

    setSubmitting(true)
    try {
      const orderId = `INSANI-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
      const { data: orderRow, error: insertError } = await supabase
        .from('orders')
        .insert({ order_id: orderId, customer_name: nama, customer_phone: phone, customer_address: alamat, district_id: selectedArea.id, district_name: selectedArea.name, product_id: product.id, product_slug: product.slug, product_name: product.nama_produk, quantity, unit_price: unitPrice, amount: subtotal, shipping_cost: shippingCost, shipping_courier: selectedCourier.courier_name || selectedCourier.courier, shipping_service: selectedCourier.service, total_amount: totalAmount, payment_status: 'pending' })
        .select().single()

      if (insertError) throw new Error('Gagal menyimpan pesanan. Silakan coba lagi.')

      const checkoutRes = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: orderId, gross_amount: totalAmount, customer_name: nama, customer_phone: phone, item_name: product.nama_produk, quantity, unit_price: subtotal }) })
      const checkoutData = await checkoutRes.json()
      if (checkoutData.error || !checkoutData.snap_token) throw new Error(checkoutData.error || 'Gagal membuat transaksi pembayaran.')

      await supabase.from('orders').update({ snap_token: checkoutData.snap_token }).eq('order_id', orderId)

      await loadMidtransSnap()
      if (window.snap && checkoutData.snap_token) {
        window.snap.pay(checkoutData.snap_token, {
          onSuccess: (result) => {
            if (result.transaction_status === 'settlement' || result.transaction_status === 'capture') { trackPurchase(totalAmount, 'IDR') }
            window.location.href = `/payment/finish?order_id=${orderId}&status=${result.transaction_status}`
          },
          onPending: (result) => { window.location.href = `/payment/unfinish?order_id=${orderId}&status=${result.transaction_status}` },
          onError: (result) => { window.location.href = `/payment/error?order_id=${orderId}&status=${result.transaction_status}` },
          onClose: () => { setSubmitting(false); setError('Pembayaran ditutup sebelum selesai. Anda bisa mencoba lagi.') },
        })
      } else { window.location.href = checkoutData.redirect_url }
      setSent(true)
    } catch (err) { setError(err.message || 'Terjadi kesalahan. Silakan coba lagi atau hubungi tim kami.'); setSubmitting(false) }
  }

  return <div className="purchase-layout"><form className="purchase-form" noValidate onSubmit={submit}><div className="form-heading"><p className="eyebrow">Pesan {product.nama_produk}</p><h3>Mulai dari kebutuhanmu.</h3><p className="form-helper">Isi data penerima. Total biaya akan terlihat sebelum kamu membayar.</p></div>{sent && <div className="success" role="status"><Check size={18}/> Data diterima. Lanjut ke pembayaran.</div>}{error && <p className="form-error" role="alert">{error}</p>}<label>Nama lengkap<input required name="nama" placeholder="Nama penerima"/></label><label>Nomor WhatsApp<input required name="wa" inputMode="tel" placeholder="08xx-xxxx-xxxx"/></label><label>Alamat lengkap<textarea required name="alamat" rows={3} placeholder="Jalan, nomor rumah, patokan"/></label><label>Kecamatan / Kota tujuan<KecamatanAutocomplete onSelect={setSelectedArea}/></label><CourierSelector destinationAreaId={selectedArea?.id} quantity={quantity} onSelect={setSelectedCourier} /><div className="quantity-control"><div><span className="quantity-label">Jumlah botol</span><small>Harga per botol: {formatPrice(unitPrice)}</small></div><div className="quantity-stepper"><button type="button" aria-label="Kurangi jumlah" onClick={() => setQuantity(v => Math.max(1, v - 1))}>−</button><output aria-live="polite">{quantity}</output><button type="button" aria-label="Tambah jumlah" onClick={() => setQuantity(v => Math.min(20, v + 1))}>+</button></div></div><div className="order-summary"><div><div className="summary-line"><span>Subtotal produk</span><span>{formatPrice(subtotal)}</span></div><div className="summary-line"><span>Ongkos kirim</span><span>{shippingCost > 0 ? formatPrice(shippingCost) : 'Pilih kurir'}</span></div><div className="summary-line total"><span>Total</span><span>{formatPrice(totalAmount)}</span></div></div></div><button className="button button-primary full" type="submit" disabled={submitting}>{submitting ? <><Loader2 size={17} className="animate-spin"/> Memproses...</> : <>Lanjut ke pembayaran <ArrowRight size={17}/></>}</button><p className="trust-note"><ShieldCheck size={15}/> Data digunakan hanya untuk memproses pesanan dan konfirmasi pengiriman.</p></form><div className="chat-card"><MessageCircle size={22}/><h3>Masih ingin bertanya?</h3><p>Chat terpisah dengan tim Insani untuk membantu memilih produk yang sesuai sebelum membeli.</p><a className="button button-outline full" href={waUrl} target="_blank" rel="noreferrer" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>Chat WhatsApp <ArrowRight size={16}/></a></div></div>
}

const PaymentFinish = () => {
  const [params] = useSearchParams()
  const orderId = params.get('order_id') || ''
  const status = params.get('status') || ''
  return <><Header/><main className="payment-result success"><div className="icon-wrap"><CheckCircle2 size={40}/></div><p className="eyebrow">Pembayaran</p><h1>Terima kasih, pesanan Anda berhasil!</h1><p className="lead">Pembayaran Anda{status ? ` berstatus "${status}"` : ''} telah diterima. Tim kami akan segera memproses dan menghubungi Anda untuk konfirmasi pengiriman.</p>{orderId && <p className="muted" style={{ marginTop: 16 }}>Nomor pesanan: <strong>{orderId}</strong></p>}<Link to="/insani" className="button button-primary" style={{ marginTop: 24 }}>Kembali ke katalog <ArrowRight size={17}/></Link></main><Footer/></>
}

const PaymentUnfinish = () => {
  const [params] = useSearchParams()
  const orderId = params.get('order_id') || ''
  return <><Header/><main className="payment-result pending"><div className="icon-wrap"><Clock size={40}/></div><p className="eyebrow">Pembayaran</p><h1>Pembayaran belum selesai.</h1><p className="lead">Pesanan Anda telah dibuat namun pembayaran masih menunggu. Silakan selesaikan pembayaran sesuai instruksi yang dikirim ke WhatsApp Anda.</p>{orderId && <p className="muted" style={{ marginTop: 16 }}>Nomor pesanan: <strong>{orderId}</strong></p>}<div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}><Link to="/insani" className="button button-primary">Kembali ke katalog</Link><a className="button button-outline" href={waUrl} target="_blank" rel="noreferrer"><MessageCircle size={16}/> Hubungi tim kami</a></div></main><Footer/></>
}

const PaymentError = () => {
  const [params] = useSearchParams()
  const orderId = params.get('order_id') || ''
  return <><Header/><main className="payment-result error"><div className="icon-wrap"><XCircle size={40}/></div><p className="eyebrow">Pembayaran</p><h1>Pembayaran gagal.</h1><p className="lead">Maaf, terjadi kendala saat memproses pembayaran Anda. Jangan khawatir—pesanan tetap tersimpan dan Anda dapat mencoba lagi.</p>{orderId && <p className="muted" style={{ marginTop: 16 }}>Nomor pesanan: <strong>{orderId}</strong></p>}<div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}><Link to="/insani" className="button button-primary">Kembali ke katalog</Link><a className="button button-outline" href={waUrl} target="_blank" rel="noreferrer"><MessageCircle size={16}/> Hubungi tim kami</a></div></main><Footer/></>
}

export default function App() {
  useEffect(() => { initMetaPixel() }, [])
  return <Routes>
    <Route path="/" element={<Navigate to="/insani" replace/>}/>
    <Route path="/insani" element={<Catalog/>}/>
    <Route path="/insani/herbal/:slug" element={<Detail/>}/>
    <Route path="/payment/finish" element={<PaymentFinish/>}/>
    <Route path="/payment/unfinish" element={<PaymentUnfinish/>}/>
    <Route path="/payment/error" element={<PaymentError/>}/>
    <Route path="*" element={<Navigate to="/insani" replace/>}/>
  </Routes>
}
