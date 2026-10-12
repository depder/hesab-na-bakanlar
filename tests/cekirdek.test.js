const test = require('node:test');
const assert = require('node:assert/strict');
const { cekirdek, sayfaHtml } = require('./yardimci');

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

// ---- İş emri ----
test('isEmriNo BK-YYAAGG-SSDD biçiminde', () => {
  assert.equal(B.isEmriNo({ yil: '2026', ay: '10', gunNo: '12', saat: 9, dk: 5 }), 'BK-261012-0905');
});

test('isEmriMetni hazır mesajla başlar ve alanları sırayla yazar', () => {
  const metin = B.isEmriMetni({
    makine: 'Paletli ekskavatör', model: ' CAT  320D ', islem: 'Kova tamiri', aciliyet: 'Acil — makine durdu',
    konum: 'Bodrum', ad: '  Deneme   Kişi ', geriTel: '0532 000 00 00', detay: '  Tabanda çatlak.\r\n\r\n\r\n2 tırnak kırık.  '
  }, 'BK-261012-0905');
  assert.equal(metin, [
    'Merhaba. Başkent iş Makinalarından Servis bilgisi Almak İstiyorum.',
    '',
    '*SERVİS İŞ EMRİ · BK-261012-0905*',
    '*Makine:* Paletli ekskavatör — CAT 320D',
    '*İşlem:* Kova tamiri',
    '*Aciliyet:* Acil — makine durdu',
    '*Konum:* Bodrum',
    '*Ad soyad:* Deneme Kişi',
    '*Geri dönüş telefonu:* 0532 000 00 00',
    '*Arıza detayı:*',
    'Tabanda çatlak.\n\n2 tırnak kırık.'
  ].join('\n'));
});

test('isEmriMetni boş isteğe bağlı alanları hiç yazmaz', () => {
  const metin = B.isEmriMetni({ makine: 'Dozer', islem: 'Mekanik ağır bakım', aciliyet: 'Planlı — acil değil', ad: 'Ali' }, 'BK-1');
  assert.doesNotMatch(metin, /Konum|Geri dönüş|Arıza detayı|undefined|null/);
  assert.match(metin, /\*Makine:\* Dozer\n/);
});

test('isEmriMetni arıza detayını 600 karakterle sınırlar', () => {
  const metin = B.isEmriMetni({ makine: 'Dozer', islem: 'Kova tamiri', ad: 'Ali', detay: 'x'.repeat(900) }, 'BK-1');
  assert.equal(metin.split('\n').pop().length, B.DETAY_SINIRI);
});

test('waAdresi doğru hatta gider ve metni bozulmadan taşır', () => {
  const metin = B.isEmriMetni({ makine: 'Dozer', islem: 'Kova tamiri', ad: 'Ali & Veli #1', detay: 'Çatlak?%' }, 'BK-1');
  const adres = B.waAdresi(metin);
  assert.ok(adres.startsWith(WA_TABAN));
  assert.equal(decodeURIComponent(adres.slice(WA_TABAN.length)), metin);
});

test('sayfadaki tüm WhatsApp bağlantıları hazır mesajı taşır', () => {
  const beklenen = B.waAdresi(B.KARSILAMA);
  const adresler = [...sayfaHtml().matchAll(/href="(https:\/\/wa\.me\/[^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
  const mesajli = adresler.filter((a) => a.includes('?text='));
  assert.ok(mesajli.length >= 3);
  for (const a of mesajli) assert.equal(a, beklenen);
  for (const a of adresler) assert.ok(a.startsWith('https://wa.me/905380773571'), a);
});

test('kapsamDisiMi borvek ve imalat taleplerini Türkçe büyük harfte de yakalar', () => {
  assert.equal(B.kapsamDisiMi('Seyyar BORVEK lazım'), true);
  assert.equal(B.kapsamDisiMi('Sıfırdan kova'), true);
  assert.equal(B.kapsamDisiMi('YENİ KOVA İMALATI'), true);
  assert.equal(B.kapsamDisiMi('Kova tabanı incelmiş, tırnak kırık'), false);
  assert.equal(B.kapsamDisiMi(''), false);
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
