const test = require('node:test');
const assert = require('node:assert/strict');
const { cekirdek, tumSayfalar } = require('./yardimci');

const B = cekirdek();
const TEL_HREF = 'tel:+905380773571';
const WA_TABAN = 'https://wa.me/905380773571?text=';
const KAPALI_ALT = 'İlk Mesai Saatinde Dönüş Yapılacak';
const PAZARTESI = 1;
const CUMA = 5;
const CUMARTESI = 6;
const PAZAR = 0;
const saat = (s, d = 0) => s * 60 + d;

// ---- Türkiye saati ----
test('istanbulZamani UTC anını Türkiye saatine (UTC+3) çevirir', () => {
  const z = B.istanbulZamani(new Date('2026-10-12T06:30:00Z'));
  assert.equal(z.gun, PAZARTESI);
  assert.equal(z.dakika, saat(9, 30));
  assert.deepEqual([z.yil, z.ay, z.gunNo, z.saat, z.dk], ['2026', '10', '12', 9, 30]);
});

test('istanbulZamani gece yarısını 00 olarak verir ve günü doğru ilerletir', () => {
  const z = B.istanbulZamani(new Date('2026-10-11T21:30:00Z'));
  assert.equal(z.gun, PAZARTESI);
  assert.equal(z.dakika, 30);
  assert.equal(z.saat, 0);
});

// ---- Canlı çalışma durumu ----
test('hafta içi mesai saatinde açık ve kapanış saatini söyler', () => {
  assert.deepEqual(B.durumHesapla({ gun: PAZARTESI, dakika: saat(10) }), {
    acik: true, baslik: 'Açık', alt: 'Atölye Hizmet Veriyor', ek: 'Bugün kapanış 17:30'
  });
});

test('17:29 açık, 17:30 kapalı (kapanış sınırı)', () => {
  assert.equal(B.durumHesapla({ gun: PAZARTESI, dakika: saat(17, 29) }).acik, true);
  const d = B.durumHesapla({ gun: PAZARTESI, dakika: saat(17, 30) });
  assert.deepEqual(d, { acik: false, baslik: 'Kapalı', alt: KAPALI_ALT, ek: 'İlk mesai: yarın 09:00' });
});

test('09:00 açılış sınırı: 08:59 kapalı (bugün 09:00), 09:00 açık', () => {
  assert.equal(B.durumHesapla({ gun: PAZARTESI, dakika: saat(8, 59) }).ek, 'İlk mesai: bugün 09:00');
  assert.equal(B.durumHesapla({ gun: PAZARTESI, dakika: saat(9) }).acik, true);
});

test('cuma akşamı ilk mesai yarın (cumartesi) 09:00', () => {
  assert.equal(B.durumHesapla({ gun: CUMA, dakika: saat(18) }).ek, 'İlk mesai: yarın 09:00');
});

test('cumartesi 13:29 açık, 13:30 sonrası ilk mesai Pazartesi', () => {
  assert.equal(B.durumHesapla({ gun: CUMARTESI, dakika: saat(13, 29) }).ek, 'Bugün kapanış 13:30');
  assert.equal(B.durumHesapla({ gun: CUMARTESI, dakika: saat(13, 30) }).ek, 'İlk mesai: Pazartesi 09:00');
});

test('pazar her saatte kapalı ve ilk mesai yarın 09:00', () => {
  for (const dk of [0, saat(10), saat(23, 59)]) {
    const d = B.durumHesapla({ gun: PAZAR, dakika: dk });
    assert.equal(d.acik, false);
    assert.equal(d.alt, KAPALI_ALT);
    assert.equal(d.ek, 'İlk mesai: yarın 09:00');
  }
});

// ---- Servis talebi (iş emri) ----
test('isEmriNo BK-YYAAGG-SSDD biçiminde', () => {
  assert.equal(B.isEmriNo({ yil: '2026', ay: '10', gunNo: '12', saat: 9, dk: 5 }), 'BK-261012-0905');
});

test('altı arıza kategorisi kullanıcının verdiği sırada ve sonuncusu "Diğer"', () => {
  assert.deepEqual(B.ARIZA_KATEGORILERI, [
    'Hidrolik sistemde güç kaybı, yavaşlama veya ana pompa kaçağı',
    'İş makinası şanzıman / tork konvertörü arızası ve yürümeme',
    'Motor çekiş düşüklüğü, siyah/beyaz duman veya turbo arızası',
    'Palet yürüyüş hidromotoru / redüktör arızası veya kule dönüş problemi',
    'Hidrolik pompa ötmesi, uğultusu veya ses yapması (Kavitasyon/Emiş)',
    'Diğer (Kendi arızamı yazmak istiyorum)'
  ]);
  assert.equal(B.DIGER, B.ARIZA_KATEGORILERI[5]);
});

test('isEmriMetni hazır mesajla başlar ve doldurulan alanları sırayla yazar', () => {
  const metin = B.isEmriMetni({
    ad: '  Deneme   Kişi ', telefon: '0532 000 00 00', makineTuru: 'Ekskavatör (paletli)', marka: ' Hidromek ', model: '102S',
    seriNo: 'AB123', kategori: B.ARIZA_KATEGORILERI[0], aciliyet: 'Acil — makine durdu', adres: 'Milas  taş ocağı',
    konum: { enlem: 37.3161234, boylam: 27.7831234, dogruluk: 18.4 }, aciklama: '  Bom yavaş.\r\n\r\n\r\nPompa ötüyor.  '
  }, 'BK-261012-0905');
  assert.equal(metin, [
    'Merhaba. Başkent iş Makinalarından Servis bilgisi Almak İstiyorum.',
    '',
    '*SERVİS TALEBİ · BK-261012-0905*',
    '*Ad soyad:* Deneme Kişi',
    '*Telefon:* 0532 000 00 00',
    '*Makine türü:* Ekskavatör (paletli)',
    '*Marka / model:* Hidromek 102S',
    '*Seri no:* AB123',
    '*Arıza:* Hidrolik sistemde güç kaybı, yavaşlama veya ana pompa kaçağı',
    '*Aciliyet:* Acil — makine durdu',
    '*Adres:* Milas taş ocağı',
    '*Konum:* https://maps.google.com/?q=37.316123,27.783123 (±18 m)',
    '*Arıza açıklaması:*',
    'Bom yavaş.\n\nPompa ötüyor.'
  ].join('\n'));
});

test('isEmriMetni yalnızca kullanıcının paylaştığı bilgileri yazar', () => {
  const metin = B.isEmriMetni({ ad: 'Ali', kategori: B.ARIZA_KATEGORILERI[2], konum: null }, 'BK-1');
  assert.doesNotMatch(metin, /Telefon|Makine|Seri|Adres|Konum|Aciliyet|açıklaması|undefined|null/);
  assert.match(metin, /\*Arıza:\* Motor çekiş/);
});

test('isEmriMetni açıklamayı 600 karakterle sınırlar', () => {
  const metin = B.isEmriMetni({ ad: 'Ali', kategori: B.DIGER, aciklama: 'x'.repeat(900) }, 'BK-1');
  assert.equal(metin.split('\n').pop().length, B.ACIKLAMA_SINIRI);
});

test('konumBaglantisi Google Maps biçiminde, geçersiz koordinatta boş', () => {
  assert.equal(B.konumBaglantisi(37.31, 27.78), 'https://maps.google.com/?q=37.310000,27.780000');
  assert.equal(B.konumBaglantisi(-91, 0), '');
  assert.equal(B.konumBaglantisi(NaN, 1), '');
  assert.equal(B.konumBaglantisi('37', '27'), '');
});

test('dogrula: ad ve kategori zorunlu, diğer alanlar isteğe bağlı', () => {
  assert.deepEqual(Object.keys(B.dogrula({ ad: '', kategori: '' })).sort(), ['ad', 'kategori']);
  assert.deepEqual(B.dogrula({ ad: 'Ali Veli', kategori: B.ARIZA_KATEGORILERI[1] }), {});
  assert.ok(B.dogrula({ ad: 'Ali', kategori: 'uydurma kategori' }).kategori);
  assert.ok(B.dogrula({ ad: 'Ali', kategori: B.ARIZA_KATEGORILERI[0], telefon: '12' }).telefon);
});

test('dogrula: "Diğer" seçilince açıklama gerekir; 600 karakter sınırı', () => {
  assert.ok(B.dogrula({ ad: 'Ali', kategori: B.DIGER, aciklama: '' }).aciklama);
  assert.deepEqual(B.dogrula({ ad: 'Ali', kategori: B.DIGER, aciklama: 'Kepçe titriyor' }), {});
  assert.ok(B.dogrula({ ad: 'Ali', kategori: B.ARIZA_KATEGORILERI[0], aciklama: 'x'.repeat(601) }).aciklama);
});

test('hizliMesaj karşılama + seçilen arıza başlığı', () => {
  assert.equal(B.hizliMesaj(B.ARIZA_KATEGORILERI[1]), B.KARSILAMA + '\n\n*Arıza:* ' + B.ARIZA_KATEGORILERI[1]);
  assert.equal(B.hizliMesaj(''), B.KARSILAMA);
});

test('waAdresi doğru hatta gider ve metni bozulmadan taşır', () => {
  const metin = B.isEmriMetni({ ad: 'Ali & Veli #1', kategori: B.DIGER, aciklama: 'Çatlak?%' }, 'BK-1');
  const adres = B.waAdresi(metin);
  assert.ok(adres.startsWith(WA_TABAN));
  assert.equal(decodeURIComponent(adres.slice(WA_TABAN.length)), metin);
});

test('tüm sayfalardaki WhatsApp bağlantıları tek hatta ve izinli mesajlarla gider', () => {
  const izinli = new Set([B.waAdresi(B.KARSILAMA)].concat(B.ARIZA_KATEGORILERI.map((k) => B.waAdresi(B.hizliMesaj(k)))));
  for (const { ad, html } of tumSayfalar()) {
    const adresler = [...html.matchAll(/href="(https:\/\/wa\.me\/[^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
    assert.ok(adresler.length >= 2, ad);
    for (const a of adresler) assert.ok(izinli.has(a), ad + ': ' + a);
  }
});


test('telefonGecerliMi boşa izin verir, 10-13 hane ister', () => {
  assert.equal(B.telefonGecerliMi(''), true);
  assert.equal(B.telefonGecerliMi('0538 077 35 71'), true);
  assert.equal(B.telefonGecerliMi('+90 538 077 35 71'), true);
  assert.equal(B.telefonGecerliMi('123'), false);
  assert.equal(B.telefonGecerliMi('05380773571000000'), false);
});

// ---- Çerçeve içi arama bağlantıları ----
const baglanti = (href) => {
  const nitelik = { href };
  return { getAttribute: (ad) => (ad in nitelik ? nitelik[ad] : null), setAttribute: (ad, deger) => { nitelik[ad] = deger; }, nitelik };
};

test('cerceveIcindeMi doğrudan açılan sayfada false, çerçevede true', () => {
  const pencere = {};
  pencere.self = pencere;
  pencere.top = pencere;
  assert.equal(B.cerceveIcindeMi(pencere), false);
  assert.equal(B.cerceveIcindeMi({ self: {}, top: {} }), true);
});

test('cerceveIcindeMi top okunamıyorsa (farklı köken) true döner', () => {
  const pencere = { self: {} };
  Object.defineProperty(pencere, 'top', { get() { throw new Error('SecurityError'); } });
  assert.equal(B.cerceveIcindeMi(pencere), true);
});

test('çerçevede yalnız tel: bağlantıları yeni bağlamda açılır', () => {
  const liste = [baglanti(TEL_HREF), baglanti('#is-emri'), baglanti(TEL_HREF), baglanti(null)];
  assert.equal(B.telBaglantilariniAyarla(liste, true), 2);
  assert.equal(liste[0].nitelik.target, '_blank');
  assert.equal(liste[0].nitelik.rel, 'noopener');
  assert.equal(liste[1].nitelik.target, undefined);
  assert.equal(B.telBaglantilariniAyarla(liste, false), 0);
  assert.equal(B.telBaglantilariniAyarla([], true), 0);
});
