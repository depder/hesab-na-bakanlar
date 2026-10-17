const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { KOK, SAYFALAR, sayfaHtml, tumSayfalar, cekirdek, gorunenMetin } = require('./yardimci');

const B = cekirdek();

test('her sayfa var, Türkçe, tek H1, benzersiz başlık ve açıklama taşır', () => {
  const basliklar = new Set();
  const aciklamalar = new Set();
  for (const { ad, html } of tumSayfalar()) {
    assert.match(html, /<html lang="tr">/, ad);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, ad + ' H1');
    const baslik = html.match(/<title>([^<]+)<\/title>/)[1];
    const aciklama = html.match(/<meta name="description" content="([^"]+)"/)[1];
    assert.ok(aciklama.length >= 70 && aciklama.length <= 200, ad + ' açıklama uzunluğu ' + aciklama.length);
    basliklar.add(baslik);
    aciklamalar.add(aciklama);
    assert.match(html, /<link rel="canonical" href="[^"]+">/, ad);
    assert.match(html, /<meta property="og:title"/, ad);
    assert.doesNotMatch(html, /\{\{|\}\}/, ad + ': doldurulmamış parça');
  }
  assert.equal(basliklar.size, SAYFALAR.length);
  assert.equal(aciklamalar.size, SAYFALAR.length);
});

test('başlık düzeni: H2 öncesinde H3 yok (H1 → H2 → H3)', () => {
  for (const { ad, html } of tumSayfalar()) {
    const govde = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
    const sira = [...govde.matchAll(/<h([1-3])[\s>]/g)].map((m) => Number(m[1]));
    let enYuksek = 0;
    for (const s of sira) { assert.ok(s <= enYuksek + 1, ad + ': h' + s + ' atlıyor'); enYuksek = Math.max(enYuksek, s); }
  }
});

test('alan adı bilinmiyorken sahte alan adı yayımlanmaz', () => {
  const ayar = JSON.parse(fs.readFileSync(path.join(KOK, 'kaynak/site.json'), 'utf8'));
  if (ayar.alanAdi) return;
  for (const { ad, html } of tumSayfalar()) {
    assert.doesNotMatch(html, /github\.io|example\.com|ornek\.com|alanadi/i, ad);
    assert.doesNotMatch(html, /og:url|og:image/, ad);
    assert.match(html, /<link rel="canonical" href="(\.\/|[a-z-]+\.html)">/, ad);
  }
  assert.equal(fs.existsSync(path.join(KOK, 'sitemap.xml')), false);
  assert.doesNotMatch(fs.readFileSync(path.join(KOK, 'robots.txt'), 'utf8'), /Sitemap:/);
});

test('kişi adı yalnızca Mücahit ÇAKIR, unvan her yerde BAŞ TEKNİSYEN', () => {
  for (const ad of SAYFALAR) {
    const metin = gorunenMetin(ad);
    assert.doesNotMatch(metin, /Baş Teknisyen|Master Technician|Baş Uzman|Mücahit Çakır|Usta Başı/, ad);
  }
  assert.match(gorunenMetin('index'), /Mücahit ÇAKIR[\s\S]{0,40}BAŞ TEKNİSYEN/);
  for (const { ad, html } of tumSayfalar()) {
    assert.doesNotMatch(html, /\bCem\b|Şahin/i, ad);
  }
  const veri = JSON.parse(sayfaHtml('index').match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(veri.employee, { '@type': 'Person', name: 'Mücahit ÇAKIR', jobTitle: 'BAŞ TEKNİSYEN' });
});

test('tek telefon numarası: 0538 077 35 71', () => {
  for (const { ad, html } of tumSayfalar()) {
    const telHref = [...html.matchAll(/href="tel:([^"]+)"/g)].map((m) => m[1]);
    assert.ok(telHref.length >= 3, ad);
    for (const t of telHref) assert.equal(t, '+905380773571', ad);
    for (const m of html.matchAll(/wa\.me\/(\d+)/g)) assert.equal(m[1], '905380773571', ad);
    const gorunen = [...gorunenMetin(ad).matchAll(/\b0?5\d{2} ?\d{3} ?\d{2} ?\d{2}\b/g)].map((m) => m[0].replace(/\D/g, '').replace(/^0/, ''));
    for (const n of gorunen) assert.ok(n === '5380773571' || n === '5xxxxxxxxx', ad + ': ' + n);
  }
});

test('adres ve atölye saatleri tüm sayfalarda tutarlı', () => {
  for (const ad of SAYFALAR) {
    const metin = gorunenMetin(ad);
    assert.match(metin, /Selimiye Mah\. Sanayi Sitesi, Milas \/ Muğla/, ad);
    assert.match(metin, /09:00 – 17:30/, ad);
    assert.match(metin, /09:00 – 13:30/, ad);
    assert.doesNotMatch(metin, /08:00|18:00|19:00|Pazar 09/, ad);
  }
  const veri = JSON.parse(sayfaHtml('iletisim').match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(veri.telephone, '+90-538-077-35-71');
  assert.equal(veri.address.addressLocality, 'Milas');
  assert.deepEqual(veri.openingHoursSpecification.map((o) => [o.opens, o.closes]), [['09:00', '17:30'], ['09:00', '13:30']]);
  assert.equal(veri.aggregateRating, undefined);
  assert.equal(veri.review, undefined);
});

test('ana sayfa: istenen başlık, açıklama ve iki düğme; harita → iletişim → galeri sırası', () => {
  const html = sayfaHtml('index');
  const metin = gorunenMetin('index');
  assert.match(metin, /Gücün arkasındaki mühendislik\./);
  assert.match(metin, /İş makinelerinde hidrolik sistemler, şanzıman ve dizel motor revizyonu için profesyonel servis çözümleri\./);
  assert.match(html, /href="is-emri\.html">Servis Talebi Oluştur/);
  assert.match(html, /href="hizmetler\.html">Hizmetlerimizi İncele</);
  const sira = ['id="konum"', 'id="iletisim-bilgileri"', 'id="galeri"'].map((s) => html.indexOf(s));
  assert.ok(sira.every((i) => i > 0) && sira[0] < sira[1] && sira[1] < sira[2], String(sira));
});

test('hizmetler sayfası istenen hizmetleri içerir', () => {
  const metin = gorunenMetin('hizmetler');
  for (const h of ['Hidrolik Sistem Servisi', 'Şanzıman ve Tork Konvertörü', 'Dizel Motor Revizyonu (Overhaul)', 'Atölye Servisi', 'Yerinde Saha Servisi', 'Kova Tamiri ve Hardox Zırhlama', 'Mekanik Ağır Bakım']) {
    assert.ok(metin.includes(h), h);
  }
  for (const m of ['Greyder', 'Dozer', 'Silindir', 'Forklift', 'Teleskopik yükleyici', 'Beton pompası', 'Transmikser', 'Vinç']) assert.ok(metin.includes(m), m);
});

test('yapılmayan işler, model adı ve uydurma iddialar yok', () => {
  for (const ad of SAYFALAR) {
    const metin = gorunenMetin(ad);
    assert.doesNotMatch(metin, /borvek|sıfırdan imalat|sunulmamaktadır/i, ad);
    assert.doesNotMatch(metin, /hitachi|zaxis|\bzx\s?250/i, ad);
    assert.doesNotMatch(metin, /garanti|sertifika|müşteri yorum|memnun müşteri|\d+\+? yıllık|\d+\.?\d*\+ makine|%\d+/i, ad);
  }
});

test('servis talebi formu: istenen alanlar, altı kategori, KVKK bağlantısı', () => {
  const html = sayfaHtml('is-emri');
  for (const ad of ['ad', 'telefon', 'marka', 'model', 'seriNo', 'aciklama', 'adres']) assert.match(html, new RegExp('name="' + ad + '"'), ad);
  const kategoriler = [...html.matchAll(/name="kategori" value="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(kategoriler, B.ARIZA_KATEGORILERI);
  assert.match(html, /id="konumAl"/);
  assert.match(html, /href="kvkk\.html"/);
  // Zorunlu olan yalnızca ad ve kategori
  assert.deepEqual([...html.matchAll(/<(?:input|textarea|select)[^>]*\srequired[^>]*>/g)].map((m) => m[0].match(/name="([^"]+)"/)[1]), ['ad', 'kategori']);
  assert.doesNotMatch(html, /<form[^>]*action=/, 'form bir sunucuya gönderiyormuş gibi görünmemeli');
});

test('iletişim sayfasında altı WhatsApp hızlı arıza kartı var', () => {
  const html = sayfaHtml('iletisim');
  const adresler = [...html.matchAll(/<ul class="hizli-ariza">([\s\S]*?)<\/ul>/g)][0][1].match(/<a href="([^"]+)"/g).map((h) => h.slice(9, -1).replace(/&amp;/g, '&'));
  assert.deepEqual(adresler, B.ARIZA_KATEGORILERI.map((k) => B.waAdresi(B.hizliMesaj(k))));
});

test('dış bağlantılar yeni sekmede ve noopener ile açılır', () => {
  for (const { ad, html } of tumSayfalar()) {
    for (const m of html.matchAll(/<a [^>]*href="https?:[^"]+"[^>]*>/g)) {
      assert.match(m[0], /target="_blank"/, ad + ': ' + m[0].slice(0, 80));
      assert.match(m[0], /rel="noopener"/, ad + ': ' + m[0].slice(0, 80));
    }
  }
});

test('yerel varlıklar mevcut; üçüncü taraf betik/yazı tipi yok', () => {
  for (const { ad, html } of tumSayfalar()) {
    for (const m of html.matchAll(/(?:src|href)="((?:assets\/|favicon|manifest)[^"#?]*)"/g)) {
      assert.ok(fs.existsSync(path.join(KOK, m[1])), ad + ': ' + m[1]);
    }
    assert.doesNotMatch(html, /<script[^>]+src="https?:/, ad);
    assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic|api\.fontshare/, ad);
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(KOK, 'manifest.webmanifest'), 'utf8'));
  for (const i of manifest.icons) assert.ok(fs.existsSync(path.join(KOK, i.src)), i.src);
});

test('üretilmiş sayfalar kaynakla güncel (node araclar/sayfa-uret.js çalıştırılmış)', () => {
  const enYeniKaynak = Math.max(...fs.readdirSync(path.join(KOK, 'kaynak/sayfalar')).map((d) => fs.statSync(path.join(KOK, 'kaynak/sayfalar', d)).mtimeMs));
  for (const ad of SAYFALAR) {
    const kaynak = fs.readFileSync(path.join(KOK, 'kaynak/sayfalar', ad + '.html'), 'utf8');
    const ilkCumle = kaynak.match(/<h1[^>]*>([^<]+)/)[1];
    assert.ok(sayfaHtml(ad).includes(ilkCumle), ad);
  }
  assert.ok(enYeniKaynak > 0);
});
