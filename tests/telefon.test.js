const test = require('node:test');
const assert = require('node:assert/strict');
const { cerceveIcindeMi, telBaglantilariniAyarla } = require('../js/telefon.js');

const TEL = 'tel:+905380773571';

// getAttribute / setAttribute taklidi yapan basit bağlantı nesnesi
function baglanti(href) {
  const attr = href === undefined ? {} : { href };
  return {
    getAttribute: (ad) => (ad in attr ? attr[ad] : null),
    setAttribute: (ad, deger) => { attr[ad] = deger; },
  };
}

test('doğrudan açılan sayfa çerçeve içinde sayılmaz', () => {
  const pencere = {};
  pencere.self = pencere;
  pencere.top = pencere;
  assert.equal(cerceveIcindeMi(pencere), false);
});

test('üst pencere farklıysa çerçeve içindedir', () => {
  const pencere = { top: {} };
  pencere.self = pencere;
  assert.equal(cerceveIcindeMi(pencere), true);
});

test('üst pencereye erişim hata verirse çerçeve içinde sayılır', () => {
  const pencere = {};
  pencere.self = pencere;
  Object.defineProperty(pencere, 'top', { get() { throw new Error('SecurityError'); } });
  assert.equal(cerceveIcindeMi(pencere), true);
});

test('doğrudan açılan sayfada tel: bağlantılarına dokunulmaz', () => {
  const a = baglanti(TEL);
  assert.equal(telBaglantilariniAyarla([a], false), 0);
  assert.equal(a.getAttribute('target'), null);
  assert.equal(a.getAttribute('href'), TEL);
});

test('çerçeve içinde yalnızca tel: bağlantıları yeni pencereye yönlenir, numara aynı kalır', () => {
  const tel1 = baglanti(TEL);
  const tel2 = baglanti(TEL);
  const bolum = baglanti('#iletisim');
  const hrefsiz = baglanti(undefined);
  assert.equal(telBaglantilariniAyarla([tel1, bolum, tel2, hrefsiz], true), 2);
  for (const a of [tel1, tel2]) {
    assert.equal(a.getAttribute('target'), '_blank');
    assert.equal(a.getAttribute('rel'), 'noopener');
    assert.equal(a.getAttribute('href'), TEL);
  }
  assert.equal(bolum.getAttribute('target'), null);
  assert.equal(hrefsiz.getAttribute('target'), null);
});

test('bağlantı yoksa hata vermez', () => {
  assert.equal(telBaglantilariniAyarla([], true), 0);
});
