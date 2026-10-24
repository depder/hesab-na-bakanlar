/* Başkent İş Makinaları — servis talebi kartları.
 * Sitenin sunucusu yok: sayfa hiçbir yere veri GÖNDERMEZ ve KAYDETMEZ. Son adımdaki düğme yalnızca, seçilen bilgilerden
 * hazır bir WhatsApp mesajı oluşturur; mesaj, ziyaretçi WhatsApp'ta kendisi gönderince iletilir. */
(function () {
  'use strict';
  var B = window.Baskent;
  var form = document.getElementById('talepFormu');
  if (!B || !form) return;

  var el = function (id) { return document.getElementById(id); };
  var ozet = el('hataOzeti');
  var ozetListe = el('hataOzetiListe');
  var basari = el('gonderimSonucu');
  var waYedek = el('waYedek');
  var gonderDugme = el('gonderDugme');
  var onizleme = el('biletMetin');
  var ekBilgi = el('ekBilgi');
  var aciklama = form.elements.aciklama;
  var sayac = el('aciklamaSayac');
  var konum = null; // yalnızca bellekte; sayfa kapanınca kaybolur

  // Sıra, hata özetindeki sıradır (sayfadaki sırayla aynı)
  var ALANLAR = {
    hizmet: { kutu: 'alanHizmet', hata: 'hataHizmet', odak: function () { return form.querySelector('input[name="hizmet"]'); } },
    ekipman: { kutu: 'alanEkipman', hata: 'hataEkipman', odak: function () { return form.elements.ekipman; } },
    bolge: { kutu: 'alanBolge', hata: 'hataBolge', odak: function () { return form.elements.bolge; } },
    aciliyet: { kutu: 'alanAciliyet', hata: 'hataAciliyet', odak: function () { return form.querySelector('input[name="aciliyet"]'); } },
    kategori: { kutu: 'alanKategori', hata: 'hataKategori', ek: true, odak: function () { return form.elements.kategori; } },
    telefon: { kutu: 'alanTelefon', hata: 'hataTelefon', ek: true, odak: function () { return form.elements.telefon; } },
    aciklama: { kutu: 'alanAciklama', hata: 'hataAciklama', ek: true, odak: function () { return aciklama; } }
  };

  function secili(ad) { var s = form.querySelector('input[name="' + ad + '"]:checked'); return s ? s.value : ''; }

  function degerler() {
    return {
      hizmet: secili('hizmet'),
      ekipman: form.elements.ekipman.value,
      aciliyet: secili('aciliyet'),
      bolge: form.elements.bolge.value,
      kategori: form.elements.kategori.value,
      makine: form.elements.makine.value,
      ad: form.elements.ad.value,
      telefon: form.elements.telefon.value,
      konum: konum,
      aciklama: aciklama.value
    };
  }

  // Masaüstünde (fare ile kullanılan cihaz) WhatsApp Web açılır; telefonda wa.me uygulamayı açar.
  function waAdres(metin) {
    var adres = B.waAdresi(metin);
    return document.documentElement.classList.contains('masaustu') ? B.waMasaustuAdresi(adres) : adres;
  }

  // ---------------------------------------------------------------- Önizleme ve adım göstergesi
  function onizle() {
    var v = degerler();
    onizleme.textContent = B.talepMetni(v);
    sayac.textContent = aciklama.value.length + ' / ' + B.ACIKLAMA_SINIRI;
    var tamam = { 1: Boolean(v.hizmet), 2: Boolean(v.ekipman && v.aciliyet && v.bolge) };
    tamam[3] = tamam[1] && tamam[2];
    Array.prototype.forEach.call(document.querySelectorAll('#adimCubugu [data-adim]'), function (li) {
      var no = li.getAttribute('data-adim');
      li.classList.toggle('tamam', tamam[no]);
      if (tamam[no]) li.setAttribute('aria-label', li.textContent.replace(/^\d/, '').trim() + ' — tamamlandı');
      else li.removeAttribute('aria-label');
    });
  }

  // ---------------------------------------------------------------- Doğrulama
  function hatalariGoster(hatalar) {
    Object.keys(ALANLAR).forEach(function (ad) {
      var t = ALANLAR[ad];
      var mesaj = hatalar[ad] || '';
      el(t.kutu).classList.toggle('alan--hata', Boolean(mesaj));
      el(t.hata).textContent = mesaj;
      var odak = t.odak();
      if (odak && odak.type !== 'radio') odak.setAttribute('aria-invalid', String(Boolean(mesaj)));
      if (mesaj && t.ek) ekBilgi.open = true; // hatalı alan kapalı bölümde gizli kalmasın
    });
  }

  function ozetiGoster(hatalar) {
    var adlar = Object.keys(ALANLAR).filter(function (ad) { return hatalar[ad]; });
    ozetListe.textContent = '';
    adlar.forEach(function (ad) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + ALANLAR[ad].kutu;
      a.textContent = hatalar[ad];
      a.addEventListener('click', function (e) { e.preventDefault(); ALANLAR[ad].odak().focus(); });
      li.appendChild(a);
      ozetListe.appendChild(li);
    });
    ozet.hidden = adlar.length === 0;
    return adlar;
  }

  form.addEventListener('input', function () {
    onizle();
    if (form.dataset.denendi) hatalariGoster(B.talepDogrula(degerler()));
  });
  form.addEventListener('change', function () {
    onizle();
    if (form.dataset.denendi) hatalariGoster(B.talepDogrula(degerler()));
  });

  // ---------------------------------------------------------------- Gönderim: WhatsApp'a aktarım (çift gönderim engelli)
  var mesgul = false;
  function kilidiAc() {
    mesgul = false;
    gonderDugme.disabled = false;
    gonderDugme.removeAttribute('aria-busy');
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (mesgul) return;
    form.dataset.denendi = '1';
    var v = degerler();
    var hatalar = B.talepDogrula(v);
    hatalariGoster(hatalar);
    if (ozetiGoster(hatalar).length) {
      basari.hidden = true;
      ozet.focus();
      return;
    }
    mesgul = true;
    gonderDugme.disabled = true;
    gonderDugme.setAttribute('aria-busy', 'true');
    var adres = waAdres(B.talepMetni(v));
    waYedek.href = adres;
    basari.hidden = false;
    basari.focus();
    var pencere = null;
    // 'noopener' özelliği verilirse window.open her zaman null döner; bu yüzden opener elle kesilir.
    try { pencere = window.open(adres, '_blank'); } catch (hata) { pencere = null; }
    if (pencere) { try { pencere.opener = null; } catch (hata) { /* yok say */ } }
    else if (!document.documentElement.classList.contains('masaustu')) window.location.href = adres;
    // Kısa süre sonra düğme yeniden kullanılabilir (WhatsApp'tan geri dönen kişi tekrar gönderebilsin)
    setTimeout(kilidiAc, 4000);
  });

  // Sayfa geri tuşuyla önbellekten dönerse düğme kilitli kalmasın
  window.addEventListener('pageshow', kilidiAc);

  el('formuTemizle').addEventListener('click', function () {
    form.reset();
    konumuKaldir();
    delete form.dataset.denendi;
    hatalariGoster({});
    ozet.hidden = true;
    basari.hidden = true;
    onizle();
    ALANLAR.hizmet.odak().focus();
  });

  // ---------------------------------------------------------------- Konum (yalnızca düğmeye basınca)
  var konumDugme = el('konumAl');
  var konumDurum = el('konumDurum');
  var konumSonuc = el('konumSonuc');
  var konumBag = el('konumBag');

  function konumMesaji(metin, hata) {
    konumDurum.textContent = metin;
    konumDurum.classList.toggle('konum__durum--hata', Boolean(hata));
  }

  function konumuKaldir() {
    konum = null;
    konumSonuc.hidden = true;
    konumBag.removeAttribute('href');
    konumMesaji('', false);
    konumDugme.disabled = false;
    onizle();
  }

  el('konumKaldir').addEventListener('click', function () { konumuKaldir(); konumDugme.focus(); });

  konumDugme.addEventListener('click', function () {
    if (!('geolocation' in navigator)) {
      konumMesaji('Tarayıcınız konum özelliğini desteklemiyor. Yeri açıklamaya yazabilirsiniz.', true);
      return;
    }
    if (!window.isSecureContext) {
      konumMesaji('Konum yalnızca güvenli (https) bağlantıda alınabilir. Yeri açıklamaya yazabilirsiniz.', true);
      return;
    }
    konumDugme.disabled = true;
    konumMesaji('Konum izni isteniyor…', false);
    navigator.geolocation.getCurrentPosition(function (p) {
      konum = { enlem: p.coords.latitude, boylam: p.coords.longitude, dogruluk: p.coords.accuracy };
      var bag = B.konumBaglantisi(konum.enlem, konum.boylam);
      if (!bag) { konum = null; konumDugme.disabled = false; konumMesaji('Konum okunamadı. Yeri açıklamaya yazabilirsiniz.', true); return; }
      konumBag.href = bag;
      konumSonuc.hidden = false;
      konumMesaji('Konum eklendi (yaklaşık ±' + Math.round(konum.dogruluk) + ' m). Mesaja bu bağlantı eklenecek.', false);
      onizle();
    }, function (hata) {
      konumDugme.disabled = false;
      var mesajlar = {
        1: 'Konum izni verilmedi. Sorun değil — makinenin yerini açıklamaya yazabilirsiniz.',
        2: 'Konum belirlenemedi (GPS veya ağ bilgisi yok). Yeri açıklamaya yazabilirsiniz.',
        3: 'Konum zamanında alınamadı. Yeniden deneyin ya da yeri açıklamaya yazın.'
      };
      konumMesaji(mesajlar[hata && hata.code] || 'Konum alınamadı. Yeri açıklamaya yazabilirsiniz.', true);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  });

  // ---------------------------------------------------------------- Kopyalama
  var kopyaDugme = el('metniKopyala');
  kopyaDugme.addEventListener('click', function () {
    var yazi = kopyaDugme.querySelector('span');
    window.BaskentKopyala(B.talepMetni(degerler()), function (basarili) {
      yazi.textContent = basarili ? 'Kopyalandı' : 'Kopyalanamadı — elle seçin';
      setTimeout(function () { yazi.textContent = 'Mesaj metnini kopyala'; }, 2200);
    });
  });

  // ---------------------------------------------------------------- Bağlantıdan gelen hizmet (ör. servis-talebi.html?hizmet=2)
  try {
    var no = Number(new URLSearchParams(window.location.search).get('hizmet'));
    var secenek = no >= 1 ? form.querySelectorAll('input[name="hizmet"]')[no - 1] : null;
    if (secenek) secenek.checked = true;
  } catch (hata) { /* eski tarayıcı: seçim yapılmaz */ }

  onizle();
})();
