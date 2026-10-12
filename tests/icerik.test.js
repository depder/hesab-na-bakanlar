const test = require('node:test');
const assert = require('node:assert/strict');
const { sayfaHtml, gorunenMetin } = require('./yardimci');

const html = sayfaHtml();
const metin = gorunenMetin();
const ISLEMLER = ['Hidrolik sistem tamir ve bakım', 'Motor tamir, bakım ve revizyon', 'Kova tamiri ve Hardox zırhlama', 'Mekanik ağır bakım'];

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

test('yapılmayan işlerden (borvek, imalat) sitede hiç söz edilmez', () => {
  assert.doesNotMatch(metin, /borvek|imalat|sunulmamaktadır/i);
  assert.doesNotMatch(html, /borvek|sıfırdan imalat/i);
});

test('örnek alınan makine modelinin adı sitede geçmez', () => {
  assert.doesNotMatch(metin, /hitachi|zaxis|\bzx\s?250/i);
});

test('hidrolik ve motor hizmetleri öne çıkar: ilk iki hizmet kartı', () => {
  const basliklar = [...html.matchAll(/<article class="hizmet([^"]*)"[\s\S]*?<h3>([^<]+)<\/h3>/g)].map((m) => ({ sinif: m[1], baslik: m[2] }));
  assert.equal(basliklar.length, 4);
  assert.match(basliklar[0].baslik, /^Hidrolik Sistem/);
  assert.match(basliklar[1].baslik, /^Motor/);
  assert.match(basliklar[0].sinif, /hizmet--one/);
  assert.match(basliklar[1].sinif, /hizmet--one/);
  assert.match(metin, /Her marka kepçe, ekskavatör ve vinç/);
});

test('form işlemleri hizmetlerle aynı, sırası hidrolik ve motorla başlar', () => {
  const islemler = [...html.matchAll(/name="islem" value="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(islemler, ISLEMLER);
  const kartBaglari = [...html.matchAll(/data-islem="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(kartBaglari, ISLEMLER);
  assert.match(html, /name="makine" value="Vinç"/);
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
