/* Başkent İş Makinaları — iş mantığı (DOM'a dokunmaz; tests/ klasöründeki testler doğrudan bunu çalıştırır).
 * Telefon, mesajlar, saatler ve seçenek listeleri site.config.json'dan gelir: Node'da doğrudan okunur,
 * tarayıcıda sayfa üretecinin yazdığı assets/js/ayar.js (window.BaskentAyar) üzerinden. */
(function (kok) {
  'use strict';

  var nodeda = typeof module === 'object' && module.exports;
  var AYAR = nodeda ? require('../../site.config.json') : kok.BaskentAyar;
  if (!AYAR) throw new Error('Site ayarları yüklenmedi (assets/js/ayar.js).');

  var TELEFON = AYAR.telefon.e164;
  var TELEFON_GORUNEN = AYAR.telefon.gorunen;
  var WA_NUMARA = AYAR.whatsapp.numara;
  var KARSILAMA = AYAR.whatsapp.karsilama;
  var GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  var GUN_KISA = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  var ACIKLAMA_SINIRI = 600;
  var ARIZA_KATEGORILERI = AYAR.arizaKategorileri.slice();
  var DIGER = ARIZA_KATEGORILERI[ARIZA_KATEGORILERI.length - 1];
  var HIZMETLER = AYAR.servisTalebi.hizmetler.map(function (h) { return h.ad; });
  var EKIPMANLAR = AYAR.servisTalebi.ekipmanlar.slice();
  var ACILIYETLER = AYAR.servisTalebi.aciliyetler.slice();
  var BOLGELER = AYAR.bolgeler.slice();
  var bicimleyici = null;

  function dakikaOku(metin) {
    var p = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(metin));
    if (!p) throw new Error('Saat "SS:DD" biçiminde olmalı: ' + metin);
    return Number(p[1]) * 60 + Number(p[2]);
  }

  // getDay() sırasıyla (0 = Pazar). Günün dakikası olarak [açılış, kapanış]; null = kapalı.
  // Atölye ve saha servisi aynı mesai saatlerinde çalışır.
  var SAATLER = [null, null, null, null, null, null, null];
  AYAR.calismaSaatleri.forEach(function (s) {
    s.gunler.forEach(function (g) { SAATLER[g] = s.acilis ? [dakikaOku(s.acilis), dakikaOku(s.kapanis)] : null; });
  });

  // Atölye Milas'ta: durum ziyaretçinin bulunduğu yerden bağımsız olarak Türkiye saatiyle hesaplanır.
  function istanbulZamani(tarih) {
    if (!bicimleyici) {
      bicimleyici = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Istanbul', weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      });
    }
    var p = {};
    bicimleyici.formatToParts(tarih).forEach(function (parca) { p[parca.type] = parca.value; });
    var saat = Number(p.hour) % 24;
    return { gun: GUN_KISA[p.weekday], dakika: saat * 60 + Number(p.minute), yil: p.year };
  }

  function iki(sayi) { return String(sayi).padStart(2, '0'); }

  function saatYaz(dakika) {
    return iki(Math.floor(dakika / 60)) + ':' + iki(dakika % 60);
  }

  // { acik, baslik, alt, ek } döner. z: { gun: 0-6, dakika: 0-1439 }
  function durumHesapla(z) {
    var bugun = SAATLER[z.gun];
    if (bugun && z.dakika >= bugun[0] && z.dakika < bugun[1]) {
      return { acik: true, baslik: 'Atölye Açık', alt: 'Hizmete Hazır', ek: 'Bugün kapanış ' + saatYaz(bugun[1]) };
    }
    for (var fark = 0; fark <= 7; fark++) {
      var g = (z.gun + fark) % 7;
      var s = SAATLER[g];
      if (!s || (fark === 0 && z.dakika >= s[0])) continue;
      var hangiGun = fark === 0 ? 'bugün' : fark === 1 ? 'yarın' : GUNLER[g];
      return { acik: false, baslik: 'Atölye Kapalı', alt: 'İlk Mesai Saatinde Dönüş Yapılacak', ek: 'Açılış: ' + hangiGun + ' ' + saatYaz(s[0]) };
    }
    return { acik: false, baslik: 'Atölye Kapalı', alt: 'İlk Mesai Saatinde Dönüş Yapılacak', ek: '' };
  }

  function tekSatir(deger) {
    return String(deger == null ? '' : deger).replace(/\s+/g, ' ').trim();
  }

  function cokSatir(deger) {
    return String(deger == null ? '' : deger)
      .replace(/\r\n?/g, '\n')
      .split('\n').map(function (s) { return s.replace(/[ \t]+/g, ' ').trim(); }).join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, ACIKLAMA_SINIRI);
  }

  function sayiMi(x) { return typeof x === 'number' && isFinite(x); }

  // Seçilen konumun Google Haritalar bağlantısı. Geçersiz koordinatta boş metin döner.
  function konumBaglantisi(enlem, boylam) {
    if (!sayiMi(enlem) || !sayiMi(boylam) || Math.abs(enlem) > 90 || Math.abs(boylam) > 180) return '';
    return 'https://maps.google.com/?q=' + enlem.toFixed(6) + ',' + boylam.toFixed(6);
  }

  // v: { hizmet, ekipman, aciliyet, bolge, kategori, ad, telefon, makine, konum: {enlem, boylam, dogruluk} | null, aciklama }
  // Şablon: başlık → dört zorunlu satır → yalnızca doldurulan ek bilgiler → kapanış cümlesi.
  function talepMetni(v) {
    var satirlar = [AYAR.whatsapp.talepBasligi, ''];
    function ekle(etiket, deger) { if (deger) satirlar.push('*' + etiket + ':* ' + deger); }
    ekle('Talep Türü', tekSatir(v.hizmet));
    ekle('Ekipman', tekSatir(v.ekipman));
    ekle('Aciliyet', tekSatir(v.aciliyet));
    ekle('Bölge', tekSatir(v.bolge));
    ekle('Arıza', tekSatir(v.kategori));
    ekle('Marka / model', tekSatir(v.makine));
    ekle('Ad soyad', tekSatir(v.ad));
    ekle('Telefon', tekSatir(v.telefon));
    if (v.konum) {
      var bag = konumBaglantisi(v.konum.enlem, v.konum.boylam);
      if (bag) ekle('Konum', bag + (sayiMi(v.konum.dogruluk) ? ' (±' + Math.round(v.konum.dogruluk) + ' m)' : ''));
    }
    var aciklama = cokSatir(v.aciklama);
    if (aciklama) satirlar.push('*Açıklama:*', aciklama);
    satirlar.push('', AYAR.whatsapp.talepKapanisi);
    return kartla(satirlar.join('\n'), hizmetKarti(tekSatir(v.hizmet)));
  }

  // ---------------------------------------------------------------- WhatsApp kartları
  // wa.me yalnızca düz metin taşır. Mesajın ikinci satırına kartın bağlantısı konur; WhatsApp bu bağlantıyı
  // görselli bir önizleme kartına çevirir (önizleme, mesajdaki İLK bağlantıdan üretilir — bu yüzden en üstte).
  // Alan adı bilinmiyorsa bağlantı eklenmez, mesaj düz metin kalır.
  var ALAN_ADI = String(AYAR.alanAdi || '').replace(/\/+$/, '');
  var KARTLAR = [AYAR.whatsapp.genelKart].concat(AYAR.servisTalebi.hizmetler);
  var GENEL_KART = AYAR.whatsapp.genelKart.kart;

  function kartAdresi(kart) {
    if (!ALAN_ADI || !kart) return '';
    return ALAN_ADI + '/kart/' + kart + '/';
  }

  function hizmetKarti(hizmetAdi) {
    for (var i = 0; i < AYAR.servisTalebi.hizmetler.length; i++) {
      if (AYAR.servisTalebi.hizmetler[i].ad === hizmetAdi) return AYAR.servisTalebi.hizmetler[i].kart;
    }
    return GENEL_KART;
  }

  function kartla(metin, kart) {
    var adres = kartAdresi(kart);
    if (!adres) return metin;
    var satirlar = String(metin).split('\n');
    satirlar.splice(1, 0, adres);
    return satirlar.join('\n');
  }

  // Genel WhatsApp düğmelerinin mesajı: karşılama + genel servis kartı
  var KARSILAMA_KARTLI = kartla(KARSILAMA, GENEL_KART);
  // Yedek parça / yağ fiyatı mesajı + parça kartı
  var PARCA_MESAJI = kartla(AYAR.whatsapp.parcaTalebi, AYAR.whatsapp.parcaKart);

  // WhatsApp hızlı arıza kartları: karşılama + genel kart + seçilen başlık
  function hizliMesaj(kategori) {
    return kategori ? KARSILAMA_KARTLI + '\n\n*Arıza:* ' + tekSatir(kategori) : KARSILAMA_KARTLI;
  }

  // Tek bir hizmetin kart sayfasındaki "WhatsApp'tan yaz" mesajı
  function hizmetMesaji(hizmetAdi) {
    var h = tekSatir(hizmetAdi);
    var genel = !h || h === AYAR.whatsapp.genelKart.ad;
    return kartla(KARSILAMA + (genel ? '' : '\n\n*Hizmet:* ' + h), hizmetKarti(h));
  }

  function waAdresi(metin) {
    return 'https://wa.me/' + WA_NUMARA + '?text=' + encodeURIComponent(metin);
  }

  // Masaüstünde wa.me yerine doğrudan WhatsApp Web açılır (kurulu WhatsApp Desktop bu adresi devralabilir).
  function waMasaustuAdresi(adres) {
    var p = /^https:\/\/wa\.me\/(\d+)(?:\?text=([^#]*))?$/.exec(String(adres || ''));
    if (!p) return adres;
    return 'https://web.whatsapp.com/send?phone=' + p[1] + (p[2] ? '&text=' + p[2] : '');
  }

  // Telefon: boş olabilir; doluysa 10-13 hane olmalı
  function telefonGecerliMi(deger) {
    var haneler = String(deger || '').replace(/\D/g, '');
    return haneler.length === 0 || (haneler.length >= 10 && haneler.length <= 13);
  }

  // Servis talebi doğrulaması: { alan: 'hata metni' } döner; boş nesne = geçerli.
  // Zorunlu: talep türü, ekipman, aciliyet, bölge. "Diğer" arızası seçilirse açıklama da gerekir.
  function talepDogrula(v) {
    var hatalar = {};
    if (HIZMETLER.indexOf(v.hizmet) === -1) hatalar.hizmet = 'Talep türünü seçin.';
    if (EKIPMANLAR.indexOf(v.ekipman) === -1) hatalar.ekipman = 'Ekipmanı seçin.';
    if (ACILIYETLER.indexOf(v.aciliyet) === -1) hatalar.aciliyet = 'Aciliyeti seçin.';
    if (BOLGELER.indexOf(v.bolge) === -1) hatalar.bolge = 'Bölgeyi seçin.';
    if (!telefonGecerliMi(v.telefon)) hatalar.telefon = 'Telefonu 05xx xxx xx xx biçiminde yazın ya da boş bırakın.';
    if (v.kategori && ARIZA_KATEGORILERI.indexOf(v.kategori) === -1) hatalar.kategori = 'Listeden bir arıza seçin.';
    if (v.kategori === DIGER && cokSatir(v.aciklama).length < 5) hatalar.aciklama = '"Diğer" seçtiğinizde arızayı kısaca yazın.';
    if (String(v.aciklama || '').length > ACIKLAMA_SINIRI) hatalar.aciklama = 'Açıklama en fazla ' + ACIKLAMA_SINIRI + ' karakter olabilir.';
    return hatalar;
  }

  // Sayfa bir çerçevenin (iframe) içindeyse tel: bağlantıları yeni bağlamda açılır; aksi hâlde
  // bazı önizlemelerde arama ekranı hiç açılmaz.
  function cerceveIcindeMi(pencere) {
    try { return pencere.self !== pencere.top; } catch (hata) { return true; }
  }
  function telBaglantilariniAyarla(baglantilar, cerceveIcinde) {
    if (!cerceveIcinde) return 0;
    var sayi = 0;
    Array.prototype.forEach.call(baglantilar, function (a) {
      if (String(a.getAttribute('href') || '').indexOf('tel:') !== 0) return;
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
      sayi += 1;
    });
    return sayi;
  }

  var api = {
    AYAR: AYAR, TELEFON: TELEFON, TELEFON_GORUNEN: TELEFON_GORUNEN, KARSILAMA: KARSILAMA, SAATLER: SAATLER, GUNLER: GUNLER,
    ACIKLAMA_SINIRI: ACIKLAMA_SINIRI, ARIZA_KATEGORILERI: ARIZA_KATEGORILERI, DIGER: DIGER,
    HIZMETLER: HIZMETLER, EKIPMANLAR: EKIPMANLAR, ACILIYETLER: ACILIYETLER, BOLGELER: BOLGELER,
    dakikaOku: dakikaOku, istanbulZamani: istanbulZamani, saatYaz: saatYaz, durumHesapla: durumHesapla,
    konumBaglantisi: konumBaglantisi, talepMetni: talepMetni, talepDogrula: talepDogrula, hizliMesaj: hizliMesaj,
    KARTLAR: KARTLAR, KARSILAMA_KARTLI: KARSILAMA_KARTLI, PARCA_MESAJI: PARCA_MESAJI,
    kartAdresi: kartAdresi, hizmetKarti: hizmetKarti, kartla: kartla, hizmetMesaji: hizmetMesaji,
    waAdresi: waAdresi, waMasaustuAdresi: waMasaustuAdresi, telefonGecerliMi: telefonGecerliMi,
    cerceveIcindeMi: cerceveIcindeMi, telBaglantilariniAyarla: telBaglantilariniAyarla
  };
  if (nodeda) module.exports = api;
  else kok.Baskent = api;
})(typeof window !== 'undefined' ? window : globalThis);
