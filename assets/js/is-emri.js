/* Başkent İş Makinaları — servis talebi (iş emri) formu.
 * Sitenin sunucusu yok: form hiçbir yere veri GÖNDERMEZ ve KAYDETMEZ. "Gönder" düğmesi yalnızca, ziyaretçinin
 * doldurduğu bilgilerden hazır bir WhatsApp mesajı oluşturur; mesaj, ziyaretçi WhatsApp'ta kendisi gönderince iletilir. */
(function () {
  'use strict';
  var B = window.Baskent;
  var form = document.getElementById('isEmriFormu');
  if (!B || !form) return;

  var el = function (id) { return document.getElementById(id); };
  var biletNo = el('biletNo');
  var ozet = el('hataOzeti');
  var ozetListe = el('hataOzetiListe');
  var basari = el('gonderimSonucu');
  var waYedek = el('waYedek');
  var gonderDugme = el('gonderDugme');
  var aciklama = form.elements.aciklama;
  var sayac = el('aciklamaSayac');
  var konum = null; // yalnızca bellekte; sayfa kapanınca kaybolur

  var ALANLAR = {
    ad: { kutu: 'alanAd', hata: 'hataAd', odak: function () { return form.elements.ad; } },
    telefon: { kutu: 'alanTelefon', hata: 'hataTelefon', odak: function () { return form.elements.telefon; } },
    kategori: { kutu: 'alanKategori', hata: 'hataKategori', odak: function () { return form.querySelector('input[name="kategori"]'); } },
    aciklama: { kutu: 'alanAciklama', hata: 'hataAciklama', odak: function () { return aciklama; } }
  };

  function secili(ad) { var s = form.querySelector('input[name="' + ad + '"]:checked'); return s ? s.value : ''; }

  function degerler() {
    return {
      ad: form.elements.ad.value,
      telefon: form.elements.telefon.value,
      makineTuru: form.elements.makineTuru.value,
      marka: form.elements.marka.value,
      model: form.elements.model.value,
      seriNo: form.elements.seriNo.value,
      kategori: secili('kategori'),
      aciliyet: secili('aciliyet'),
      adres: form.elements.adres.value,
      konum: konum,
      aciklama: aciklama.value
    };
  }

  function guncelNo() { return B.isEmriNo(B.istanbulZamani(new Date())); }

  // ---------------------------------------------------------------- Bilet önizlemesi
  function onizle() {
    var v = degerler();
    var gorunen = {
      ad: v.ad.trim(),
      makine: [v.makineTuru, [v.marka.trim(), v.model.trim()].filter(Boolean).join(' ')].filter(Boolean).join(' · '),
      kategori: v.kategori,
      aciliyet: v.aciliyet,
      yer: konum ? 'Konum eklendi' + (v.adres.trim() ? ' · ' + v.adres.trim() : '') : v.adres.trim()
    };
    Object.keys(gorunen).forEach(function (alan) {
      var dd = document.querySelector('#biletListe [data-alan="' + alan + '"]');
      if (!dd) return;
      dd.textContent = gorunen[alan] || dd.getAttribute('data-bos');
      dd.classList.toggle('bos', !gorunen[alan]);
    });
    biletNo.textContent = guncelNo();
    sayac.textContent = aciklama.value.length + ' / ' + B.ACIKLAMA_SINIRI;
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
    if (form.dataset.denendi) hatalariGoster(B.dogrula(degerler()));
  });
  form.addEventListener('change', onizle);

  // ---------------------------------------------------------------- Gönderim: WhatsApp'a aktarım (çift gönderim engelli)
  var mesgul = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (mesgul) return;
    form.dataset.denendi = '1';
    var v = degerler();
    var hatalar = B.dogrula(v);
    hatalariGoster(hatalar);
    var eksik = ozetiGoster(hatalar);
    if (eksik.length) {
      basari.hidden = true;
      ozet.focus();
      return;
    }
    mesgul = true;
    gonderDugme.disabled = true;
    gonderDugme.setAttribute('aria-busy', 'true');
    var adres = B.waAdresi(B.isEmriMetni(v, guncelNo()));
    waYedek.href = adres;
    basari.hidden = false;
    basari.focus();
    var pencere = null;
    try { pencere = window.open(adres, '_blank'); } catch (hata) { pencere = null; }
    if (pencere) { try { pencere.opener = null; } catch (hata) { /* yok say */ } }
    else { window.location.href = adres; }
    // Kısa süre sonra düğme yeniden kullanılabilir (WhatsApp'tan geri dönen kişi tekrar gönderebilsin)
    setTimeout(function () {
      mesgul = false;
      gonderDugme.disabled = false;
      gonderDugme.removeAttribute('aria-busy');
    }, 4000);
  });

  // Sayfa geri tuşuyla önbellekten dönerse düğme kilitli kalmasın
  window.addEventListener('pageshow', function () {
    mesgul = false;
    gonderDugme.disabled = false;
    gonderDugme.removeAttribute('aria-busy');
  });

  el('formuTemizle').addEventListener('click', function () {
    form.reset();
    konumuKaldir();
    delete form.dataset.denendi;
    hatalariGoster({});
    ozet.hidden = true;
    basari.hidden = true;
    onizle();
    form.elements.ad.focus();
  });

  // ---------------------------------------------------------------- Konum (yalnızca düğmeye basınca)
  var konumDugme = el('konumAl');
  var konumDurum = el('konumDurum');
  var konumSonuc = el('konumSonuc');
  var konumBag = el('konumBag');
  var konumKaldirDugme = el('konumKaldir');

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

  konumKaldirDugme.addEventListener('click', function () { konumuKaldir(); konumDugme.focus(); });

  konumDugme.addEventListener('click', function () {
    if (!('geolocation' in navigator)) {
      konumMesaji('Tarayıcınız konum özelliğini desteklemiyor. Adresi aşağıya yazabilirsiniz.', true);
      form.elements.adres.focus();
      return;
    }
    if (!window.isSecureContext) {
      konumMesaji('Konum yalnızca güvenli (https) bağlantıda alınabilir. Adresi aşağıya yazabilirsiniz.', true);
      form.elements.adres.focus();
      return;
    }
    konumDugme.disabled = true;
    konumMesaji('Konum izni isteniyor…', false);
    navigator.geolocation.getCurrentPosition(function (p) {
      konum = { enlem: p.coords.latitude, boylam: p.coords.longitude, dogruluk: p.coords.accuracy };
      var bag = B.konumBaglantisi(konum.enlem, konum.boylam);
      if (!bag) { konum = null; konumDugme.disabled = false; konumMesaji('Konum okunamadı. Adresi aşağıya yazabilirsiniz.', true); return; }
      konumBag.href = bag;
      konumSonuc.hidden = false;
      konumMesaji('Konum eklendi (yaklaşık ±' + Math.round(konum.dogruluk) + ' m). Mesaja bu bağlantı eklenecek.', false);
      onizle();
    }, function (hata) {
      konumDugme.disabled = false;
      var mesajlar = {
        1: 'Konum izni verilmedi. Sorun değil — adresi ya da makinenin yerini aşağıya yazabilirsiniz.',
        2: 'Konum belirlenemedi (GPS veya ağ bilgisi yok). Adresi aşağıya yazabilirsiniz.',
        3: 'Konum zamanında alınamadı. Yeniden deneyin ya da adresi aşağıya yazın.'
      };
      konumMesaji(mesajlar[hata && hata.code] || 'Konum alınamadı. Adresi aşağıya yazabilirsiniz.', true);
      form.elements.adres.focus();
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  });

  // ---------------------------------------------------------------- Kopyalama
  var kopyaDugme = el('metniKopyala');
  kopyaDugme.addEventListener('click', function () {
    var metin = B.isEmriMetni(degerler(), guncelNo());
    var yazi = kopyaDugme.querySelector('span');
    function bildir(mesaj) { yazi.textContent = mesaj; setTimeout(function () { yazi.textContent = 'Mesaj metnini kopyala'; }, 2200); }
    function eskiYontem() {
      var alan = document.createElement('textarea');
      alan.value = metin; alan.setAttribute('readonly', ''); alan.className = 'gorunmez';
      document.body.appendChild(alan); alan.select();
      var basarili = false;
      try { basarili = document.execCommand('copy'); } catch (hata) { basarili = false; }
      document.body.removeChild(alan);
      bildir(basarili ? 'Kopyalandı' : 'Kopyalanamadı — elle seçin');
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(metin).then(function () { bildir('Kopyalandı'); }, eskiYontem);
    else eskiYontem();
  });

  // ---------------------------------------------------------------- Bağlantıdan gelen kategori (ör. is-emri.html?kategori=2)
  try {
    var no = Number(new URLSearchParams(window.location.search).get('kategori'));
    if (no >= 1 && no <= B.ARIZA_KATEGORILERI.length) {
      var secenek = form.querySelectorAll('input[name="kategori"]')[no - 1];
      if (secenek) secenek.checked = true;
    }
  } catch (hata) { /* eski tarayıcı: seçim yapılmaz */ }

  onizle();
  setInterval(function () { biletNo.textContent = guncelNo(); }, 30000);
})();
