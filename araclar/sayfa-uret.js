#!/usr/bin/env node
/* Başkent İş Makinaları — statik sayfa üreteci (bağımlılık yok; Node 18+).
 *
 *   node araclar/sayfa-uret.js
 *
 * İşletme bilgilerinin (telefon, WhatsApp, adres, saatler, yetkili, seçenek listeleri) TEK kaynağı site.config.json'dur.
 * Üreteç kaynak/sayfalar/*.html içeriklerini ortak üst bilgi, menü, alt bilgi ve ikonlarla birleştirip kök klasöre yazar;
 * tarayıcı için assets/js/ayar.js, ayrıca robots.txt, manifest.webmanifest ve (alan adı biliniyorsa) sitemap.xml üretir.
 *
 * Diller: Türkçe ana dildir (kök klasör). Diğer diller kaynak/sayfalar/<dil>/ altındaki çevrilmiş sayfalardan ve
 * kaynak/ceviri/<dil>.json sözlüğünden <dil>/ klasörüne üretilir. Sözlükte karşılığı olmayan Türkçe metin olursa üretim
 * durur (sayfada çevrilmemiş yazı kalmaz). WhatsApp'a giden hazır mesajlar her dilde Türkçedir.
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
// Zorunlu metin alanları: eksik ya da boşsa sitede "undefined" yayımlamak yerine durur.
['firma', 'telefon.gorunen', 'whatsapp.karsilama', 'whatsapp.talepBasligi', 'whatsapp.talepKapanisi', 'whatsapp.parcaTalebi',
  'adres.satir', 'adres.postaKodu', 'adres.ilce', 'adres.il', 'adres.haritaSorgusu', 'sahaServisi', 'yonetim', 'yetkili.ad', 'yetkili.unvan', 'hizmetBolgesiNotu']
  .forEach((alan) => {
    const deger = alan.split('.').reduce((o, k) => (o == null ? o : o[k]), A);
    if (typeof deger !== 'string' || !deger.trim()) throw new Error('site.config.json → "' + alan + '" eksik ya da boş.');
  });
// Koordinat (isteğe bağlı): Türkiye sınırları içinde sayı çifti olmalı; yanlışsa harita yanlış yeri gösterirdi.
const KO = A.adres.koordinat;
if (KO && !(typeof KO.enlem === 'number' && typeof KO.boylam === 'number' && KO.enlem >= 35 && KO.enlem <= 43 && KO.boylam >= 25 && KO.boylam <= 45)) {
  throw new Error('site.config.json → adres.koordinat { "enlem": sayı, "boylam": sayı } biçiminde ve Türkiye içinde olmalı.');
}
// Katalog bağlantısı (isteğe bağlı) yalnızca aynı WhatsApp numarasının wa.me/c/ adresi olabilir.
if (A.whatsapp.katalog && A.whatsapp.katalog !== 'https://wa.me/c/' + A.whatsapp.numara) {
  throw new Error('site.config.json → whatsapp.katalog "https://wa.me/c/' + A.whatsapp.numara + '" olmalı ya da boş bırakılmalı.');
}
if (!/^90\d{10}$/.test(A.telefon.e164) || !/^90\d{10}$/.test(A.whatsapp.numara)) {
  throw new Error('site.config.json → telefon.e164 ve whatsapp.numara 90 ile başlayan 12 hane olmalı.');
}
// WhatsApp kartları: her hizmetin (ve genel servisin) kendi bağlantı sayfası ve görseli olur.
K.KARTLAR.forEach((k, i) => {
  if (!k || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(k.kart || '')) throw new Error('site.config.json → kart adı küçük harf/rakam/tire olmalı: ' + (k && k.kart));
  if (K.KARTLAR.findIndex((x) => x.kart === k.kart) !== i) throw new Error('site.config.json → kart adı tekrar ediyor: ' + k.kart);
  ['ad', 'aciklama', 'ikon', 'detay'].forEach((alan) => {
    if (typeof k[alan] !== 'string' || !k[alan].trim()) throw new Error('site.config.json → "' + k.kart + '" kartında "' + alan + '" eksik.');
  });
  if (!/^[a-z-]+\.html(#[a-z-]+)?$/.test(k.detay)) throw new Error('site.config.json → "' + k.kart + '" kartının "detay" bağlantısı bir site sayfası olmalı: ' + k.detay);
});
if (!K.KARTLAR.some((k) => k.kart === A.whatsapp.parcaKart)) throw new Error('site.config.json → whatsapp.parcaKart tanımlı bir kart olmalı: ' + A.whatsapp.parcaKart);
const ikonlar = fs.readFileSync(path.join(KOK, 'kaynak/ikonlar.svg'), 'utf8').trim();
const galeri = JSON.parse(fs.readFileSync(path.join(KOK, 'kaynak/galeri.json'), 'utf8'));

const SAYFALAR = ['index', 'hizmetlerimiz', 'yedek-parca', 'servis-talebi', 'hakkimizda', 'iletisim', 'kvkk'];
const MENU = [
  { ad: 'index', yazi: 'Ana Sayfa' },
  { ad: 'hizmetlerimiz', yazi: 'Hizmetlerimiz' },
  { ad: 'yedek-parca', yazi: 'Yedek Parça' },
  { ad: 'hakkimizda', yazi: 'Hakkımızda' },
  { ad: 'iletisim', yazi: 'İletişim' }
];
// İlk dil ana dildir (kök klasör). klasor: sitedeki yol; yer: og:locale.
const DILLER = [
  { kod: 'tr', ad: 'Türkçe', kisa: 'TR', yer: 'tr_TR', klasor: '' },
  { kod: 'en', ad: 'English', kisa: 'EN', yer: 'en_GB', klasor: 'en/' },
  { kod: 'de', ad: 'Deutsch', kisa: 'DE', yer: 'de_DE', klasor: 'de/' },
  { kod: 'es', ad: 'Español', kisa: 'ES', yer: 'es_ES', klasor: 'es/' },
  { kod: 'az', ad: 'Azərbaycanca', kisa: 'AZ', yer: 'az_AZ', klasor: 'az/' }
];

function kacir(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function ikon(ad, sinif) { return `<svg class="ikon${sinif ? ' ' + sinif : ''}" aria-hidden="true"><use href="#i-${ad}"/></svg>`; }
function sayfaYolu(ad) { return ad === 'index' ? './' : ad + '.html'; }
function mutlak(ad, dil) { return alanAdi + '/' + dil.klasor + (ad === 'index' ? '' : ad + '.html'); }
// Bir dildeki sayfadan başka bir dildeki aynı sayfaya göreli bağlantı
function dilYolu(ad, mevcut, hedef) {
  return ((mevcut.klasor ? '../' : '') + hedef.klasor + (ad === 'index' ? '' : ad + '.html')) || './';
}

// ---------------------------------------------------------------- Çeviri sözlükleri
// kaynak/ceviri/<dil>.json → { "uretec": { "Türkçe metin": "çeviri" }, "betik": { ... } }.
// "uretec": bu dosyanın ve site.config.json'un sayfaya yazdığı metinler; "betik": tarayıcı betiklerinin yazdığı metinler.
function sozlukOku(dil) {
  if (dil.kod === 'tr') return { uretec: {}, betik: {} };
  const s = JSON.parse(fs.readFileSync(path.join(KOK, 'kaynak/ceviri', dil.kod + '.json'), 'utf8'));
  if (!s.uretec || !s.betik) throw new Error('kaynak/ceviri/' + dil.kod + '.json: "uretec" ve "betik" bölümleri olmalı.');
  return s;
}
function cevirmen(dil, sozluk) {
  const kullanilan = new Set();
  function t(metin, ...degerler) {
    let sonuc = metin;
    if (dil.kod !== 'tr') {
      if (!Object.prototype.hasOwnProperty.call(sozluk.uretec, metin)) {
        throw new Error('kaynak/ceviri/' + dil.kod + '.json → "uretec" içinde çevirisi yok: "' + metin + '"');
      }
      kullanilan.add(metin);
      sonuc = sozluk.uretec[metin];
    }
    return sonuc.replace(/\{(\d)\}/g, (tam, i) => degerler[i]);
  }
  t.kullanilmayan = () => Object.keys(sozluk.uretec).filter((k) => !kullanilan.has(k));
  return t;
}

// ---------------------------------------------------------------- Ayarlardan türetilen, dile bağlı olmayan değerler
const FIRMA = A.firma;
const ADRES = `${A.adres.satir}, ${A.adres.postaKodu} ${A.adres.ilce} / ${A.adres.il}`;
const TEL_HREF = 'tel:+' + A.telefon.e164;
const WA_HAZIR = K.waAdresi(K.KARSILAMA_KARTLI);
// Koordinat biliniyorsa harita onu, bilinmiyorsa adres sorgusunu kullanır (koordinat uydurulmaz).
const KONUM_SORGU = A.adres.koordinat ? A.adres.koordinat.enlem + ',' + A.adres.koordinat.boylam : A.adres.haritaSorgusu;
const HARITA_AC = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(KONUM_SORGU);
const YOL_TARIFI = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(KONUM_SORGU);
const HARITA_GOMULU = 'https://maps.google.com/maps?q=' + encodeURIComponent(KONUM_SORGU) + '&z=15&output=embed';
const GUN_KISA = { 'Pazartesi – Cuma': 'Pzt–Cum', Cumartesi: 'Cmt', Pazar: 'Paz' };
const ACIK_SAATLER = A.calismaSaatleri.filter((s) => s.acilis);
const KAPALI_GUNLER = A.calismaSaatleri.filter((s) => !s.acilis).map((s) => s.etiket);
const GUN_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ---------------------------------------------------------------- Bir dilin tüm sayfaları
function dilUret(dil) {
  const sozluk = sozlukOku(dil);
  const t = cevirmen(dil, sozluk);
  const tr = dil.kod === 'tr';
  // Yer adları çevrilmez; yalnızca "Diğer …" seçeneği çevrilir.
  const yer = (x) => (/^Diğer/.test(x) ? t(x) : x);
  // Form seçenekleri: gönderilen değer (WhatsApp mesajı) Türkçe kalır, ziyaretçi kendi dilinde görür.
  const secenekler = (liste, cevir) => liste.map((x) => (tr ? `<option>${kacir(x)}</option>` : `<option value="${kacir(x)}">${kacir(cevir(x))}</option>`)).join('');

  const SAAT_OZET = ACIK_SAATLER.map((s) => `${t(GUN_KISA[s.etiket] || s.etiket)} ${s.acilis}–${s.kapanis}`).join(' · ');
  const KAPALI_OZET = KAPALI_GUNLER.map((g) => t('{0} kapalı', t(g))).join(' · ');

  function rozet(sinif, ekOzellik) {
    return `<p class="rozet${sinif ? ' ' + sinif : ''}" data-durum${ekOzellik || ''}><span class="rozet__nokta" aria-hidden="true"></span><span class="rozet__metin"><b class="rozet__baslik">${t('Atölye')}</b><span class="rozet__alt">${kacir(SAAT_OZET)}</span><span class="rozet__ek"></span></span></p>`;
  }
  function cipler(etiket, liste, vurgu) {
    return `<ul class="cipler" aria-label="${kacir(etiket)}">\n` +
      liste.map((x) => `            <li${vurgu && vurgu(x) ? ' class="vurgu"' : ''}>${kacir(x)}</li>`).join('\n') + `\n          </ul>`;
  }

  // ---------------------------------------------------------------- Ortak parçalar
  const parcalar = {
    FIRMA: kacir(FIRMA),
    ADRES: kacir(ADRES),
    ADRES_KISA: kacir(A.adres.satir),
    TEL_HREF: TEL_HREF,
    TEL: kacir(A.telefon.gorunen),
    WA_HAZIR: kacir(WA_HAZIR),
    WA_PARCA: kacir(K.waAdresi(K.PARCA_MESAJI)),
    // Katalog tanımlı değilse düğme hiç basılmaz (boş katalog bağlantısı yayımlanmaz)
    KATALOG_DUGME: A.whatsapp.katalog
      ? `<a class="dugme dugme--wa" href="${kacir(A.whatsapp.katalog)}" target="_blank" rel="noopener">${ikon('wa')}${t('Hizmet kartlarını WhatsApp\'ta aç')}</a>`
      : '',
    HARITA_AC: kacir(HARITA_AC),
    YOL_TARIFI: kacir(YOL_TARIFI),
    YETKILI: kacir(A.yetkili.ad),
    UNVAN: kacir(A.yetkili.unvan),
    YONETIM: kacir(t(A.yonetim)),
    SAHA: kacir(t(A.sahaServisi)),
    SAAT_OZET: kacir(SAAT_OZET),
    KAPALI_OZET: kacir(KAPALI_OZET),
    HIZMET_BOLGESI: kacir(t(A.hizmetBolgesiNotu)),
    ROZET: rozet(''),
    ROZET_BUYUK: rozet('rozet--buyuk', ' aria-live="polite"'),
    SAATLER_TABLOSU: `<table class="saatler">
            <caption class="gorunmez">${t('Atölye çalışma saatleri')}</caption>
            <tbody>
${A.calismaSaatleri.map((s) => `              <tr data-gunler="${s.gunler.join(' ')}"><th scope="row">${kacir(t(s.etiket))}</th><td>${s.acilis ? s.acilis + ' – ' + s.kapanis : t('Kapalı')}</td></tr>`).join('\n')}
            </tbody>
          </table>`,
    ILCELER: cipler(t('Hizmet verilen bölgeler'), A.bolgeler.filter((b) => !/^Diğer/.test(b)), (b) => b === A.adres.ilce || /\(/.test(b)),
    MAKINELER: cipler(t('Servis verdiğimiz makineler'), A.servisTalebi.ekipmanlar.map((e) => t(e === 'Diğer' ? 'Diğer iş makineleri' : e))),
    KAHRAMAN_HARITA: `<iframe class="kahraman-harita__cerceve" src="${kacir(HARITA_GOMULU)}" title="${kacir(t('{0} konumu — Google Haritalar', FIRMA))}" loading="eager" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
    HARITA: `<div class="harita" data-harita="${kacir(HARITA_GOMULU)}">
            <div class="harita__ic">
              <span class="harita__pin">${ikon('konum')}</span>
              <strong>${kacir(A.adres.satir)}<br>${kacir(A.adres.postaKodu + ' ' + A.adres.ilce + ' / ' + A.adres.il)}</strong>
              <p class="not">${t('Harita Google tarafından sunulur. Göstermek için düğmeye basın; bu durumda tarayıcınız Google\'a bağlanır.')}</p>
              <button class="dugme dugme--koyu harita__dugme" type="button">${ikon('konum')}${t('Haritayı göster')}</button>
            </div>
          </div>`,
    KONUM_PAYLAS: `<button class="eylem eylem--paylas" type="button" data-paylas data-baslik="${kacir(FIRMA)}" data-metin="${kacir(ADRES)}" data-url="${kacir(HARITA_AC)}">
              <span class="eylem__ikon">${ikon('paylas')}</span><span class="eylem__yazi"><b>${t('Konumu Paylaş')}</b><span data-paylas-durum aria-live="polite">${t('Bağlantıyı gönderin ya da kopyalayın')}</span></span>
            </button>`,
    HIZLI_ARIZA: `<ul class="hizli-ariza">\n` + K.ARIZA_KATEGORILERI.map((k, i) =>
      `            <li><a href="${kacir(K.waAdresi(K.hizliMesaj(k)))}" target="_blank" rel="noopener"><span class="hizli-ariza__no" aria-hidden="true">${i + 1}</span><span>${kacir(t(k))}<span class="gorunmez">${t(' — WhatsApp\'ta yaz (yeni sekme)')}</span></span>${ikon('ok', 'ikon--ok')}</a></li>`
    ).join('\n') + `\n          </ul>`,
    HIZMET_KARTLARI: A.servisTalebi.hizmetler.map((h, i) =>
      `              <label><input type="radio" name="hizmet" value="${kacir(h.ad)}"${i === 0 ? ' required' : ''}><span><span class="kartsec__no" aria-hidden="true">${i + 1}</span><span><b>${kacir(t(h.ad))}</b><small>${kacir(t(h.aciklama))}</small></span></span></label>`
    ).join('\n'),
    ACILIYET_SECENEK: A.servisTalebi.aciliyetler.map((a, i) =>
      `                <label><input type="radio" name="aciliyet" value="${kacir(a)}"${i === 0 ? ' required' : ''}><span>${kacir(t(a))}</span></label>`
    ).join('\n'),
    EKIPMAN_SECENEK: secenekler(A.servisTalebi.ekipmanlar, t),
    BOLGE_SECENEK: secenekler(A.bolgeler, yer),
    KATEGORI_SECENEK: secenekler(K.ARIZA_KATEGORILERI, t),
    GALERI: galeri.length
      ? `<ul class="galeri__izgara">\n` + galeri.map((g) =>
        `            <li data-anim="kart"><figure><img src="${kacir(g.dosya)}" width="${Number(g.en)}" height="${Number(g.boy)}" alt="${kacir(t(g.alt))}" loading="lazy" decoding="async">${g.aciklama ? `<figcaption>${kacir(t(g.aciklama))}</figcaption>` : ''}</figure></li>`
      ).join('\n') + `\n          </ul>`
      : `<div class="galeri__bos" data-anim="kart">
            <span class="ikon-kutu">${ikon('resim')}</span>
            <p><strong>${t('Atölye fotoğrafları bu alanda yayınlanacak.')}</strong>${t('Şimdilik arızalı parçanın ya da makinenin fotoğrafını WhatsApp\'tan gönderin; ön değerlendirme fotoğraf üzerinden yapılır.')}</p>
            <a class="dugme dugme--wa" href="${kacir(WA_HAZIR)}" target="_blank" rel="noopener">${ikon('wa')}${t('Fotoğraf gönder')}</a>
          </div>`,
    // Türkçe dışındaki dillerde: WhatsApp mesajının neden Türkçe olduğu ve KVKK metninin bağlayıcı sürümü
    WA_DIL_NOTU: tr ? '' : `<p class="not dil-notu">${t('WhatsApp mesajı, teknisyenimiz doğrudan okuyabilsin diye Türkçe hazırlanır; isterseniz kendi dilinizde ekleme yapabilirsiniz.')}</p>`,
    KVKK_DIL_NOTU: tr ? '' : `<p class="not dil-notu">${t('Bu çeviri bilgilendirme amaçlıdır; hukuken geçerli olan Türkçe metindir.')} <a class="metin-bag" href="../kvkk.html" hreflang="tr" lang="tr">KVKK Aydınlatma Metni (Türkçe)</a></p>`
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
      description: t('Ekskavatör, loder, beko loder, vinç ve diğer iş makineleri için hidrolik sistem, şanzıman ve tork konvertörü, dizel motor revizyonu; atölye ve yerinde saha servisi.'),
      telephone: '+' + A.telefon.e164,
      address: { '@type': 'PostalAddress', streetAddress: A.adres.satir, addressLocality: A.adres.ilce, addressRegion: A.adres.il, postalCode: A.adres.postaKodu, addressCountry: 'TR' },
      openingHoursSpecification: ACIK_SAATLER.map((s) => ({
        '@type': 'OpeningHoursSpecification', dayOfWeek: s.gunler.map((g) => GUN_EN[g]), opens: s.acilis, closes: s.kapanis
      })),
      areaServed: [{ '@type': 'AdministrativeArea', name: A.adres.il }, { '@type': 'City', name: 'Didim' }],
      employee: { '@type': 'Person', name: A.yetkili.ad, jobTitle: A.yetkili.unvan },
      hasOfferCatalog: {
        '@type': 'OfferCatalog', name: t('Hizmetler'),
        itemListElement: A.servisTalebi.hizmetler.map((h) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: t(h.ad) } }))
      }
    };
    if (A.adres.koordinat) veri.geo = { '@type': 'GeoCoordinates', latitude: A.adres.koordinat.enlem, longitude: A.adres.koordinat.boylam };
    if (alanAdi) { veri.url = alanAdi + '/' + dil.klasor; veri.image = alanAdi + '/assets/images/logo.jpg'; }
    return `<script type="application/ld+json">\n${JSON.stringify(veri, null, 2)}\n</script>`;
  }

  // ---------------------------------------------------------------- Sayfa iskeleti
  function ustBilgi(m, ad) {
    const canonical = alanAdi ? mutlak(ad, dil) : sayfaYolu(ad);
    const betikler = ['vendor/lenis.min.js', 'vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js', 'ayar.js']
      .concat(tr ? [] : ['dil-' + dil.kod + '.js'], ['cekirdek.js', 'site.js'], m.betikler || []);
    // Arama motorları için her dildeki karşılık (alan adı biliniyorsa mutlak, yoksa göreli)
    const karsiliklar = DILLER.map((d) => `<link rel="alternate" hreflang="${d.kod}" href="${kacir(alanAdi ? mutlak(ad, d) : dilYolu(ad, dil, d))}">`)
      .concat(`<link rel="alternate" hreflang="x-default" href="${kacir(alanAdi ? mutlak(ad, DILLER[0]) : dilYolu(ad, dil, DILLER[0]))}">`).join('\n');
    return `<!doctype html>
<html lang="${dil.kod}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${kacir(m.baslik)}</title>
<meta name="description" content="${kacir(parcaDoldur(m.aciklama))}">
<link rel="canonical" href="${kacir(canonical)}">
${karsiliklar}
${m.dizinleme === false ? '<meta name="robots" content="noindex, follow">\n' : ''}<meta name="theme-color" content="#101827">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="format-detection" content="telephone=no">
<meta property="og:type" content="website">
<meta property="og:locale" content="${dil.yer}">
${DILLER.filter((d) => d !== dil).map((d) => `<meta property="og:locale:alternate" content="${d.yer}">`).join('\n')}
<meta property="og:site_name" content="${kacir(FIRMA)}">
<meta property="og:title" content="${kacir(m.baslik)}">
<meta property="og:description" content="${kacir(parcaDoldur(m.aciklama))}">
${alanAdi ? `<meta property="og:url" content="${kacir(mutlak(ad, dil))}">
<meta property="og:image" content="${kacir(alanAdi + '/assets/images/logo.jpg')}">
<meta property="og:image:secure_url" content="${kacir(alanAdi + '/assets/images/logo.jpg')}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="800">
<meta property="og:image:alt" content="${kacir(t('{0} logosu', FIRMA))}">
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
    return MENU.map((s) => `        <li><a href="${sayfaYolu(s.ad)}"${s.ad === aktif ? ' aria-current="page"' : ''}>${t(s.yazi)}</a></li>`).join('\n') +
      `\n        <li class="menu__cta"><a href="servis-talebi.html"${aktif === 'servis-talebi' ? ' aria-current="page"' : ''}>${t('Servis Talebi')}</a></li>`;
  }

  // Dil seçici: JavaScript olmadan da çalışır (<details>); her dil kendi dilinde yazılır.
  function dilSecici(aktif) {
    return `<details class="dil">
      <summary class="dil__dugme">${ikon('dunya')}<span class="gorunmez">${t('Dil')}: ${dil.ad} — </span><span class="dil__kod" aria-hidden="true">${dil.kisa}</span>${ikon('asagi', 'dil__ok')}</summary>
      <ul class="dil__liste">
${DILLER.map((d) => `        <li><a href="${dilYolu(aktif, dil, d)}" hreflang="${d.kod}" lang="${d.kod}"${d === dil ? ' aria-current="true"' : ''}><span>${d.ad}</span><img class="dil__bayrak" src="assets/images/bayrak/${d.kod}.svg" width="24" height="16" alt=""></a></li>`).join('\n')}
      </ul>
    </details>`;
  }

  function govdeBasi(aktif) {
    return `<body>
<a class="atla" href="#icerik">${t('İçeriğe geç')}</a>
${ikonlar}
<header class="baslik">
  <div class="sar baslik__ic">
    <div class="baslik__sol">
      <a class="logo" href="./">
        <img src="assets/images/logo-isaret.webp" width="240" height="144" alt="">
        <span class="logo__yazi"><b>BAŞKENT</b> <span>İş Makinaları</span><span class="gorunmez">${t(' — Ana Sayfa')}</span></span>
      </a>
      ${rozet('rozet--baslik')}
    </div>
    ${dilSecici(aktif)}
    <nav class="menu" aria-label="${t('Ana menü')}">
      <button class="menu__dugme" type="button" aria-expanded="false" aria-controls="menuListe">
        <svg class="ikon menu__ikon-ac" aria-hidden="true"><use href="#i-menu"/></svg><svg class="ikon menu__ikon-kapa" aria-hidden="true"><use href="#i-kapat"/></svg><span class="menu__yazi">${t('Menü')}</span>
      </button>
      <ul class="menu__liste" id="menuListe" data-lenis-prevent>
${menuHtml(aktif)}
      </ul>
    </nav>
    <div class="baslik__eylem">
      <a class="dugme dugme--altin dugme--kucuk" href="${TEL_HREF}">${ikon('tel')}<span class="dugme__yazi">${t('Hemen Ara')}</span></a>
      <a class="dugme dugme--wa dugme--kucuk" href="${kacir(WA_HAZIR)}" target="_blank" rel="noopener">${ikon('wa')}<span class="dugme__yazi">WhatsApp</span></a>
    </div>
  </div>
</header>
<aside class="durum-serit" aria-label="${t('Atölye çalışma saatleri')}"><div class="sar">${rozet('rozet--serit')}</div></aside>
`;
  }

  function kapanis() {
    return `
  <section class="kapanis" aria-labelledby="kapanisBaslik">
    <div class="sar kapanis__kart" data-anim="kapanis">
      <div>
        <p class="etiket">${t('İletişim')}</p>
        <h2 id="kapanisBaslik">${t('Makineniz mi durdu? Hemen konuşalım.')}</h2>
        <span class="kapanis__cizgi" aria-hidden="true"></span>
        <p>${t('Telefonda ve WhatsApp\'ta muhatabınız {0} — {1}. Mesai dışında gelen arama ve mesajlara ilk mesai saatinde dönüş yapılır.', `<b>${parcalar.YETKILI}</b>`, parcalar.MUHATAP)}</p>
        ${parcalar.WA_DIL_NOTU}
      </div>
      <div class="kapanis__dugmeler">
        <a class="dugme dugme--altin dugme--buyuk" href="${TEL_HREF}">${ikon('tel')}${t('Hemen Ara')} <span class="sayi">${parcalar.TEL}</span></a>
        <a class="dugme dugme--wa dugme--buyuk" href="${kacir(WA_HAZIR)}" target="_blank" rel="noopener">${ikon('wa')}${t('WhatsApp\'tan yaz')}</a>
        <a class="dugme dugme--cizgi dugme--buyuk" href="servis-talebi.html">${t('Servis Talebi Oluştur')}${ikon('ok', 'ikon--ok')}</a>
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
        <p>${t('İş makinelerinde hidrolik sistem, şanzıman ve tork konvertörü, dizel motor revizyonu; yedek parça ve yağ tedariki; atölye ve yerinde saha servisi.')}</p>
      </div>
      <div>
        <h2>${t('Sayfalar')}</h2>
        <ul>
${MENU.concat([{ ad: 'servis-talebi', yazi: 'Servis Talebi' }]).map((s) => `          <li><a href="${sayfaYolu(s.ad)}">${t(s.yazi)}</a></li>`).join('\n')}
        </ul>
      </div>
      <div>
        <h2>${t('Atölye')}</h2>
        <ul>
${A.calismaSaatleri.map((s) => `          <li>${kacir(t(s.etiket))} ${s.acilis ? s.acilis + ' – ' + s.kapanis : t('kapalı')}</li>`).join('\n')}
          <li><b>${t('Saha servisi mesai saatlerinde')}</b></li>
        </ul>
      </div>
      <div>
        <h2>${t('İletişim')}</h2>
        <ul>
          <li><a class="sayi" href="${TEL_HREF}">${parcalar.TEL}</a></li>
          <li><a href="${kacir(WA_HAZIR)}" target="_blank" rel="noopener">WhatsApp</a></li>
          <li><a href="${kacir(HARITA_AC)}" target="_blank" rel="noopener">${parcalar.ADRES}</a></li>
          <li><a href="kvkk.html">${t('KVKK Aydınlatma Metni')}</a></li>
        </ul>
      </div>
    </div>
    <div class="alt__son">
      <span>© <span data-yil>${new Date().getFullYear()}</span> ${kacir(FIRMA)}</span>
      <span>${t('Hiçbir markanın yetkili servisi değildir.')}</span>
    </div>
  </div>
</footer>

<aside class="hizli" aria-label="${t('Hızlı iletişim')}">
  <a class="hizli__ara" href="${TEL_HREF}">${ikon('tel')}${t('Ara')}</a>
  <a class="hizli__wa" href="${kacir(WA_HAZIR)}" target="_blank" rel="noopener">${ikon('wa')}WhatsApp</a>
</aside>

<dialog class="tel-pencere" id="telPencere" aria-labelledby="telPencereBaslik">
  <form method="dialog" class="tel-pencere__ic">
    <p class="etiket" id="telPencereBaslik">${t('Telefon')} · ${parcalar.YETKILI}</p>
    <p class="tel-pencere__numara sayi">${parcalar.TEL}</p>
    <p class="tel-pencere__not">${parcalar.UNVAN}. ${t('Bilgisayardan arama yapılamıyorsa numarayı kopyalayıp telefonunuzdan arayın.')}</p>
    <div class="tel-pencere__dugmeler">
      <button class="dugme dugme--altin" type="button" data-kopyala="${kacir(A.telefon.gorunen)}">${ikon('kopya')}<span>${t('Numarayı kopyala')}</span></button>
      <a class="dugme dugme--cizgi" href="${TEL_HREF}" data-tel-dogrudan>${ikon('tel')}${t('Ara')}</a>
      <button class="dugme dugme--cizgi" value="kapat">${ikon('kapat')}${t('Kapat')}</button>
    </div>
  </form>
</dialog>
</body>
</html>
`;
  }

  function sayfaUret(ad) {
    const dosya = path.join(KOK, 'kaynak/sayfalar', dil.klasor, ad + '.html');
    if (!fs.existsSync(dosya)) throw new Error(path.relative(KOK, dosya) + ' yok: sayfanın bu dildeki çevirisi gerekli.');
    const kaynak = fs.readFileSync(dosya, 'utf8');
    const es = kaynak.match(/^<!--\s*(\{[\s\S]*?\})\s*-->\s*/);
    if (!es) throw new Error(path.relative(KOK, dosya) + ': sayfa başında meta yorum yok');
    const m = JSON.parse(es[1]);
    const icerik = parcaDoldur(kaynak.slice(es[0].length)).trimEnd();
    let html = ustBilgi(m, ad) + '\n' + govdeBasi(ad) + '\n<main id="icerik">\n' + icerik + '\n' + (m.kapanis === false ? '' : kapanis() + '\n') + '</main>\n' + altBilgi();
    // Alt klasördeki dillerde site varlıkları bir üst klasörden okunur
    if (dil.klasor) html = html.replace(/(\s(?:src|href)=")(?=assets\/|favicon\.svg"|manifest\.webmanifest")/g, '$1../');
    return html;
  }

  const cikti = SAYFALAR.map((ad) => [dil.klasor + ad + '.html', sayfaUret(ad)]);
  if (!tr) {
    const fazla = t.kullanilmayan();
    if (fazla.length) throw new Error('kaynak/ceviri/' + dil.kod + '.json → "uretec" içinde kullanılmayan çeviri: "' + fazla.join('", "') + '"');
    cikti.push(['assets/js/dil-' + dil.kod + '.js', '/* kaynak/ceviri/' + dil.kod + '.json\'dan üretildi — elle düzenlemeyin; node araclar/sayfa-uret.js */\n' +
      'window.BaskentDil = ' + JSON.stringify({ kod: dil.kod, metin: sozluk.betik }, null, 2) + ';\n']);
  }
  return { cikti, parcalar };
}

// ---------------------------------------------------------------- WhatsApp kart sayfaları (kart/<ad>/)
// Müşteriye giden mesajın ikinci satırındaki bağlantı buraya gelir. WhatsApp bu sayfanın og etiketlerinden
// görselli kartı çizer; karta dokunan kişi de bu sayfayı açar. Betik yok: telefonun uygulama içi tarayıcısında
// anında açılır. Arama motorlarına kapalıdır (içerik hizmetlerimiz sayfasının kopyası olmasın).
const KART_KOK = '../../';
function kartYolu(kart) { return 'kart/' + kart + '/'; }
function kartSayfasi(kart, no, parcalar) {
  const genel = no === 0;
  const adres = alanAdi ? alanAdi + '/' + kartYolu(kart.kart) : '';
  const gorsel = alanAdi + '/assets/images/kart/' + kart.kart + '.jpg';
  const baslik = kart.ad + ' — ' + FIRMA;
  const aciklama = kart.aciklama + '. ' + A.adres.ilce + ' / ' + A.adres.il + ' — atölye ve mesai saatlerinde saha servisi.';
  const talep = KART_KOK + 'servis-talebi.html' + (genel ? '' : '?hizmet=' + no);
  const etiket = genel ? 'Servis kartı' : 'Hizmet · Kart ' + String(no).padStart(2, '0');
  const digerleri = K.KARTLAR.filter((k) => k.kart !== kart.kart);
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${kacir(baslik)}</title>
<meta name="description" content="${kacir(aciklama)}">
<link rel="canonical" href="${kacir(adres || './')}">
<meta name="robots" content="noindex, follow">
<meta name="theme-color" content="#101827">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="format-detection" content="telephone=no">
<meta property="og:type" content="website">
<meta property="og:locale" content="tr_TR">
<meta property="og:site_name" content="${kacir(FIRMA)}">
<meta property="og:title" content="${kacir(baslik)}">
<meta property="og:description" content="${kacir(aciklama)}">
${alanAdi ? `<meta property="og:url" content="${kacir(adres)}">
<meta property="og:image" content="${kacir(gorsel)}">
<meta property="og:image:secure_url" content="${kacir(gorsel)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${kacir(kart.ad + ' — ' + kart.aciklama)}">
<meta name="twitter:card" content="summary_large_image">
` : '<meta name="twitter:card" content="summary">\n'}<link rel="icon" href="${KART_KOK}favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${KART_KOK}assets/icons/apple-touch-icon.png">
<link rel="preload" href="${KART_KOK}assets/fonts/archivo-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${KART_KOK}assets/css/site.css">
</head>
<body class="kartsayfa">
<a class="atla" href="#icerik">İçeriğe geç</a>
${ikonlar}
<header class="kartsayfa__ust sar">
  <a class="logo" href="${KART_KOK}">
    <img src="${KART_KOK}assets/images/logo-isaret.webp" width="240" height="144" alt="">
    <span class="logo__yazi"><b>BAŞKENT</b> <span>İş Makinaları</span><span class="gorunmez"> — Ana Sayfa</span></span>
  </a>
  <a class="kartsayfa__site" href="${KART_KOK}hizmetlerimiz.html">Tüm hizmetler${ikon('ok', 'ikon--ok')}</a>
</header>

<main id="icerik" class="sar kartsayfa__ana">
  <article class="kartsayfa__kart">
    <div class="kartsayfa__metin">
      <p class="etiket">${kacir(etiket)}</p>
      <h1>${kacir(kart.ad).replace(/ \/ /g, '&nbsp;/ ')}</h1>
      <p class="kartsayfa__aciklama">${kacir(kart.aciklama)}</p>
    </div>
    <div class="kartsayfa__pano" aria-hidden="true">
      <svg class="kartsayfa__sekil"><use href="#i-${kacir(kart.ikon)}"/></svg>
      <span class="kartsayfa__olcu"><span>${kacir(A.adres.ilce)} / ${kacir(A.adres.il)}</span></span>
    </div>
  </article>

  <div class="kartsayfa__dugmeler">
    <a class="dugme dugme--wa dugme--buyuk" href="${kacir(K.waAdresi(K.hizmetMesaji(kart.ad)))}" target="_blank" rel="noopener">${ikon('wa')}${genel ? 'WhatsApp\'tan yaz' : 'Bu hizmet için WhatsApp\'tan yaz'}</a>
    <a class="dugme dugme--altin dugme--buyuk" href="${TEL_HREF}">${ikon('tel')}Hemen Ara <span class="sayi">${parcalar.TEL}</span></a>
    <a class="dugme dugme--cizgi dugme--buyuk" href="${talep}">Servis talebi oluştur${ikon('ok', 'ikon--ok')}</a>
  </div>

  <dl class="kartsayfa__bilgi">
    <div><dt>${ikon('konum')}Atölye</dt><dd><a href="${kacir(HARITA_AC)}" target="_blank" rel="noopener">${parcalar.ADRES}</a></dd></div>
    <div><dt>${ikon('saat')}Çalışma saatleri</dt><dd>${parcalar.SAAT_OZET}<br>${parcalar.KAPALI_OZET} · Saha servisi ${kacir(A.sahaServisi.toLocaleLowerCase('tr'))}</dd></div>
    <div><dt>${ikon('tel')}Muhatap</dt><dd>${parcalar.YETKILI} — ${parcalar.UNVAN}</dd></div>
  </dl>

  <p class="kartsayfa__detay"><a class="metin-bag" href="${KART_KOK}${kacir(kart.detay)}">${genel ? 'Hizmetlerimizi inceleyin' : 'Bu hizmetin ayrıntıları'}</a></p>

  <nav class="kartsayfa__diger" aria-labelledby="digerBaslik">
    <h2 id="digerBaslik">Diğer kartlar</h2>
    <ul>
${digerleri.map((k) => `      <li><a href="${KART_KOK}${kartYolu(k.kart)}">${ikon(k.ikon)}<span>${kacir(k.ad)}</span></a></li>`).join('\n')}
    </ul>
  </nav>
</main>

<footer class="kartsayfa__alt sar">
  <span>© <span data-yil>${new Date().getFullYear()}</span> ${kacir(FIRMA)}</span>
  <a href="${KART_KOK}kvkk.html">KVKK Aydınlatma Metni</a>
</footer>
</body>
</html>
`;
}

// ---------------------------------------------------------------- Yaz (önce hepsi hazırlanır, sonra yazılır: hata olursa yarım çıktı kalmaz)
const cikti = [];
const uretilen = DILLER.map(dilUret);
uretilen.forEach((u) => cikti.push(...u.cikti));
// Kart sayfaları Türkçedir: Türkçe WhatsApp mesajındaki bağlantıdan açılırlar
K.KARTLAR.forEach((k, i) => {
  if (!fs.existsSync(path.join(KOK, 'assets/images/kart', k.kart + '.jpg'))) {
    throw new Error('Kart görseli yok: assets/images/kart/' + k.kart + '.jpg — önce node araclar/kart-gorsel-uret.js');
  }
  cikti.push([kartYolu(k.kart) + 'index.html', kartSayfasi(k, i, uretilen[0].parcalar)]);
});
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
  cikti.push(['sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    DILLER.map((dil) => SAYFALAR.map((ad) => `  <url><loc>${mutlak(ad, dil)}</loc><lastmod>${tarih}</lastmod>` +
      DILLER.map((d) => `<xhtml:link rel="alternate" hreflang="${d.kod}" href="${mutlak(ad, d)}"/>`).join('') + '</url>').join('\n')).join('\n') + '\n</urlset>\n']);
}

// Önce hepsi geçici dosyaya yazılır; biri bile yazılamazsa geçiciler silinir ve mevcut site olduğu gibi kalır.
const gecici = [];
try {
  cikti.forEach(([dosya, icerik]) => {
    const g = path.join(KOK, dosya + '.yeni');
    fs.mkdirSync(path.dirname(g), { recursive: true });
    fs.writeFileSync(g, icerik);
    gecici.push(g);
  });
} catch (hata) {
  gecici.forEach((g) => { try { fs.unlinkSync(g); } catch (silinemedi) { /* yok say */ } });
  throw new Error('Yazılamadı, hiçbir dosya değiştirilmedi: ' + hata.message);
}
cikti.forEach(([dosya]) => fs.renameSync(path.join(KOK, dosya + '.yeni'), path.join(KOK, dosya)));
// Config'den kaldırılmış kartların eski sayfaları silinir (yayında ölü kart kalmasın)
const kartKlasoru = path.join(KOK, 'kart');
if (fs.existsSync(kartKlasoru)) {
  fs.readdirSync(kartKlasoru).filter((d) => !K.KARTLAR.some((k) => k.kart === d))
    .forEach((d) => fs.rmSync(path.join(kartKlasoru, d), { recursive: true, force: true }));
}
const haritaDosya = path.join(KOK, 'sitemap.xml');
if (!alanAdi && fs.existsSync(haritaDosya)) fs.unlinkSync(haritaDosya);

console.log('Yazıldı: ' + cikti.length + ' dosya (' + DILLER.map((d) => d.kod).join(', ') + ')' + (alanAdi ? '' : '\n(alan adı yok: sitemap.xml üretilmedi, canonical göreli)'));
