const test = require('node:test');
const assert = require('node:assert/strict');
const { sayfaHtml, gorunenMetin } = require('./yardimci');

const html = sayfaHtml();
const metin = gorunenMetin();
const KAPSAM_CUMLESI = 'Seyyar borvek ve sıfırdan imalat şu anda sunulmamaktadır.';

test('kişi adı olarak yalnızca Mücahit Çakır geçer', () => {
  assert.match(metin, /Mücahit Çakır/);
  assert.match(metin, /Master Technician \(Baş Uzman\)/);
  assert.doesNotMatch(html, /\bCem\b/i);
  assert.doesNotMatch(html, /Şahin/i);
});

test('sayfada tek telefon numarası var: 0538 077 35 71', () => {
  const telHref = [...html.matchAll(/href="tel:([^"]+)"/g)].map((m) => m[1]);
  assert.ok(telHref.length >= 5);
  for (const t of telHref) assert.equal(t, '+905380773571');
  const waNumaralari = [...html.matchAll(/wa\.me\/(\d+)/g)].map((m) => m[1]);
  for (const n of waNumaralari) assert.equal(n, '905380773571');
  const gorunenNumaralar = [...metin.matchAll(/\b0?5\d{2} ?\d{3} ?\d{2} ?\d{2}\b/g)].map((m) => m[0].replace(/\D/g, ''));
  assert.ok(gorunenNumaralar.length >= 5);
  for (const n of gorunenNumaralar) assert.equal(n.replace(/^0/, ''), '5380773571');
});

test('hizmet kapsamı sınırı hem kapsam bölümünde hem formda açıkça yazılı', () => {
  const kapsamBolumu = html.slice(html.indexOf('id="kapsam"'), html.indexOf('id="hizmetler"'));
  const form = html.slice(html.indexOf('id="isEmriFormu"'), html.indexOf('</form>'));
  assert.ok(kapsamBolumu.includes(KAPSAM_CUMLESI));
  assert.ok(form.includes(KAPSAM_CUMLESI));
  for (const alan of ['Kova tamiri', 'Hardox kaynak kaplama', 'Hidrolik piston revizyonu', 'Mekanik ağır bakım']) {
    assert.ok(kapsamBolumu.includes(alan), alan);
    assert.ok(form.includes(`value="${alan}"`), alan);
  }
});

test('formda yalnızca kapsamdaki dört işlem seçilebilir', () => {
  const islemler = [...html.matchAll(/name="islem" value="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(islemler, ['Kova tamiri', 'Hardox kaynak kaplama', 'Hidrolik piston revizyonu', 'Mekanik ağır bakım']);
});

test('iletişim bilgileri ve çalışma saatleri yazılı', () => {
  assert.match(metin, /Selimiye Mah\. Sanayi Sitesi, Milas \/ Muğla/);
  assert.match(metin, /09:00 – 17:30/);
  assert.match(metin, /09:00 – 13:30/);
  assert.match(metin, /Didim/);
});

test('tek dosya: yerel css/js bağlantısı ve kalmış yer tutucu yok', () => {
  assert.doesNotMatch(html, /(href|src)="(css|js)\//);
  assert.doesNotMatch(html, /%%[A-Z_]+%%/);
  assert.match(html, /<script id="cekirdek">/);
  assert.match(html, /data:image\/webp;base64,/);
});

test('Three.js sabit sürümle CDN üzerinden yüklenir', () => {
  assert.match(html, /https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.170\.0\/build\/three\.module\.min\.js/);
});

test('yazı tipleri Archivo ve Figtree', () => {
  assert.match(html, /family=Archivo:wdth,wght@/);
  assert.match(html, /family=Figtree:wght@/);
});

test('yapısal veri (JSON-LD) geçerli JSON ve doğru bilgileri taşır', () => {
  const blok = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(blok);
  const veri = JSON.parse(blok[1]);
  assert.equal(veri.name, 'Başkent İş Makinaları');
  assert.equal(veri.telephone, '+90-538-077-35-71');
  assert.equal(veri.employee.name, 'Mücahit Çakır');
  assert.equal(veri.address.addressLocality, 'Milas');
});
