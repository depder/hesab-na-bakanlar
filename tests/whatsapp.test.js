const test = require('node:test');
const assert = require('node:assert/strict');
const { whatsappSekmesiAc } = require('../js/whatsapp.js');

const URL_ = 'https://wa.me/905380773571?text=deneme';

test('sekme açılırsa opener kesilir, sonra WhatsApp yüklenir', () => {
  const sira = [];
  const sekme = {
    location: { set href(u) { sira.push(['href', u, sekme.opener]); } },
    set opener(v) { sira.push(['opener', v]); this._opener = v; },
    get opener() { return this._opener; },
  };
  const cagrilar = [];
  const sonuc = whatsappSekmesiAc(URL_, (...a) => { cagrilar.push(a); return sekme; });

  assert.equal(sonuc, true);
  assert.deepEqual(cagrilar, [['', '_blank']]);
  // opener, adres yüklenmeden önce null olmalı
  assert.deepEqual(sira, [['opener', null], ['href', URL_, null]]);
});

test('tarayıcı sekmeyi engellerse (null) false döner', () => {
  assert.equal(whatsappSekmesiAc(URL_, () => null), false);
});

test('window.open hata verirse false döner, hata dışarı çıkmaz', () => {
  assert.equal(whatsappSekmesiAc(URL_, () => { throw new Error('izin yok'); }), false);
});
