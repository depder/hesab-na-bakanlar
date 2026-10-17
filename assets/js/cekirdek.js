/* Başkent İş Makinaları — iş mantığı (DOM'a dokunmaz; tests/ klasöründeki testler doğrudan bunu çalıştırır). */
(function (kok) {
  'use strict';

  var TELEFON = '905380773571';
  var TELEFON_GORUNEN = '0538 077 35 71';
  var KARSILAMA = 'Merhaba. Başkent iş Makinalarından Servis bilgisi Almak İstiyorum.';
  var GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  // getDay() sırasıyla (0 = Pazar). Günün dakikası olarak [açılış, kapanış]; null = kapalı.
  // Bunlar ATÖLYE saatleridir; 7/24 saha servisi bu saatlerden bağımsızdır.
  var SAATLER = [null, [540, 1050], [540, 1050], [540, 1050], [540, 1050], [540, 1050], [540, 810]];
  var GUN_KISA = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  var ACIKLAMA_SINIRI = 600;
  var DIGER = 'Diğer (Kendi arızamı yazmak istiyorum)';
  var ARIZA_KATEGORILERI = [
    'Hidrolik sistemde güç kaybı, yavaşlama veya ana pompa kaçağı',
    'İş makinası şanzıman / tork konvertörü arızası ve yürümeme',
    'Motor çekiş düşüklüğü, siyah/beyaz duman veya turbo arızası',
    'Palet yürüyüş hidromotoru / redüktör arızası veya kule dönüş problemi',
    'Hidrolik pompa ötmesi, uğultusu veya ses yapması (Kavitasyon/Emiş)',
    DIGER
  ];
  var bicimleyici = null;

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
    return { gun: GUN_KISA[p.weekday], dakika: saat * 60 + Number(p.minute), yil: p.year, ay: p.month, gunNo: p.day, saat: saat, dk: Number(p.minute) };
  }

  function iki(sayi) { return String(sayi).padStart(2, '0'); }

  function saatYaz(dakika) {
    return iki(Math.floor(dakika / 60)) + ':' + iki(dakika % 60);
  }

  // { acik, baslik, alt, ek } döner. z: { gun: 0-6, dakika: 0-1439 }
  function durumHesapla(z) {
    var bugun = SAATLER[z.gun];
    if (bugun && z.dakika >= bugun[0] && z.dakika < bugun[1]) {
      return { acik: true, baslik: 'Açık', alt: 'Atölye Hizmet Veriyor', ek: 'Bugün kapanış ' + saatYaz(bugun[1]) };
    }
    for (var fark = 0; fark <= 7; fark++) {
      var g = (z.gun + fark) % 7;
      var s = SAATLER[g];
      if (!s || (fark === 0 && z.dakika >= s[0])) continue;
      var hangiGun = fark === 0 ? 'bugün' : fark === 1 ? 'yarın' : GUNLER[g];
      return { acik: false, baslik: 'Kapalı', alt: 'İlk Mesai Saatinde Dönüş Yapılacak', ek: 'İlk mesai: ' + hangiGun + ' ' + saatYaz(s[0]) };
    }
    return { acik: false, baslik: 'Kapalı', alt: 'İlk Mesai Saatinde Dönüş Yapılacak', ek: '' };
  }

  // İş emri numarası: BK-YYAAGG-SSDD (Türkiye saatiyle)
  function isEmriNo(z) {
    return 'BK-' + String(z.yil).slice(-2) + z.ay + z.gunNo + '-' + iki(z.saat) + iki(z.dk);
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

  // v: { ad, telefon, makineTuru, marka, model, seriNo, kategori, aciliyet, adres, konum: {enlem, boylam, dogruluk} | null, aciklama }
  // Yalnızca doldurulan alanlar mesaja girer; konum yalnızca kullanıcı "konumumu ekle" dediyse vardır.
  function isEmriMetni(v, no) {
    var satirlar = [KARSILAMA, '', '*SERVİS TALEBİ · ' + no + '*'];
    function ekle(etiket, deger) { if (deger) satirlar.push('*' + etiket + ':* ' + deger); }
    ekle('Ad soyad', tekSatir(v.ad));
    ekle('Telefon', tekSatir(v.telefon));
    ekle('Makine türü', tekSatir(v.makineTuru));
    ekle('Marka / model', [tekSatir(v.marka), tekSatir(v.model)].filter(Boolean).join(' '));
    ekle('Seri no', tekSatir(v.seriNo));
    ekle('Arıza', tekSatir(v.kategori));
    ekle('Aciliyet', tekSatir(v.aciliyet));
    ekle('Adres', tekSatir(v.adres));
    if (v.konum) {
      var bag = konumBaglantisi(v.konum.enlem, v.konum.boylam);
      if (bag) ekle('Konum', bag + (sayiMi(v.konum.dogruluk) ? ' (±' + Math.round(v.konum.dogruluk) + ' m)' : ''));
    }
    var aciklama = cokSatir(v.aciklama);
    if (aciklama) satirlar.push('*Arıza açıklaması:*', aciklama);
    return satirlar.join('\n');
  }

  // WhatsApp hızlı arıza kartları: karşılama + seçilen başlık
  function hizliMesaj(kategori) {
    return kategori ? KARSILAMA + '\n\n*Arıza:* ' + tekSatir(kategori) : KARSILAMA;
  }

  function waAdresi(metin) {
    return 'https://wa.me/' + TELEFON + '?text=' + encodeURIComponent(metin);
  }

  // Telefon: boş olabilir; doluysa 10-13 hane olmalı
  function telefonGecerliMi(deger) {
    var haneler = String(deger || '').replace(/\D/g, '');
    return haneler.length === 0 || (haneler.length >= 10 && haneler.length <= 13);
  }

  // Form doğrulaması: { alanAdi: 'hata metni' } döner; boş nesne = geçerli.
  // Zorunlu: ad soyad ve arıza kategorisi. "Diğer" seçilirse açıklama da gerekir.
  function dogrula(v) {
    var hatalar = {};
    if (tekSatir(v.ad).length < 2) hatalar.ad = 'Adınızı ve soyadınızı yazın.';
    if (!telefonGecerliMi(v.telefon)) hatalar.telefon = 'Telefonu 05xx xxx xx xx biçiminde yazın ya da boş bırakın.';
    if (ARIZA_KATEGORILERI.indexOf(v.kategori) === -1) hatalar.kategori = 'Arıza kategorisini seçin.';
    else if (v.kategori === DIGER && cokSatir(v.aciklama).length < 5) hatalar.aciklama = '"Diğer" seçtiğinizde arızayı kısaca yazın.';
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
    TELEFON: TELEFON, TELEFON_GORUNEN: TELEFON_GORUNEN, KARSILAMA: KARSILAMA, SAATLER: SAATLER, GUNLER: GUNLER,
    ACIKLAMA_SINIRI: ACIKLAMA_SINIRI, ARIZA_KATEGORILERI: ARIZA_KATEGORILERI, DIGER: DIGER,
    istanbulZamani: istanbulZamani, saatYaz: saatYaz, durumHesapla: durumHesapla, isEmriNo: isEmriNo,
    konumBaglantisi: konumBaglantisi, isEmriMetni: isEmriMetni, hizliMesaj: hizliMesaj, waAdresi: waAdresi,
    telefonGecerliMi: telefonGecerliMi, dogrula: dogrula,
    cerceveIcindeMi: cerceveIcindeMi, telBaglantilariniAyarla: telBaglantilariniAyarla
  };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else kok.Baskent = api;
})(typeof window !== 'undefined' ? window : globalThis);
