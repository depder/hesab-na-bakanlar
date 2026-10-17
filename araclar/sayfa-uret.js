#!/usr/bin/env node
/* Başkent İş Makinaları — statik sayfa üreteci (bağımlılık yok; Node 18+).
 *
 *   node araclar/sayfa-uret.js
 *
 * kaynak/sayfalar/*.html içeriklerini ortak üst bilgi, menü, alt bilgi ve ikonlarla birleştirip kök klasöre
 * index.html, hizmetler.html, surec.html, is-emri.html, iletisim.html ve kvkk.html olarak yazar; robots.txt,
 * manifest.webmanifest ve (alan adı biliniyorsa) sitemap.xml üretir.
 *
 * Alan adı: kaynak/site.json → "alanAdi" (ör. "https://www.ornek.com"). Boşken canonical bağlantıları göreli yazılır,
 * og:url / og:image ve sitemap.xml üretilmez — sahte alan adı yayımlanmaz. */
'use strict';
const fs = require('fs');
const path = require('path');

const KOK = path.resolve(__dirname, '..');
const K = require(path.join(KOK, 'assets/js/cekirdek.js'));
const ayar = JSON.parse(fs.readFileSync(path.join(KOK, 'kaynak/site.json'), 'utf8'));
const alanAdi = String(ayar.alanAdi || '').replace(/\/+$/, '');
if (alanAdi && !/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(alanAdi)) {
  throw new Error('kaynak/site.json → alanAdi "https://alan.adi" biçiminde olmalı: ' + alanAdi);
}
const ikonlar = fs.readFileSync(path.join(KOK, 'kaynak/ikonlar.svg'), 'utf8').trim();
const galeri = JSON.parse(fs.readFileSync(path.join(KOK, 'kaynak/galeri.json'), 'utf8'));

const SAYFALAR = ['index', 'hizmetler', 'surec', 'is-emri', 'iletisim', 'kvkk'];
const MENU = [
  { ad: 'index', dosya: './', yazi: 'Ana Sayfa' },
  { ad: 'hizmetler', dosya: 'hizmetler.html', yazi: 'Hizmetler' },
  { ad: 'surec', dosya: 'surec.html', yazi: 'Servis Süreci' },
  { ad: 'iletisim', dosya: 'iletisim.html', yazi: 'İletişim' }
];

function kacir(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function ikon(ad, sinif) { return `<svg class="ikon${sinif ? ' ' + sinif : ''}" aria-hidden="true"><use href="#i-${ad}"/></svg>`; }
function sayfaYolu(ad) { return ad === 'index' ? './' : ad + '.html'; }
function mutlak(ad) { return alanAdi + '/' + (ad === 'index' ? '' : ad + '.html'); }

const WA_HAZIR = K.waAdresi(K.KARSILAMA);
const TEL_HREF = 'tel:+' + K.TELEFON;
const ADRES_SORGU = 'Selimiye Mah. Sanayi Sitesi, Milas, Muğla';
const HARITA_AC = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(ADRES_SORGU);
const YOL_TARIFI = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(ADRES_SORGU);
const HARITA_GOMULU = 'https://maps.google.com/maps?q=' + encodeURIComponent(ADRES_SORGU) + '&z=15&output=embed';

// ---------------------------------------------------------------- Ortak parçalar
const parcalar = {
  TEL_HREF: TEL_HREF,
  TEL: K.TELEFON_GORUNEN,
  WA_HAZIR: kacir(WA_HAZIR),
  HARITA_AC: kacir(HARITA_AC),
  YOL_TARIFI: kacir(YOL_TARIFI),
  ROZET: `<p class="rozet" data-durum><span class="rozet__nokta" aria-hidden="true"></span><span class="rozet__metin"><b class="rozet__baslik">Atölye</b><span class="rozet__alt">Pzt–Cum 09:00–17:30 · Cmt 09:00–13:30</span><span class="rozet__ek"></span></span></p>`,
  ROZET_BUYUK: `<p class="rozet rozet--buyuk" data-durum aria-live="polite"><span class="rozet__nokta" aria-hidden="true"></span><span class="rozet__metin"><b class="rozet__baslik">Atölye</b><span class="rozet__alt">Pzt–Cum 09:00–17:30 · Cmt 09:00–13:30</span><span class="rozet__ek"></span></span></p>`,
  SAATLER_TABLOSU: `<table class="saatler">
            <caption class="gorunmez">Atölye çalışma saatleri</caption>
            <tbody>
              <tr data-gunler="1 2 3 4 5"><th scope="row">Pazartesi – Cuma</th><td>09:00 – 17:30</td></tr>
              <tr data-gunler="6"><th scope="row">Cumartesi</th><td>09:00 – 13:30</td></tr>
              <tr data-gunler="0"><th scope="row">Pazar</th><td>Kapalı</td></tr>
            </tbody>
          </table>`,
  ILCELER: `<ul class="cipler" aria-label="Hizmet verilen ilçeler">
            <li class="vurgu">Milas</li><li>Bodrum</li><li>Dalaman</li><li>Datça</li><li>Fethiye</li><li>Kavaklıdere</li><li>Köyceğiz</li>
            <li>Marmaris</li><li>Menteşe</li><li>Ortaca</li><li>Seydikemer</li><li>Ula</li><li>Yatağan</li><li class="vurgu">Didim (Aydın)</li>
          </ul>`,
  MAKINELER: `<ul class="cipler" aria-label="Servis verdiğimiz makineler">
            <li>Ekskavatör (paletli, lastikli, mini)</li><li>Loder (lastikli yükleyici)</li><li>Beko loder (kazıcı yükleyici)</li><li>Vinç</li>
            <li>Greyder</li><li>Dozer</li><li>Silindir</li><li>Forklift</li><li>Teleskopik yükleyici</li><li>Beton pompası</li><li>Transmikser</li><li>Diğer iş makineleri</li>
          </ul>`,
  HARITA: `<div class="harita" data-harita="${kacir(HARITA_GOMULU)}">
            <div class="harita__ic">
              <span class="harita__pin">${ikon('konum')}</span>
              <strong>Selimiye Mah. Sanayi Sitesi<br>Milas / Muğla</strong>
              <p class="not">Harita Google tarafından sunulur. Göstermek için düğmeye basın; bu durumda tarayıcınız Google'a bağlanır.</p>
              <button class="dugme dugme--koyu harita__dugme" type="button">${ikon('konum')}Haritayı göster</button>
            </div>
          </div>`,
  HIZLI_ARIZA: `<ul class="hizli-ariza">\n` + K.ARIZA_KATEGORILERI.map((k, i) =>
    `            <li><a href="${kacir(K.waAdresi(K.hizliMesaj(k)))}" target="_blank" rel="noopener"><span class="hizli-ariza__no" aria-hidden="true">${i + 1}</span><span>${kacir(k)}<span class="gorunmez"> — WhatsApp'ta yaz (yeni sekme)</span></span>${ikon('ok', 'ikon--ok')}</a></li>`
  ).join('\n') + `\n          </ul>`,
  KATEGORI_KARTLARI: K.ARIZA_KATEGORILERI.map((k, i) =>
    `              <label><input type="radio" name="kategori" value="${kacir(k)}"${i === 0 ? ' required' : ''}><span><span class="kartsec__no" aria-hidden="true">${i + 1}</span><span>${kacir(k)}</span></span></label>`
  ).join('\n'),
  GALERI: galeri.length
    ? `<ul class="galeri__izgara">\n` + galeri.map((g) =>
      `            <li data-anim="kart"><figure><img src="${kacir(g.dosya)}" width="${Number(g.en)}" height="${Number(g.boy)}" alt="${kacir(g.alt)}" loading="lazy" decoding="async">${g.aciklama ? `<figcaption>${kacir(g.aciklama)}</figcaption>` : ''}</figure></li>`
    ).join('\n') + `\n          </ul>`
    : `<div class="galeri__bos" data-anim="kart">
            <span class="ikon-kutu">${ikon('resim')}</span>
            <p><strong>Atölye fotoğrafları bu alanda yayınlanacak.</strong>Şimdilik arızalı parçanın ya da makinenin fotoğrafını WhatsApp'tan gönderin; ön değerlendirme fotoğraf üzerinden yapılır.</p>
            <a class="dugme dugme--wa" href="${kacir(WA_HAZIR)}" target="_blank" rel="noopener">${ikon('wa')}Fotoğraf gönder</a>
          </div>`
};
parcalar.MUHATAP = `<span class="unvan">BAŞ TEKNİSYEN</span>`;

function parcaDoldur(metin) {
  return metin.replace(/\{\{([A-Z_]+)\}\}/g, (tam, ad) => {
    if (!(ad in parcalar)) throw new Error('Bilinmeyen parça: ' + tam);
    return parcalar[ad];
  }).replace(/\{\{ikon:([a-z]+)(?::([a-z-]+))?\}\}/g, (tam, ad, sinif) => ikon(ad, sinif));
}

// ---------------------------------------------------------------- Yapısal veri (yalnızca doğrulanmış bilgiler)
function yapisalVeri() {
  const veri = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Başkent İş Makinaları',
    description: 'Ekskavatör, loder, beko loder, vinç ve diğer iş makineleri için hidrolik sistem, şanzıman ve tork konvertörü, dizel motor revizyonu; atölye ve yerinde saha servisi.',
    telephone: '+90-538-077-35-71',
    address: { '@type': 'PostalAddress', streetAddress: 'Selimiye Mah. Sanayi Sitesi', addressLocality: 'Milas', addressRegion: 'Muğla', addressCountry: 'TR' },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '17:30' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '13:30' }
    ],
    areaServed: [{ '@type': 'AdministrativeArea', name: 'Muğla' }, { '@type': 'City', name: 'Didim' }],
    employee: { '@type': 'Person', name: 'Mücahit ÇAKIR', jobTitle: 'BAŞ TEKNİSYEN' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog', name: 'Hizmetler',
      itemListElement: ['Hidrolik Sistem Servisi', 'Şanzıman ve Tork Konvertörü', 'Dizel Motor Revizyonu (Overhaul)', 'Atölye Servisi', 'Yerinde Saha Servisi', 'Kova Tamiri ve Hardox Zırhlama', 'Mekanik Ağır Bakım']
        .map((ad) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: ad } }))
    }
  };
  if (alanAdi) { veri.url = alanAdi + '/'; veri.image = alanAdi + '/assets/images/logo.jpg'; }
  return `<script type="application/ld+json">\n${JSON.stringify(veri, null, 2)}\n</script>`;
}

// ---------------------------------------------------------------- Sayfa iskeleti
function ustBilgi(m, ad) {
  const canonical = alanAdi ? mutlak(ad) : sayfaYolu(ad);
  const betikler = ['vendor/lenis.min.js', 'vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js', 'cekirdek.js', 'site.js'].concat(m.betikler || []);
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${kacir(m.baslik)}</title>
<meta name="description" content="${kacir(m.aciklama)}">
<link rel="canonical" href="${kacir(canonical)}">
${m.dizinleme === false ? '<meta name="robots" content="noindex, follow">\n' : ''}<meta name="theme-color" content="#101827">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="format-detection" content="telephone=no">
<meta property="og:type" content="website">
<meta property="og:locale" content="tr_TR">
<meta property="og:site_name" content="Başkent İş Makinaları">
<meta property="og:title" content="${kacir(m.baslik)}">
<meta property="og:description" content="${kacir(m.aciklama)}">
${alanAdi ? `<meta property="og:url" content="${kacir(mutlak(ad))}">
<meta property="og:image" content="${kacir(alanAdi + '/assets/images/logo.jpg')}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="800">
<meta property="og:image:alt" content="Başkent İş Makinaları logosu">
<meta name="twitter:card" content="summary_large_image">
` : '<meta name="twitter:card" content="summary">\n'}<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="assets/icons/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">
<link rel="preload" href="assets/fonts/archivo-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/figtree-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/site.css">
${m.yapisalVeri ? yapisalVeri() + '\n' : ''}${betikler.map((b) => `<script defer src="assets/js/${b}"></script>`).join('\n')}
</head>`;
}

function menuHtml(aktif) {
  return MENU.map((s) => `        <li><a href="${s.dosya}"${s.ad === aktif ? ' aria-current="page"' : ''}>${s.yazi}</a></li>`).join('\n') +
    `\n        <li class="menu__cta"><a href="is-emri.html"${aktif === 'is-emri' ? ' aria-current="page"' : ''}>Servis Talebi</a></li>`;
}

function govdeBasi(aktif) {
  return `<body>
<a class="atla" href="#icerik">İçeriğe geç</a>
${ikonlar}
<aside class="ust-serit" aria-label="Atölye durumu ve telefon">
  <div class="sar ust-serit__ic">
    ${parcalar.ROZET}
    <span class="ust-serit__saha">${ikon('siren')}<span><b>7/24 saha servisi</b> · acil arızada arayın</span></span>
    <a class="ust-serit__tel" href="${TEL_HREF}">${ikon('tel')}<span class="sayi">${K.TELEFON_GORUNEN}</span></a>
  </div>
</aside>
<header class="baslik">
  <div class="sar baslik__ic">
    <a class="logo" href="./">
      <img src="assets/images/logo-isaret.webp" width="240" height="144" alt="">
      <span class="logo__yazi"><b>BAŞKENT</b> <span>İş Makinaları</span><span class="gorunmez"> — Ana Sayfa</span></span>
    </a>
    <nav class="menu" aria-label="Ana menü">
      <button class="menu__dugme" type="button" aria-expanded="false" aria-controls="menuListe">
        <svg class="ikon menu__ikon-ac" aria-hidden="true"><use href="#i-menu"/></svg><svg class="ikon menu__ikon-kapa" aria-hidden="true"><use href="#i-kapat"/></svg><span class="menu__yazi">Menü</span>
      </button>
      <ul class="menu__liste" id="menuListe" data-lenis-prevent>
${menuHtml(aktif)}
      </ul>
    </nav>
  </div>
</header>
`;
}

function kapanis() {
  return `
  <section class="kapanis" aria-labelledby="kapanisBaslik">
    <div class="sar kapanis__kart" data-anim="kapanis">
      <div>
        <p class="etiket">İletişim</p>
        <h2 id="kapanisBaslik">Makineniz mi durdu? Hemen konuşalım.</h2>
        <span class="kapanis__cizgi" aria-hidden="true"></span>
        <p>Telefonda ve WhatsApp'ta muhatabınız <b>Mücahit ÇAKIR</b> — ${parcalar.MUHATAP}. Atölye mesai dışındaysa acil saha servisi için yine arayabilirsiniz.</p>
      </div>
      <div class="kapanis__dugmeler">
        <a class="dugme dugme--altin dugme--buyuk" href="${TEL_HREF}">${ikon('tel')}Hemen Ara <span class="sayi">${K.TELEFON_GORUNEN}</span></a>
        <a class="dugme dugme--wa dugme--buyuk" href="${kacir(WA_HAZIR)}" target="_blank" rel="noopener">${ikon('wa')}WhatsApp'tan yaz</a>
        <a class="dugme dugme--cizgi dugme--buyuk" href="is-emri.html">Servis Talebi Oluştur${ikon('ok', 'ikon--ok')}</a>
      </div>
    </div>
  </section>`;
}

function altBilgi() {
  return `
<footer class="alt">
  <div class="sar">
    <div class="alt__ic">
      <div class="alt__marka">
        <img src="assets/images/logo-isaret.webp" width="240" height="144" alt="Başkent İş Makinaları" loading="lazy" decoding="async">
        <p>İş makinelerinde hidrolik sistem, şanzıman ve tork konvertörü, dizel motor revizyonu; atölye ve yerinde saha servisi.</p>
      </div>
      <div>
        <h2>Sayfalar</h2>
        <ul>
          <li><a href="./">Ana Sayfa</a></li>
          <li><a href="hizmetler.html">Hizmetler</a></li>
          <li><a href="surec.html">Servis Süreci</a></li>
          <li><a href="is-emri.html">Servis Talebi</a></li>
          <li><a href="iletisim.html">İletişim</a></li>
        </ul>
      </div>
      <div>
        <h2>Atölye</h2>
        <ul>
          <li>Pazartesi – Cuma 09:00 – 17:30</li>
          <li>Cumartesi 09:00 – 13:30</li>
          <li>Pazar kapalı</li>
          <li><b>7/24 saha servisi</b></li>
        </ul>
      </div>
      <div>
        <h2>İletişim</h2>
        <ul>
          <li><a class="sayi" href="${TEL_HREF}">${K.TELEFON_GORUNEN}</a></li>
          <li><a href="${kacir(WA_HAZIR)}" target="_blank" rel="noopener">WhatsApp</a></li>
          <li><a href="${kacir(HARITA_AC)}" target="_blank" rel="noopener">Selimiye Mah. Sanayi Sitesi, Milas / Muğla</a></li>
          <li><a href="kvkk.html">KVKK Aydınlatma Metni</a></li>
        </ul>
      </div>
    </div>
    <div class="alt__son">
      <span>© <span data-yil>${new Date().getFullYear()}</span> Başkent İş Makinaları</span>
      <span>Hiçbir markanın yetkili servisi değildir.</span>
    </div>
  </div>
</footer>

<aside class="hizli" aria-label="Hızlı iletişim">
  <a class="hizli__ara" href="${TEL_HREF}">${ikon('tel')}Ara</a>
  <a class="hizli__wa" href="${kacir(WA_HAZIR)}" target="_blank" rel="noopener">${ikon('wa')}WhatsApp</a>
</aside>
</body>
</html>
`;
}

function sayfaUret(ad) {
  const kaynak = fs.readFileSync(path.join(KOK, 'kaynak/sayfalar', ad + '.html'), 'utf8');
  const es = kaynak.match(/^<!--\s*(\{[\s\S]*?\})\s*-->\s*/);
  if (!es) throw new Error(ad + ': sayfa başında meta yorum yok');
  const m = JSON.parse(es[1]);
  const icerik = parcaDoldur(kaynak.slice(es[0].length)).trimEnd();
  return ustBilgi(m, ad) + '\n' + govdeBasi(ad) + '\n<main id="icerik">\n' + icerik + '\n' + (m.kapanis === false ? '' : kapanis() + '\n') + '</main>\n' + altBilgi();
}

// ---------------------------------------------------------------- Yaz
const yazilan = [];
function yaz(dosya, icerik) { fs.writeFileSync(path.join(KOK, dosya), icerik); yazilan.push(dosya); }

SAYFALAR.forEach((ad) => yaz(ad + '.html', sayfaUret(ad)));

yaz('robots.txt', 'User-agent: *\nAllow: /\n' + (alanAdi ? '\nSitemap: ' + alanAdi + '/sitemap.xml\n' : ''));

const manifest = {
  name: 'Başkent İş Makinaları',
  short_name: 'Başkent İş',
  description: 'İş makinesi hidrolik, şanzıman ve dizel motor servisi — Milas / Muğla',
  lang: 'tr',
  start_url: './',
  scope: './',
  display: 'standalone',
  background_color: '#101827',
  theme_color: '#101827',
  icons: [
    { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    { src: 'assets/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'assets/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'assets/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
};
yaz('manifest.webmanifest', JSON.stringify(manifest, null, 2) + '\n');

const haritaDosya = path.join(KOK, 'sitemap.xml');
if (alanAdi) {
  const tarih = new Date().toISOString().slice(0, 10);
  yaz('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    SAYFALAR.map((ad) => `  <url><loc>${mutlak(ad)}</loc><lastmod>${tarih}</lastmod></url>`).join('\n') + '\n</urlset>\n');
} else if (fs.existsSync(haritaDosya)) {
  fs.unlinkSync(haritaDosya);
}

console.log('Yazıldı: ' + yazilan.join(', ') + (alanAdi ? '' : '\n(alan adı yok: sitemap.xml üretilmedi, canonical göreli)'));
