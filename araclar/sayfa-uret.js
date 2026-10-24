#!/usr/bin/env node
/* Başkent İş Makinaları — statik sayfa üreteci (bağımlılık yok; Node 18+).
 *
 *   node araclar/sayfa-uret.js
 *
 * İşletme bilgilerinin (telefon, WhatsApp, adres, saatler, yetkili, seçenek listeleri) TEK kaynağı site.config.json'dur.
 * Üreteç kaynak/sayfalar/*.html içeriklerini ortak üst bilgi, menü, alt bilgi ve ikonlarla birleştirip kök klasöre yazar;
 * tarayıcı için assets/js/ayar.js, ayrıca robots.txt, manifest.webmanifest ve (alan adı biliniyorsa) sitemap.xml üretir.
 *
 * Alan adı: site.config.json → "alanAdi" (ör. "https://www.ornek.com"). Boşken canonical bağlantıları göreli yazılır,
 * og:url / og:image ve sitemap.xml üretilmez — sahte alan adı yayımlanmaz. */
'use strict';
// Okunamayan/yazılamayan dosyada ya da hatalı ayarda yarım çıktı bırakmadan, anlaşılır mesajla durur.
process.on('uncaughtException', (hata) => {
  console.error('Sayfa üretimi durdu: ' + hata.message);
  process.exit(1);
});
const fs = require('fs');
const path = require('path');

const KOK = path.resolve(__dirname, '..');
const K = require(path.join(KOK, 'assets/js/cekirdek.js'));
const A = K.AYAR;
const alanAdi = String(A.alanAdi || '').replace(/\/+$/, '');
if (alanAdi && !/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(alanAdi)) {
  throw new Error('site.config.json → alanAdi "https://alan.adi" biçiminde olmalı: ' + alanAdi);
}
if (!/^90\d{10}$/.test(A.telefon.e164) || !/^90\d{10}$/.test(A.whatsapp.numara)) {
  throw new Error('site.config.json → telefon.e164 ve whatsapp.numara 90 ile başlayan 12 hane olmalı.');
}
const ikonlar = fs.readFileSync(path.join(KOK, 'kaynak/ikonlar.svg'), 'utf8').trim();
const galeri = JSON.parse(fs.readFileSync(path.join(KOK, 'kaynak/galeri.json'), 'utf8'));

const SAYFALAR = ['index', 'hizmetlerimiz', 'servis-talebi', 'hakkimizda', 'iletisim', 'kvkk'];
const MENU = [
  { ad: 'index', yazi: 'Ana Sayfa' },
  { ad: 'hizmetlerimiz', yazi: 'Hizmetlerimiz' },
  { ad: 'hakkimizda', yazi: 'Hakkımızda' },
  { ad: 'iletisim', yazi: 'İletişim' }
];

function kacir(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function ikon(ad, sinif) { return `<svg class="ikon${sinif ? ' ' + sinif : ''}" aria-hidden="true"><use href="#i-${ad}"/></svg>`; }
function sayfaYolu(ad) { return ad === 'index' ? './' : ad + '.html'; }
function mutlak(ad) { return alanAdi + '/' + (ad === 'index' ? '' : ad + '.html'); }

// ---------------------------------------------------------------- Ayarlardan türetilen değerler
const FIRMA = A.firma;
const ADRES = `${A.adres.satir}, ${A.adres.ilce} / ${A.adres.il}`;
const TEL_HREF = 'tel:+' + A.telefon.e164;
const WA_HAZIR = K.waAdresi(K.KARSILAMA);
// Koordinat biliniyorsa harita onu, bilinmiyorsa adres sorgusunu kullanır (koordinat uydurulmaz).
const KONUM_SORGU = A.adres.koordinat ? A.adres.koordinat.enlem + ',' + A.adres.koordinat.boylam : A.adres.haritaSorgusu;
const HARITA_AC = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(KONUM_SORGU);
const YOL_TARIFI = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(KONUM_SORGU);
const HARITA_GOMULU = 'https://maps.google.com/maps?q=' + encodeURIComponent(KONUM_SORGU) + '&z=15&output=embed';
const GUN_KISA = { 'Pazartesi – Cuma': 'Pzt–Cum', Cumartesi: 'Cmt', Pazar: 'Paz' };
const ACIK_SAATLER = A.calismaSaatleri.filter((s) => s.acilis);
const KAPALI_GUNLER = A.calismaSaatleri.filter((s) => !s.acilis).map((s) => s.etiket);
const SAAT_OZET = ACIK_SAATLER.map((s) => `${GUN_KISA[s.etiket] || s.etiket} ${s.acilis}–${s.kapanis}`).join(' · ');
const KAPALI_OZET = KAPALI_GUNLER.map((g) => g + ' kapalı').join(' · ');
const GUN_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function rozet(sinif, ekOzellik) {
  return `<p class="rozet${sinif ? ' ' + sinif : ''}" data-durum${ekOzellik || ''}><span class="rozet__nokta" aria-hidden="true"></span><span class="rozet__metin"><b class="rozet__baslik">Atölye</b><span class="rozet__alt">${kacir(SAAT_OZET)}</span><span class="rozet__ek"></span></span></p>`;
}
function cipler(etiket, liste, vurgu) {
  return `<ul class="cipler" aria-label="${kacir(etiket)}">\n` +
    liste.map((x) => `            <li${vurgu && vurgu(x) ? ' class="vurgu"' : ''}>${kacir(x)}</li>`).join('\n') + `\n          </ul>`;
}
function secenekler(liste) { return liste.map((x) => `<option>${kacir(x)}</option>`).join(''); }

// ---------------------------------------------------------------- Ortak parçalar
const parcalar = {
  FIRMA: kacir(FIRMA),
  ADRES: kacir(ADRES),
  TEL_HREF: TEL_HREF,
  TEL: kacir(A.telefon.gorunen),
  WA_HAZIR: kacir(WA_HAZIR),
  HARITA_AC: kacir(HARITA_AC),
  YOL_TARIFI: kacir(YOL_TARIFI),
  YETKILI: kacir(A.yetkili.ad),
  UNVAN: kacir(A.yetkili.unvan),
  YONETIM: kacir(A.yonetim),
  SAHA: kacir(A.sahaServisi),
  SAAT_OZET: kacir(SAAT_OZET),
  KAPALI_OZET: kacir(KAPALI_OZET),
  HIZMET_BOLGESI: kacir(A.hizmetBolgesiNotu),
  ROZET: rozet(''),
  ROZET_BUYUK: rozet('rozet--buyuk', ' aria-live="polite"'),
  SAATLER_TABLOSU: `<table class="saatler">
            <caption class="gorunmez">Atölye çalışma saatleri</caption>
            <tbody>
${A.calismaSaatleri.map((s) => `              <tr data-gunler="${s.gunler.join(' ')}"><th scope="row">${kacir(s.etiket)}</th><td>${s.acilis ? s.acilis + ' – ' + s.kapanis : 'Kapalı'}</td></tr>`).join('\n')}
            </tbody>
          </table>`,
  ILCELER: cipler('Hizmet verilen bölgeler', A.bolgeler.filter((b) => !/^Diğer/.test(b)), (b) => b === A.adres.ilce || /\(/.test(b)),
  MAKINELER: cipler('Servis verdiğimiz makineler', A.servisTalebi.ekipmanlar.map((e) => (e === 'Diğer' ? 'Diğer iş makineleri' : e))),
  KAHRAMAN_HARITA: `<iframe class="kahraman-harita__cerceve" src="${kacir(HARITA_GOMULU)}" title="${kacir(FIRMA)} konumu — Google Haritalar" loading="eager" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
  HARITA: `<div class="harita" data-harita="${kacir(HARITA_GOMULU)}">
            <div class="harita__ic">
              <span class="harita__pin">${ikon('konum')}</span>
              <strong>${kacir(A.adres.satir)}<br>${kacir(A.adres.ilce + ' / ' + A.adres.il)}</strong>
              <p class="not">Harita Google tarafından sunulur. Göstermek için düğmeye basın; bu durumda tarayıcınız Google'a bağlanır.</p>
              <button class="dugme dugme--koyu harita__dugme" type="button">${ikon('konum')}Haritayı göster</button>
            </div>
          </div>`,
  KONUM_PAYLAS: `<button class="eylem eylem--paylas" type="button" data-paylas data-baslik="${kacir(FIRMA)}" data-metin="${kacir(ADRES)}" data-url="${kacir(HARITA_AC)}">
              <span class="eylem__ikon">${ikon('paylas')}</span><span class="eylem__yazi"><b>Konumu Paylaş</b><span data-paylas-durum aria-live="polite">Bağlantıyı gönderin ya da kopyalayın</span></span>
            </button>`,
  HIZLI_ARIZA: `<ul class="hizli-ariza">\n` + K.ARIZA_KATEGORILERI.map((k, i) =>
    `            <li><a href="${kacir(K.waAdresi(K.hizliMesaj(k)))}" target="_blank" rel="noopener"><span class="hizli-ariza__no" aria-hidden="true">${i + 1}</span><span>${kacir(k)}<span class="gorunmez"> — WhatsApp'ta yaz (yeni sekme)</span></span>${ikon('ok', 'ikon--ok')}</a></li>`
  ).join('\n') + `\n          </ul>`,
  HIZMET_KARTLARI: A.servisTalebi.hizmetler.map((h, i) =>
    `              <label><input type="radio" name="hizmet" value="${kacir(h.ad)}"${i === 0 ? ' required' : ''}><span><span class="kartsec__no" aria-hidden="true">${i + 1}</span><span><b>${kacir(h.ad)}</b><small>${kacir(h.aciklama)}</small></span></span></label>`
  ).join('\n'),
  ACILIYET_SECENEK: A.servisTalebi.aciliyetler.map((a, i) =>
    `                <label><input type="radio" name="aciliyet" value="${kacir(a)}"${i === 0 ? ' required' : ''}><span>${kacir(a)}</span></label>`
  ).join('\n'),
  EKIPMAN_SECENEK: secenekler(A.servisTalebi.ekipmanlar),
  BOLGE_SECENEK: secenekler(A.bolgeler),
  KATEGORI_SECENEK: secenekler(K.ARIZA_KATEGORILERI),
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
parcalar.MUHATAP = `<span class="unvan">${parcalar.UNVAN}</span>`;

function parcaDoldur(metin) {
  return metin.replace(/\{\{([A-Z_]+)\}\}/g, (tam, ad) => {
    if (!(ad in parcalar)) throw new Error('Bilinmeyen parça: ' + tam);
    return parcalar[ad];
  }).replace(/\{\{ikon:([a-z]+)(?::([a-z-]+))?\}\}/g, (tam, ad, sinif) => ikon(ad, sinif));
}

// ---------------------------------------------------------------- Yapısal veri (yalnızca site.config.json'daki bilgiler)
function yapisalVeri() {
  const veri = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: FIRMA,
    description: 'Ekskavatör, loder, beko loder, vinç ve diğer iş makineleri için hidrolik sistem, şanzıman ve tork konvertörü, dizel motor revizyonu; atölye ve yerinde saha servisi.',
    telephone: '+' + A.telefon.e164,
    address: { '@type': 'PostalAddress', streetAddress: A.adres.satir, addressLocality: A.adres.ilce, addressRegion: A.adres.il, addressCountry: 'TR' },
    openingHoursSpecification: ACIK_SAATLER.map((s) => ({
      '@type': 'OpeningHoursSpecification', dayOfWeek: s.gunler.map((g) => GUN_EN[g]), opens: s.acilis, closes: s.kapanis
    })),
    areaServed: [{ '@type': 'AdministrativeArea', name: A.adres.il }, { '@type': 'City', name: 'Didim' }],
    employee: { '@type': 'Person', name: A.yetkili.ad, jobTitle: A.yetkili.unvan },
    hasOfferCatalog: {
      '@type': 'OfferCatalog', name: 'Hizmetler',
      itemListElement: A.servisTalebi.hizmetler.map((h) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: h.ad } }))
    }
  };
  if (A.adres.koordinat) veri.geo = { '@type': 'GeoCoordinates', latitude: A.adres.koordinat.enlem, longitude: A.adres.koordinat.boylam };
  if (alanAdi) { veri.url = alanAdi + '/'; veri.image = alanAdi + '/assets/images/logo.jpg'; }
  return `<script type="application/ld+json">\n${JSON.stringify(veri, null, 2)}\n</script>`;
}

// ---------------------------------------------------------------- Sayfa iskeleti
function ustBilgi(m, ad) {
  const canonical = alanAdi ? mutlak(ad) : sayfaYolu(ad);
  const betikler = ['vendor/lenis.min.js', 'vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js', 'ayar.js', 'cekirdek.js', 'site.js'].concat(m.betikler || []);
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${kacir(m.baslik)}</title>
<meta name="description" content="${kacir(parcaDoldur(m.aciklama))}">
<link rel="canonical" href="${kacir(canonical)}">
${m.dizinleme === false ? '<meta name="robots" content="noindex, follow">\n' : ''}<meta name="theme-color" content="#101827">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="format-detection" content="telephone=no">
<meta property="og:type" content="website">
<meta property="og:locale" content="tr_TR">
<meta property="og:site_name" content="${kacir(FIRMA)}">
<meta property="og:title" content="${kacir(m.baslik)}">
<meta property="og:description" content="${kacir(parcaDoldur(m.aciklama))}">
${alanAdi ? `<meta property="og:url" content="${kacir(mutlak(ad))}">
<meta property="og:image" content="${kacir(alanAdi + '/assets/images/logo.jpg')}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="800">
<meta property="og:image:alt" content="${kacir(FIRMA)} logosu">
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
  return MENU.map((s) => `        <li><a href="${sayfaYolu(s.ad)}"${s.ad === aktif ? ' aria-current="page"' : ''}>${s.yazi}</a></li>`).join('\n') +
    `\n        <li class="menu__cta"><a href="servis-talebi.html"${aktif === 'servis-talebi' ? ' aria-current="page"' : ''}>Servis Talebi</a></li>`;
}

function govdeBasi(aktif) {
  return `<body>
<a class="atla" href="#icerik">İçeriğe geç</a>
${ikonlar}
<header class="baslik">
  <div class="sar baslik__ic">
    <div class="baslik__sol">
      <a class="logo" href="./">
        <img src="assets/images/logo-isaret.webp" width="240" height="144" alt="">
        <span class="logo__yazi"><b>BAŞKENT</b> <span>İş Makinaları</span><span class="gorunmez"> — Ana Sayfa</span></span>
      </a>
      ${rozet('rozet--baslik')}
    </div>
    <nav class="menu" aria-label="Ana menü">
      <button class="menu__dugme" type="button" aria-expanded="false" aria-controls="menuListe">
        <svg class="ikon menu__ikon-ac" aria-hidden="true"><use href="#i-menu"/></svg><svg class="ikon menu__ikon-kapa" aria-hidden="true"><use href="#i-kapat"/></svg><span class="menu__yazi">Menü</span>
      </button>
      <ul class="menu__liste" id="menuListe" data-lenis-prevent>
${menuHtml(aktif)}
      </ul>
    </nav>
    <div class="baslik__eylem">
      <a class="dugme dugme--altin dugme--kucuk" href="${TEL_HREF}">${ikon('tel')}Hemen Ara</a>
      <a class="dugme dugme--wa dugme--kucuk" href="${kacir(WA_HAZIR)}" target="_blank" rel="noopener">${ikon('wa')}WhatsApp</a>
    </div>
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
        <p>Telefonda ve WhatsApp'ta muhatabınız <b>${parcalar.YETKILI}</b> — ${parcalar.MUHATAP}. Atölye mesai dışındaysa acil saha servisi için yine arayabilirsiniz.</p>
      </div>
      <div class="kapanis__dugmeler">
        <a class="dugme dugme--altin dugme--buyuk" href="${TEL_HREF}">${ikon('tel')}Hemen Ara <span class="sayi">${parcalar.TEL}</span></a>
        <a class="dugme dugme--wa dugme--buyuk" href="${kacir(WA_HAZIR)}" target="_blank" rel="noopener">${ikon('wa')}WhatsApp'tan yaz</a>
        <a class="dugme dugme--cizgi dugme--buyuk" href="servis-talebi.html">Servis Talebi Oluştur${ikon('ok', 'ikon--ok')}</a>
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
        <img src="assets/images/logo-isaret.webp" width="240" height="144" alt="${kacir(FIRMA)}" loading="lazy" decoding="async">
        <p>İş makinelerinde hidrolik sistem, şanzıman ve tork konvertörü, dizel motor revizyonu; atölye ve yerinde saha servisi.</p>
      </div>
      <div>
        <h2>Sayfalar</h2>
        <ul>
${MENU.concat([{ ad: 'servis-talebi', yazi: 'Servis Talebi' }]).map((s) => `          <li><a href="${sayfaYolu(s.ad)}">${s.yazi}</a></li>`).join('\n')}
        </ul>
      </div>
      <div>
        <h2>Atölye</h2>
        <ul>
${A.calismaSaatleri.map((s) => `          <li>${kacir(s.etiket)} ${s.acilis ? s.acilis + ' – ' + s.kapanis : 'kapalı'}</li>`).join('\n')}
          <li><b>${parcalar.SAHA} saha servisi</b></li>
        </ul>
      </div>
      <div>
        <h2>İletişim</h2>
        <ul>
          <li><a class="sayi" href="${TEL_HREF}">${parcalar.TEL}</a></li>
          <li><a href="${kacir(WA_HAZIR)}" target="_blank" rel="noopener">WhatsApp</a></li>
          <li><a href="${kacir(HARITA_AC)}" target="_blank" rel="noopener">${parcalar.ADRES}</a></li>
          <li><a href="kvkk.html">KVKK Aydınlatma Metni</a></li>
        </ul>
      </div>
    </div>
    <div class="alt__son">
      <span>© <span data-yil>${new Date().getFullYear()}</span> ${kacir(FIRMA)}</span>
      <span>Hiçbir markanın yetkili servisi değildir.</span>
    </div>
  </div>
</footer>

<aside class="hizli" aria-label="Hızlı iletişim">
  <a class="hizli__ara" href="${TEL_HREF}">${ikon('tel')}Ara</a>
  <a class="hizli__wa" href="${kacir(WA_HAZIR)}" target="_blank" rel="noopener">${ikon('wa')}WhatsApp</a>
</aside>

<dialog class="tel-pencere" id="telPencere" aria-labelledby="telPencereBaslik">
  <form method="dialog" class="tel-pencere__ic">
    <p class="etiket" id="telPencereBaslik">Telefon · ${parcalar.YETKILI}</p>
    <p class="tel-pencere__numara sayi">${parcalar.TEL}</p>
    <p class="tel-pencere__not">${parcalar.UNVAN}. Bilgisayardan arama yapılamıyorsa numarayı kopyalayıp telefonunuzdan arayın.</p>
    <div class="tel-pencere__dugmeler">
      <button class="dugme dugme--altin" type="button" data-kopyala="${kacir(A.telefon.gorunen)}">${ikon('kopya')}<span>Numarayı kopyala</span></button>
      <a class="dugme dugme--cizgi" href="${TEL_HREF}" data-tel-dogrudan>${ikon('tel')}Ara</a>
      <button class="dugme dugme--cizgi" value="kapat">${ikon('kapat')}Kapat</button>
    </div>
  </form>
</dialog>
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

// ---------------------------------------------------------------- Yaz (önce hepsi hazırlanır, sonra yazılır: hata olursa yarım çıktı kalmaz)
const cikti = [];
SAYFALAR.forEach((ad) => cikti.push([ad + '.html', sayfaUret(ad)]));
cikti.push(['assets/js/ayar.js', '/* site.config.json\'dan üretildi — elle düzenlemeyin; node araclar/sayfa-uret.js */\nwindow.BaskentAyar = ' + JSON.stringify(A, null, 2) + ';\n']);
cikti.push(['robots.txt', 'User-agent: *\nAllow: /\n' + (alanAdi ? '\nSitemap: ' + alanAdi + '/sitemap.xml\n' : '')]);
cikti.push(['manifest.webmanifest', JSON.stringify({
  name: FIRMA,
  short_name: 'Başkent İş',
  description: 'İş makinesi hidrolik, şanzıman ve dizel motor servisi — ' + A.adres.ilce + ' / ' + A.adres.il,
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
}, null, 2) + '\n']);
if (alanAdi) {
  const tarih = new Date().toISOString().slice(0, 10);
  cikti.push(['sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    SAYFALAR.map((ad) => `  <url><loc>${mutlak(ad)}</loc><lastmod>${tarih}</lastmod></url>`).join('\n') + '\n</urlset>\n']);
}

cikti.forEach(([dosya, icerik]) => fs.writeFileSync(path.join(KOK, dosya), icerik));
const haritaDosya = path.join(KOK, 'sitemap.xml');
if (!alanAdi && fs.existsSync(haritaDosya)) fs.unlinkSync(haritaDosya);

console.log('Yazıldı: ' + cikti.map((c) => c[0]).join(', ') + (alanAdi ? '' : '\n(alan adı yok: sitemap.xml üretilmedi, canonical göreli)'));
