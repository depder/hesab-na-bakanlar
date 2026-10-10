const test = require('node:test');
const assert = require('node:assert/strict');
const { calismaDurumu, istanbulZamani } = require('../js/saatler.js');

const PZT = 1, CUMA = 5, CMT = 6, PAZAR = 0;
const dk = (s, d) => s * 60 + d;

test('hafta içi mesai saatinde açık', () => {
  assert.deepEqual(calismaDurumu(PZT, dk(9, 0)), { acik: true, baslik: 'Şu an açığız', ek: 'kapanış 17:30' });
  assert.equal(calismaDurumu(PZT, dk(13, 15)).acik, true);
});

test('kapanışa 30 dakika kala "kapanmak üzereyiz"', () => {
  assert.equal(calismaDurumu(PZT, dk(16, 59)).baslik, 'Şu an açığız');
  assert.equal(calismaDurumu(PZT, dk(17, 0)).baslik, 'Kapanmak üzereyiz');
  assert.equal(calismaDurumu(PZT, dk(17, 29)).baslik, 'Kapanmak üzereyiz');
});

test('açılıştan önce kapalı, aynı gün açılış gösterilir', () => {
  assert.deepEqual(calismaDurumu(PZT, dk(8, 59)), { acik: false, baslik: 'Şu an kapalıyız', ek: 'açılış bugün 09:00' });
});

test('kapanış anında ve sonrasında kapalı, ertesi gün açılış', () => {
  assert.deepEqual(calismaDurumu(PZT, dk(17, 30)), { acik: false, baslik: 'Şu an kapalıyız', ek: 'açılış yarın 09:00' });
  assert.equal(calismaDurumu(CUMA, dk(22, 0)).ek, 'açılış yarın 09:00');
});

test('cumartesi 09:00–13:30 açık', () => {
  assert.deepEqual(calismaDurumu(CMT, dk(10, 0)), { acik: true, baslik: 'Şu an açığız', ek: 'kapanış 13:30' });
  assert.equal(calismaDurumu(CMT, dk(13, 30)).acik, false);
});

test('cumartesi kapanıştan sonra ve pazar günü bir sonraki açılış pazartesi', () => {
  assert.equal(calismaDurumu(CMT, dk(13, 30)).ek, 'açılış Pazartesi 09:00');
  assert.deepEqual(calismaDurumu(PAZAR, dk(12, 0)), { acik: false, baslik: 'Şu an kapalıyız', ek: 'açılış yarın 09:00' });
});

test('saat Türkiye saatine göre hesaplanır (UTC+3)', () => {
  // 12 Ekim 2026 Pazartesi, 06:00 UTC = 09:00 İstanbul
  assert.deepEqual(istanbulZamani(new Date('2026-10-12T06:00:00Z')), { gun: PZT, dakika: 540 });
  // 11 Ekim 2026 Pazar 22:30 UTC = 12 Ekim Pazartesi 01:30 İstanbul
  assert.deepEqual(istanbulZamani(new Date('2026-10-11T22:30:00Z')), { gun: PZT, dakika: 90 });
});
