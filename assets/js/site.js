/* Başkent İş Makinaları — tüm sayfalarda ortak arayüz: menü, canlı durum, harita, akıcı kaydırma ve animasyonlar.
 * Lenis / GSAP yüklenemezse ya da ziyaretçi "hareketi azalt" tercih ettiyse sayfa normal kaydırmayla, tüm içerik
 * görünür hâlde çalışır: animasyonlar içeriği gizleyen başlangıç durumlarını yalnızca GSAP çalışırken kurar. */
(function () {
  'use strict';
  var B = window.Baskent;
  var kok = document.documentElement;
  kok.classList.add('js');

  if (B) B.telBaglantilariniAyarla(document.querySelectorAll('a[href^="tel:"]'), B.cerceveIcindeMi(window));

  // ---------------------------------------------------------------- Kopyalama (Clipboard API, olmazsa eski yöntem)
  function kopyala(metin, sonuc) {
    function eskiYontem() {
      var alan = document.createElement('textarea');
      alan.value = metin; alan.setAttribute('readonly', ''); alan.className = 'gorunmez';
      document.body.appendChild(alan); alan.select();
      var basarili = false;
      try { basarili = document.execCommand('copy'); } catch (hata) { basarili = false; }
      document.body.removeChild(alan);
      sonuc(basarili);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(metin).then(function () { sonuc(true); }, eskiYontem);
    else eskiYontem();
  }
  window.BaskentKopyala = kopyala;

  // ---------------------------------------------------------------- Masaüstü: WhatsApp Web ve telefon penceresi
  // Fareyle kullanılan cihazda wa.me yerine doğrudan WhatsApp Web açılır; tel: bağlantısı arama yapamayacağı için
  // numarayı kopyalama / arama seçenekli bir pencere gösterilir. Dokunmatik cihazlarda bağlantılar olduğu gibi çalışır.
  var masaustu = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  kok.classList.toggle('masaustu', masaustu);
  if (masaustu && B) {
    Array.prototype.forEach.call(document.querySelectorAll('a[href^="https://wa.me/"]'), function (a) {
      a.href = B.waMasaustuAdresi(a.getAttribute('href'));
    });
    var telPencere = document.getElementById('telPencere');
    if (telPencere && typeof telPencere.showModal === 'function') {
      document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href^="tel:"]');
        if (!a || a.hasAttribute('data-tel-dogrudan')) return;
        e.preventDefault();
        telPencere.showModal();
      });
      // Pencerenin dışına (arka plana) tıklayınca kapanır
      telPencere.addEventListener('click', function (e) { if (e.target === telPencere) telPencere.close(); });
    }
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-kopyala]'), function (dugme) {
    var yazi = dugme.querySelector('span');
    var ilk = yazi ? yazi.textContent : '';
    dugme.addEventListener('click', function () {
      kopyala(dugme.getAttribute('data-kopyala'), function (basarili) {
        if (!yazi) return;
        yazi.textContent = basarili ? 'Kopyalandı' : 'Kopyalanamadı';
        setTimeout(function () { yazi.textContent = ilk; }, 2200);
      });
    });
  });

  // ---------------------------------------------------------------- Konumu paylaş: atölyenin harita bağlantısı
  Array.prototype.forEach.call(document.querySelectorAll('[data-paylas]'), function (dugme) {
    var durum = dugme.querySelector('[data-paylas-durum]');
    var ilk = durum ? durum.textContent : '';
    function bildir(metin) {
      if (!durum) return;
      durum.textContent = metin;
      setTimeout(function () { durum.textContent = ilk; }, 2600);
    }
    dugme.addEventListener('click', function () {
      var veri = { title: dugme.getAttribute('data-baslik'), text: dugme.getAttribute('data-metin'), url: dugme.getAttribute('data-url') };
      if (navigator.share && (!navigator.canShare || navigator.canShare(veri))) {
        navigator.share(veri).catch(function (hata) {
          if (hata && hata.name === 'AbortError') return; // kullanıcı vazgeçti
          kopyala(veri.text + ' — ' + veri.url, function (b) { bildir(b ? 'Bağlantı kopyalandı' : 'Paylaşılamadı'); });
        });
        return;
      }
      kopyala(veri.text + ' — ' + veri.url, function (b) { bildir(b ? 'Bağlantı kopyalandı' : 'Kopyalanamadı'); });
    });
  });

  var baslik = document.querySelector('.baslik');
  function baslikYuksekligi() { return baslik ? baslik.offsetHeight : 0; }

  // ---------------------------------------------------------------- Akıcı kaydırma (tek Lenis örneği)
  var lenis = null;
  function lenisKur(gsapIle) {
    if (lenis || window.__baskentLenis || typeof window.Lenis !== 'function') return null;
    lenis = new window.Lenis({
      autoRaf: !gsapIle,               // GSAP varsa döngüyü GSAP'in ticker'ı sürer (resmî entegrasyon)
      anchors: true,                   // hedef boşluğu CSS scroll-margin-top'tan gelir (Lenis bunu hesaba katar)
      stopInertiaOnNavigate: true,
      prevent: function (dugum) { return Boolean(dugum && dugum.closest && dugum.closest('[data-lenis-prevent]')); }
    });
    window.__baskentLenis = lenis;
    return lenis;
  }
  function lenisKaldir() {
    if (!lenis) return;
    lenis.destroy();
    lenis = null;
    window.__baskentLenis = null;
  }

  // ---------------------------------------------------------------- Menü
  var menuDugme = document.querySelector('.menu__dugme');
  var menuListe = document.getElementById('menuListe');
  function menuAcikMi() { return Boolean(menuListe && menuListe.classList.contains('acik')); }
  function menuAyarla(acik, odakGeri) {
    if (!menuDugme || !menuListe) return;
    // Panel, başlığın o anki alt kenarından başlar (üst şerit kaydırılınca başlık en üste yapışır)
    if (acik && baslik) menuListe.style.setProperty('--menu-ust', Math.round(baslik.getBoundingClientRect().bottom) + 'px');
    menuListe.classList.toggle('acik', acik);
    kok.classList.toggle('menu-acik', acik);
    menuDugme.setAttribute('aria-expanded', String(acik));
    menuDugme.querySelector('.menu__yazi').textContent = acik ? 'Kapat' : 'Menü';
    if (lenis) { if (acik) lenis.stop(); else lenis.start(); }
    if (acik) {
      var ilk = menuListe.querySelector('a');
      if (ilk) ilk.focus({ preventScroll: true });
    } else if (odakGeri) {
      menuDugme.focus();
    }
  }
  if (menuDugme && menuListe) {
    menuDugme.addEventListener('click', function () { menuAyarla(!menuAcikMi(), false); });
    menuListe.addEventListener('click', function (e) { if (e.target.closest('a')) menuAyarla(false, false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuAcikMi()) menuAyarla(false, true);
    });
    document.addEventListener('click', function (e) {
      if (menuAcikMi() && !e.target.closest('.menu')) menuAyarla(false, false);
    });
    // Masaüstü genişliğine geçilirse açık kalan mobil menü kapanır (kaydırma kilidi takılı kalmasın)
    var genisEkran = window.matchMedia('(min-width: 981px)');
    var genisDegisti = function (s) { if (s.matches && menuAcikMi()) menuAyarla(false, false); };
    if (genisEkran.addEventListener) genisEkran.addEventListener('change', genisDegisti);
  }

  // ---------------------------------------------------------------- Canlı çalışma durumu (Türkiye saati)
  var rozetler = document.querySelectorAll('[data-durum]');
  var saatSatirlari = document.querySelectorAll('.saatler tr[data-gunler]');
  var sonDurum = '';
  function durumuGuncelle() {
    if (!B) return;
    var z = B.istanbulZamani(new Date());
    var d = B.durumHesapla(z);
    var anahtar = d.baslik + d.alt + d.ek;
    if (anahtar !== sonDurum) {
      sonDurum = anahtar;
      Array.prototype.forEach.call(rozetler, function (r) {
        r.classList.toggle('rozet--acik', d.acik);
        r.classList.toggle('rozet--kapali', !d.acik);
        // "Atölye" ön eki ayrı tutulur: dar ekranda başlıktaki rozet yalnızca "Açık / Kapalı" gösterir
        var b = r.querySelector('.rozet__baslik');
        if (b) {
          var bosluk = d.baslik.indexOf(' ');
          var onEk = document.createElement('span');
          onEk.className = 'rozet__on';
          onEk.textContent = d.baslik.slice(0, bosluk + 1);
          b.textContent = d.baslik.slice(bosluk + 1);
          b.insertBefore(onEk, b.firstChild);
        }
        var a = r.querySelector('.rozet__alt'); if (a) a.textContent = d.alt;
        var e = r.querySelector('.rozet__ek'); if (e) e.textContent = d.ek;
      });
    }
    Array.prototype.forEach.call(saatSatirlari, function (tr) {
      tr.classList.toggle('bugun', tr.getAttribute('data-gunler').split(' ').indexOf(String(z.gun)) !== -1);
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-yil]'), function (el) { el.textContent = z.yil; });
  }
  durumuGuncelle();
  setInterval(durumuGuncelle, 30000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) durumuGuncelle(); });

  // ---------------------------------------------------------------- Harita: Google içeriği yalnızca istenince yüklenir
  Array.prototype.forEach.call(document.querySelectorAll('[data-harita]'), function (kutu) {
    var dugme = kutu.querySelector('.harita__dugme');
    if (!dugme) return;
    dugme.addEventListener('click', function () {
      var cerceve = document.createElement('iframe');
      cerceve.src = kutu.getAttribute('data-harita');
      cerceve.title = 'Başkent İş Makinaları konumu — Google Haritalar';
      cerceve.loading = 'lazy';
      cerceve.referrerPolicy = 'strict-origin-when-cross-origin';
      cerceve.setAttribute('allowfullscreen', '');
      cerceve.className = 'harita__cerceve';
      kutu.classList.add('harita--yuklendi');
      kutu.appendChild(cerceve);
      dugme.remove();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  });

  // ---------------------------------------------------------------- Başka sayfadan gelen #bağlantı
  // Tarayıcı hedefe yazı tipleri ve animasyon başlangıç durumları oturmadan atlar; yükleme bitince hedef,
  // dönüşümlerden (transform) etkilenmeyen gerçek konumuna göre sabit başlığın altına yeniden hizalanır.
  function hashHizala() {
    var id = '';
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch (hata) { return; }
    var hedef = id && document.getElementById(id);
    if (!hedef) return;
    var y = 0;
    for (var n = hedef; n; n = n.offsetParent) y += n.offsetTop;
    var konum = Math.max(0, y - (baslikYuksekligi() + 16));
    if (lenis) lenis.scrollTo(konum, { immediate: true, force: true });
    else window.scrollTo(0, konum);
  }
  window.addEventListener('load', function () {
    hashHizala();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(hashHizala);
  });

  // ---------------------------------------------------------------- Animasyonlar
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) {
    // GSAP yüklenemedi: yalnızca akıcı kaydırma (hareket tercihine saygıyla)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) lenisKur(false);
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  var mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', function () {
    var l = lenisKur(true);
    var tik = null;
    if (l) {
      // Lenis + ScrollTrigger: Lenis README'deki resmî senkronizasyon
      l.on('scroll', ScrollTrigger.update);
      tik = function (zaman) { l.raf(zaman * 1000); };
      gsap.ticker.add(tik);
      gsap.ticker.lagSmoothing(0);
    }

    // 1. Karşılama başlığı ve açıklaması
    // Başlık ve açıklama (sayfanın LCP öğeleri) yalnızca kayar, saydamlaşmaz: ilk boyamada okunur durumdadır.
    var giris = gsap.utils.toArray('[data-anim="giris"]');
    if (giris.length) {
      gsap.from(giris, { y: 22, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: 0.05, clearProps: 'transform' });
      var ikincil = giris.filter(function (el) { return !/^(H1|P)$/.test(el.tagName) || el.classList.contains('etiket'); });
      if (ikincil.length) gsap.from(ikincil, { opacity: 0, duration: 0.8, ease: 'power2.out', stagger: 0.08, delay: 0.05, clearProps: 'opacity' });
    }

    // 2. Makine görselinde hafif, kaydırmaya bağlı hareket
    gsap.utils.toArray('[data-anim="parallax"]').forEach(function (el) {
      gsap.fromTo(el, { yPercent: -3 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: el.closest('section') || el, start: 'top top', end: 'bottom top', scrub: 0.6 }
      });
    });

    // 3. Kartlar ekrana girdikçe sırayla
    var kartlar = gsap.utils.toArray('[data-anim="kart"]');
    if (kartlar.length) {
      gsap.set(kartlar, { autoAlpha: 0, y: 28 });
      var goster = function (grup) { gsap.to(grup, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08, overwrite: true }); };
      ScrollTrigger.batch(kartlar, { start: 'top 92%', once: true, onEnter: goster, onEnterBack: goster, onLeave: goster });
    }

    // 4. Bölüm başlıkları ve görseller arasında yumuşak geçiş
    gsap.utils.toArray('[data-anim="baslik"]').forEach(function (el) {
      gsap.from(el, { y: 18, opacity: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    gsap.utils.toArray('[data-anim="gorsel"]').forEach(function (el) {
      gsap.from(el, { scale: 1.04, opacity: 0, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });

    // 6. İletişim bölümünde sade kapanış
    gsap.utils.toArray('[data-anim="kapanis"]').forEach(function (el) {
      var cizgi = el.querySelector('.kapanis__cizgi');
      var zaman = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 80%', once: true } });
      zaman.from(el, { y: 24, opacity: 0, duration: 0.7, ease: 'power2.out' });
      if (cizgi) zaman.from(cizgi, { scaleX: 0, transformOrigin: 'left center', duration: 0.8, ease: 'power3.inOut' }, '-=0.35');
    });

    // Görseller ve yazı tipleri yüklenince tetik noktaları yeniden hesaplanır
    var yenile = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', yenile);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(yenile);

    // Güvenlik ağı: herhangi bir nedenle görünmez kalan kart kalırsa gösterilir
    var emniyet = setTimeout(function () {
      kartlar.forEach(function (el) { if (getComputedStyle(el).visibility === 'hidden' && el.getBoundingClientRect().top < window.innerHeight) goster(el); });
    }, 3000);

    return function () {
      clearTimeout(emniyet);
      window.removeEventListener('load', yenile);
      if (tik) { gsap.ticker.remove(tik); gsap.ticker.lagSmoothing(500, 33); }
      lenisKaldir();
    };
  });
})();
