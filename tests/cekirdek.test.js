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

// ---- Ayarlar (site.config.json) ----
test('saatler site.config.json\'dan: hafta içi 08:30–18:00, cumartesi 08:30–13:30, pazar kapalı', () => {
  assert.deepEqual(B.SAATLER, [null, [510, 1080], [510, 1080], [510, 1080], [510, 1080], [510, 1080], [510, 810]]);
  assert.equal(B.TELEFON, '905380773571');
  assert.equal(B.TELEFON_GORUNEN, '0538 077 35 71');
  assert.equal(B.KARSILAMA, 'Merhaba. Başkent iş Makinalarından Servis bilgisi Almak İstiyorum.');
});

test('dakikaOku yalnızca SS:DD kabul eder', () => {
  assert.equal(B.dakikaOku('08:30'), 510);
  assert.throws(() => B.dakikaOku('8:30'));
  assert.throws(() => B.dakikaOku('24:00'));
});

// ---- Türkiye saati ----
test('istanbulZamani UTC anını Türkiye saatine (UTC+3) çevirir', () => {
  const z = B.istanbulZamani(new Date('2026-10-12T06:30:00Z'));
  assert.equal(z.gun, PAZARTESI);
  assert.equal(z.dakika, saat(9, 30));
  assert.equal(z.yil, '2026');
});

test('istanbulZamani gece yarısını 00 olarak verir ve günü doğru ilerletir', () => {
  const z = B.istanbulZamani(new Date('2026-10-11T21:30:00Z'));
  assert.equal(z.gun, PAZARTESI);
  assert.equal(z.dakika, 30);
});

// ---- Canlı çalışma durumu ----
test('hafta içi mesai saatinde "Atölye Açık / Hizmete Hazır" ve kapanış saati', () => {
  assert.deepEqual(B.durumHesapla({ gun: PAZARTESI, dakika: saat(10) }), {
    acik: true, baslik: 'Atölye Açık', alt: 'Hizmete Hazır', ek: 'Bugün kapanış 18:00'
  });
});

test('17:59 açık, 18:00 kapalı (kapanış sınırı)', () => {
  assert.equal(B.durumHesapla({ gun: PAZARTESI, dakika: saat(17, 59) }).acik, true);
  assert.deepEqual(B.durumHesapla({ gun: PAZARTESI, dakika: saat(18) }), { acik: false, baslik: 'Atölye Kapalı', alt: KAPALI_ALT, ek: 'Açılış: yarın 08:30' });
});

test('08:30 açılış sınırı: 08:29 kapalı (bugün 08:30), 08:30 açık', () => {
  assert.equal(B.durumHesapla({ gun: PAZARTESI, dakika: saat(8, 29) }).ek, 'Açılış: bugün 08:30');
  assert.equal(B.durumHesapla({ gun: PAZARTESI, dakika: saat(8, 30) }).acik, true);
});

test('cuma akşamı açılış yarın (cumartesi) 08:30', () => {
  assert.equal(B.durumHesapla({ gun: CUMA, dakika: saat(18, 30) }).ek, 'Açılış: yarın 08:30');
});

test('cumartesi 13:29 açık, 13:30 sonrası açılış Pazartesi', () => {
  assert.equal(B.durumHesapla({ gun: CUMARTESI, dakika: saat(13, 29) }).acik, true);
  assert.equal(B.durumHesapla({ gun: CUMARTESI, dakika: saat(13, 30) }).ek, 'Açılış: Pazartesi 08:30');
});

test('pazar her saatte kapalı ve açılış yarın 08:30', () => {
  for (const d of [0, saat(9), saat(12), saat(23, 59)]) {
    const z = B.durumHesapla({ gun: PAZAR, dakika: d });
    assert.equal(z.acik, false);
    assert.equal(z.ek, 'Açılış: yarın 08:30');
  }
});

// ---- Servis talebi ----
test('altı arıza kategorisi verilen sırada ve sonuncusu "Diğer"', () => {
  assert.equal(B.ARIZA_KATEGORILERI.length, 6);
  assert.equal(B.ARIZA_KATEGORILERI[0], 'Hidrolik sistemde güç kaybı, yavaşlama veya ana pompa kaçağı');
  assert.equal(B.DIGER, 'Diğer (Kendi arızamı yazmak istiyorum)');
});

test('istenen seçenekler mevcut: hizmet, ekipman, aciliyet, bölge', () => {
  for (const h of ['Kova Tamiri / Zırhlama', 'Mekanik Bakım / Overhaul', 'Saha Acil Servis']) assert.ok(B.HIZMETLER.includes(h), h);
  for (const e of ['Ekskavatör', 'Loder']) assert.ok(B.EKIPMANLAR.includes(e), e);
  assert.ok(B.EKIPMANLAR.some((e) => /^Tır/.test(e)));
  assert.deepEqual(B.ACILIYETLER, ['Şantiye durdu', 'Normal bakım']);
  for (const b of ['Milas', 'Selimiye', 'Bodrum']) assert.ok(B.BOLGELER.includes(b), b);
});

const TAM = { hizmet: 'Kova Tamiri / Zırhlama', ekipman: 'Ekskavatör', aciliyet: 'Şantiye durdu', bolge: 'Milas' };

test('talepMetni istenen şablonu birebir üretir', () => {
  assert.equal(B.talepMetni(TAM), [
    '🛠️ *BAŞKENT İŞ MAKİNALARI - WEB SERVİS TALEBİ*',
    '',
    '*Talep Türü:* Kova Tamiri / Zırhlama',
    '*Ekipman:* Ekskavatör',
    '*Aciliyet:* Şantiye durdu',
    '*Bölge:* Milas',
    '',
    '_Merhaba, web siteniz üzerinden servis talebi oluşturdum. Bilgi ve destek rica ederim._'
  ].join('\n'));
});

test('talepMetni isteğe bağlı bilgileri yalnızca doldurulduysa ekler', () => {
  const metin = B.talepMetni(Object.assign({}, TAM, {
    kategori: B.ARIZA_KATEGORILERI[0], makine: '  Paletli   kazıcı ', ad: 'Ali Veli', telefon: '0532 000 00 00',
    konum: { enlem: 37.3165, boylam: 27.7834, dogruluk: 12.4 }, aciklama: 'Bom yavaş\r\n\r\n\r\nuğultu'
  }));
  assert.match(metin, /\*Arıza:\* Hidrolik sistemde/);
  assert.match(metin, /\*Marka \/ model:\* Paletli kazıcı\n/);
  assert.match(metin, /\*Ad soyad:\* Ali Veli/);
  assert.match(metin, /\*Konum:\* https:\/\/maps\.google\.com\/\?q=37\.316500,27\.783400 \(±12 m\)/);
  assert.match(metin, /\*Açıklama:\*\nBom yavaş\n\nuğultu\n\n_Merhaba/);
  assert.doesNotMatch(B.talepMetni(TAM), /Ad soyad|Telefon|Konum|Açıklama|Arıza/);
});

test('talepMetni açıklamayı 600 karakterle sınırlar', () => {
  const metin = B.talepMetni(Object.assign({}, TAM, { aciklama: 'a'.repeat(900) }));
  assert.ok(metin.includes('a'.repeat(600)) && !metin.includes('a'.repeat(601)));
});

test('konumBaglantisi Google Maps biçiminde, geçersiz koordinatta boş', () => {
  assert.equal(B.konumBaglantisi(37.3, 27.78), 'https://maps.google.com/?q=37.300000,27.780000');
  assert.equal(B.konumBaglantisi(91, 0), '');
  assert.equal(B.konumBaglantisi(NaN, 1), '');
  assert.equal(B.konumBaglantisi('37', 27), '');
});

test('talepDogrula: dört seçim zorunlu, diğer alanlar isteğe bağlı', () => {
  assert.deepEqual(Object.keys(B.talepDogrula({})).sort(), ['aciliyet', 'bolge', 'ekipman', 'hizmet']);
  assert.deepEqual(B.talepDogrula(TAM), {});
  assert.ok(B.talepDogrula(Object.assign({}, TAM, { ekipman: 'Uydurma' })).ekipman, 'listede olmayan değer reddedilir');
  assert.ok(B.talepDogrula(Object.assign({}, TAM, { telefon: '123' })).telefon);
  assert.ok(B.talepDogrula(Object.assign({}, TAM, { kategori: 'Uydurma' })).kategori);
});

test('talepDogrula: arıza "Diğer" ise açıklama gerekir; 600 karakter sınırı', () => {
  assert.ok(B.talepDogrula(Object.assign({}, TAM, { kategori: B.DIGER, aciklama: ' ' })).aciklama);
  assert.deepEqual(B.talepDogrula(Object.assign({}, TAM, { kategori: B.DIGER, aciklama: 'Kepçe titriyor' })), {});
  assert.ok(B.talepDogrula(Object.assign({}, TAM, { aciklama: 'x'.repeat(601) })).aciklama);
});

test('hizliMesaj karşılama + seçilen arıza başlığı', () => {
  assert.equal(B.hizliMesaj(B.ARIZA_KATEGORILERI[1]), B.KARSILAMA + '\n\n*Arıza:* ' + B.ARIZA_KATEGORILERI[1]);
  assert.equal(B.hizliMesaj(''), B.KARSILAMA);
});

test('waAdresi doğru hatta gider ve metni bozulmadan taşır', () => {
  const metin = B.talepMetni(Object.assign({}, TAM, { ad: 'Ali & Veli #1', aciklama: 'Çatlak?%' }));
  const adres = B.waAdresi(metin);
  assert.ok(adres.startsWith(WA_TABAN));
  assert.equal(decodeURIComponent(adres.slice(WA_TABAN.length)), metin);
});

test('waMasaustuAdresi wa.me bağlantısını WhatsApp Web\'e çevirir, metni korur', () => {
  const adres = B.waAdresi('Merhaba & selam');
  const web = B.waMasaustuAdresi(adres);
  assert.equal(web, 'https://web.whatsapp.com/send?phone=905380773571&text=' + encodeURIComponent('Merhaba & selam'));
  assert.equal(B.waMasaustuAdresi('https://wa.me/905380773571'), 'https://web.whatsapp.com/send?phone=905380773571');
  assert.equal(B.waMasaustuAdresi('https://ornek.com/x'), 'https://ornek.com/x');
});

test('tüm sayfalardaki WhatsApp bağlantıları tek hatta ve izinli mesajlarla gider', () => {
  const izinli = new Set([B.waAdresi(B.KARSILAMA)].concat(B.ARIZA_KATEGORILERI.map((k) => B.waAdresi(B.hizliMesaj(k)))));
  if (B.AYAR.whatsapp.katalog) izinli.add(B.AYAR.whatsapp.katalog); // WhatsApp Business kataloğu (wa.me/c/aynı numara)
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
  const liste = [baglanti(TEL_HREF), baglanti('#servis'), baglanti(TEL_HREF), baglanti(null)];
  assert.equal(B.telBaglantilariniAyarla(liste, true), 2);
  assert.equal(liste[0].nitelik.target, '_blank');
  assert.equal(liste[0].nitelik.rel, 'noopener');
  assert.equal(liste[1].nitelik.target, undefined);
  assert.equal(B.telBaglantilariniAyarla(liste, false), 0);
  assert.equal(B.telBaglantilariniAyarla([], true), 0);
});
