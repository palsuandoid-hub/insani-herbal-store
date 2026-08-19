export const globalAdvantages = [
  'Diproses dengan bahan pilihan dan standar produksi yang terjaga.',
  'Informasi produk disampaikan apa adanya agar mudah dipahami.',
  'Pelayanan ramah dari tim Insani untuk menemani ikhtiar Anda.',
]

export const distributors = [
  ['ASAHAN', 'Kab. Asahan', 'Bpk. Bade B', '0853-6934-XXXX'], ['BANDUNG', 'Kota Bandung', 'Sukarno', '0813-1314-XXXX'], ['BALI', 'Prov. Bali', 'Frederique N', '0811-3983-XXXX'], ['BANJARMASIN', 'Kota Banjarmasin', 'Bpk. Ferry', '0896-3620-XXXX'], ['BANJARBARU', 'Kota Banjarbaru', 'Dr. Nabila', '0821-5513-XXXX'], ['BATAM', 'Kota Batam', 'Ir. Djufriady I', '0811-7721-XXXX'], ['BEKASI', 'Kota/Kab. Bekasi', 'Abu S', '0812-1073-XXXX'], ['BOGOR', 'Kota/Kab. Bogor', 'Sarno', '0838-7935-XXXX'], ['BOGOR', 'Kec. Jonggol (Kab. Bogor)', 'Apotik Harrison J', '0813-5075-XXXX'], ['BULUKUMBA', 'Kab. Bulukumba', 'Kaharuddin', '0853-1929-XXXX'], ['CIREBON', 'Kota/Kab. Cirebon', 'Yani M', '0812-2428-XXXX'], ['DEPOK', 'Kota Depok', 'Rumah Terapi B', '0896-8755-XXXX'], ['GORONTALO', 'Kota Gorontalo', 'Fadlun', '0852-5674-XXXX'], ['JAKARTA', 'DKI Jakarta', 'Ana F', '0812-1814-XXXX'], ['JAMBI', 'Kota Jambi', 'Nini S', '0813-6774-XXXX'], ['MAKASSAR', 'Kota Makassar', 'Nasrudin', '0852-5569-XXXX'], ['MALUKU', 'Prov. Maluku', 'Bunda A', '0823-8682-XXXX'], ['MANADO', 'Kota Manado', 'Hasniah Abdul M', '0852-4018-XXXX'], ['MEDAN', 'Kota Medan', 'Dr. M. I', '0823-7044-XXXX'], ['PADANG', 'Kota Padang', 'Trys S', '0823-8275-XXXX'], ['PEKANBARU', 'Kec. Sukajadi, Kota Pekanbaru', 'Ibu Siti F', '0812-7675-XXXX'], ['SAMARINDA', 'Kota Samarinda', 'Abu A', '0813-4737-XXXX'], ['SIDOARJO', 'Kab. Sidoarjo', 'Khalid A', '0857-5520-XXXX'], ['SURABAYA', 'Kec. Gayungan, Kota Surabaya', 'Bpk. M. A', '0878-2940-XXXX'], ['TANGERANG', 'Kec. Pamulang, Tangerang Selatan', 'Bpk. Kusturiasa', '0856-9410-XXXX'], ['TEGAL', 'Kec. Dukuh Turi, Kab. Tegal', 'Aditya M', '0822-4185-XXXX'], ['TABALOG', 'Kec. Jaro, Kab. Tabalong', 'Nurhalipa', '0882-4290-XXXX'],
].map(([wilayah, area, kontak, telepon]) => ({ wilayah, area, kontak, telepon }))

export const formatPrice = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price || 0)
