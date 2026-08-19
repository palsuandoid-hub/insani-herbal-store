let pixelLoaded = false
let snapLoaded = false

export function initMetaPixel() {
  const pixelId = import.meta.env.VITE_META_PIXEL_ID
  if (!pixelId || pixelLoaded) return
  pixelLoaded = true

  /* eslint-disable */
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window,document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', pixelId)
  fbq('track', 'PageView')
  /* eslint-enable */
}

export function trackPageView() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView')
  }
}

export function trackPurchase(value, currency = 'IDR') {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', { value, currency })
  }
}

export function loadMidtransSnap() {
  if (snapLoaded || window.snap) return Promise.resolve()
  const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY
  const snapUrl = 'https://app.sandbox.midtrans.com/snap/v1/snap.js'
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = snapUrl
    script.async = true
    if (clientKey) script.setAttribute('data-client-key', clientKey)
    script.onload = () => { snapLoaded = true; resolve() }
    script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap.'))
    document.head.appendChild(script)
  })
}
