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

test('WhatsApp bağlantı kartı: mutlak og:url, og:image (1200x800 JPEG), sitemap', () => {
  const ayar = JSON.parse(fs.readFileSync(path.join(KOK, 'site.config.json'), 'utf8'));
  if (!ayar.alanAdi) return;
  for (const { ad, html } of tumSayfalar()) {
    assert.match(html, new RegExp('<meta property="og:url" content="' + ayar.alanAdi.replace(/\./g, '\\.') + '/'), ad);
    assert.match(html, /<meta property="og:image" content="https:\/\/[^"]+\/assets\/images\/logo\.jpg">/, ad);
    assert.match(html, /<meta property="og:title" content="[^"]+">/, ad);
    assert.match(html, /<meta property="og:description" content="[^"]{70,}">/, ad);
    assert.match(html, /<link rel="canonical" href="https:\/\//, ad);
  }
  const resim = fs.readFileSync(path.join(KOK, 'assets/images/logo.jpg'));
  assert.ok(resim.length < 300 * 1024, 'WhatsApp için 300 KB altı');
  assert.ok(fs.readFileSync(path.join(KOK, 'sitemap.xml'), 'utf8').includes(ayar.alanAdi + '/servis-talebi.html'));
  assert.match(fs.readFileSync(path.join(KOK, 'robots.txt'), 'utf8'), /Sitemap: https:\/\//);
});

test('WhatsApp kataloğu: düğme aynı numaranın wa.me/c/ adresini yeni sekmede açar', () => {
  const ayar = JSON.parse(fs.readFileSync(path.join(KOK, 'site.config.json'), 'utf8'));
  if (!ayar.whatsapp.katalog) return;
  assert.equal(ayar.whatsapp.katalog, 'https://wa.me/c/' + ayar.whatsapp.numara);
  for (const ad of ['index', 'servis-talebi']) {
    const bag = sayfaHtml(ad).match(/<a [^>]*href="(https:\/\/wa\.me\/c\/\d+)"[^>]*>[\s\S]*?Hizmet kartlarını WhatsApp'ta aç<\/a>/);
    assert.ok(bag, ad + ': katalog düğmesi yok');
    assert.equal(bag[1], ayar.whatsapp.katalog, ad);
    assert.match(bag[0], /target="_blank"/);
    assert.match(bag[0], /rel="noopener"/);
  }
});

test('alan adı bilinmiyorken sahte alan adı yayımlanmaz', () => {
  const ayar = JSON.parse(fs.readFileSync(path.join(KOK, 'site.config.json'), 'utf8'));
  if (ayar.alanAdi) return;
  for (const { ad, html } of tumSayfalar()) {
    assert.doesNotMatch(html, /github\.io|example\.com|ornek\.com|alanadi/i, ad);
    assert.doesNotMatch(html, /og:url|og:image/, ad);
    assert.match(html, /<link rel="canonical" href="(\.\/|[a-z-]+\.html)">/, ad);
  }
  assert.equal(fs.existsSync(path.join(KOK, 'sitemap.xml')), false);
  assert.doesNotMatch(fs.readFileSync(path.join(KOK, 'robots.txt'), 'utf8'), /Sitemap:/);
});

test('kişi adı yalnızca Mücahit ÇAKIR, unvan "Baş Teknisyen / Master Technician"; Şirket Yönetimi anılır', () => {
  for (const ad of SAYFALAR) {
    const metin = gorunenMetin(ad);
    assert.doesNotMatch(metin, /BAŞ TEKNİSYEN|Baş Uzman|Mücahit Çakır|Usta Başı/, ad);
  }
  assert.match(gorunenMetin('index'), /Mücahit ÇAKIR[\s\S]{0,40}Baş Teknisyen \/ Master Technician/);
  assert.match(gorunenMetin('index'), /Şirket Yönetimi/);
  assert.match(gorunenMetin('hakkimizda'), /Şirket Yönetimi[\s\S]*Mücahit ÇAKIR[\s\S]{0,40}Baş Teknisyen \/ Master Technician/);
  for (const { ad, html } of tumSayfalar()) {
    assert.doesNotMatch(html, /\bCem\b|Şahin|\bCOO\b/i, ad); // \b: "GeoCoordinates" gibi kelimelere takılmasın
  }
  const veri = JSON.parse(sayfaHtml('index').match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(veri.employee, { '@type': 'Person', name: 'Mücahit ÇAKIR', jobTitle: 'Baş Teknisyen / Master Technician' });
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

test('adres ve atölye saatleri tüm sayfalarda tutarlı (08:30–18:00, Cmt 08:30–13:30, Pazar kapalı)', () => {
  for (const ad of SAYFALAR) {
    const metin = gorunenMetin(ad);
    assert.match(metin, /Selimiye, Küçük Sanayi Sitesi, 48200 Milas \/ Muğla/, ad);
    assert.doesNotMatch(metin, /Selimiye Mah\.|Selimiye Mahallesi/, ad + ': eski adres');
    assert.match(metin, /08:30 – 18:00/, ad);
    assert.match(metin, /08:30 – 13:30/, ad);
    assert.match(metin, /Pazar kapalı/, ad);
    assert.doesNotMatch(metin, /08:00|09:00|17:30|19:00/, ad);
  }
  const veri = JSON.parse(sayfaHtml('iletisim').match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(veri.telephone, '+905380773571');
  assert.equal(veri.address.addressLocality, 'Milas');
  assert.deepEqual(veri.openingHoursSpecification.map((o) => [o.opens, o.closes]), [['08:30', '18:00'], ['08:30', '13:30']]);
  const ayar = JSON.parse(fs.readFileSync(path.join(KOK, 'site.config.json'), 'utf8'));
  if (ayar.adres.koordinat) {
    assert.deepEqual([veri.geo.latitude, veri.geo.longitude], [ayar.adres.koordinat.enlem, ayar.adres.koordinat.boylam]);
    const nokta = ayar.adres.koordinat.enlem + ',' + ayar.adres.koordinat.boylam;
    const html = sayfaHtml('index');
    assert.ok(html.includes('maps.google.com/maps?q=' + encodeURIComponent(nokta)), 'harita koordinata işaret etmeli');
    assert.ok(html.includes('destination=' + encodeURIComponent(nokta)), 'yol tarifi koordinata gitmeli');
  } else {
    assert.equal(veri.geo, undefined, 'koordinat bilinmiyorken uydurulmaz');
  }
  assert.equal(veri.aggregateRating, undefined);
  assert.equal(veri.review, undefined);
});

test('işletme bilgileri sabit yazılmaz: sayfa kaynakları ve üreteç site.config.json\'a bağlı', () => {
  const kaynaklar = fs.readdirSync(path.join(KOK, 'kaynak/sayfalar')).map((d) => fs.readFileSync(path.join(KOK, 'kaynak/sayfalar', d), 'utf8'));
  kaynaklar.push(fs.readFileSync(path.join(KOK, 'araclar/sayfa-uret.js'), 'utf8'));
  kaynaklar.push(fs.readFileSync(path.join(KOK, 'assets/js/cekirdek.js'), 'utf8'));
  for (const s of ['site.js', 'servis-talebi.js']) kaynaklar.push(fs.readFileSync(path.join(KOK, 'assets/js', s), 'utf8'));
  for (const k of kaynaklar) {
    assert.doesNotMatch(k, /0538|5380773571|077 35 71/, 'telefon');
    assert.doesNotMatch(k, /Selimiye Mah|Küçük Sanayi|48200/, 'adres');
    assert.doesNotMatch(k, /\b(08|09|13|17|18):(00|30)\b/, 'saat');
    assert.doesNotMatch(k, /Mücahit|Teknisyen|Servis bilgisi Almak/, 'kişi / mesaj');
  }
  const ayarJs = fs.readFileSync(path.join(KOK, 'assets/js/ayar.js'), 'utf8');
  assert.deepEqual(JSON.parse(ayarJs.slice(ayarJs.indexOf('=') + 1).trim().replace(/;$/, '')), JSON.parse(fs.readFileSync(path.join(KOK, 'site.config.json'), 'utf8')));
});

test('ana sayfa: ilk görünen Google Haritalar; Yol Tarifi Al ve Konumu Paylaş; ardından hizmetler, güvence, saatler', () => {
  const html = sayfaHtml('index');
  const govde = html.slice(html.indexOf('<main'));
  assert.ok(govde.indexOf('<iframe class="kahraman-harita__cerceve" src="https://maps.google.com/maps?q=') > 0);
  assert.ok(govde.indexOf('<iframe') < govde.indexOf('<h1'), 'harita ilk bölümde');
  assert.match(govde, /href="https:\/\/www\.google\.com\/maps\/dir\/\?api=1&amp;destination=[^"]+"[^>]*>\s*<span class="eylem__ikon">[\s\S]*?Yol Tarifi Al/);
  assert.match(govde, /<button class="eylem eylem--paylas" type="button" data-paylas [^>]*data-url="https:\/\/www\.google\.com\/maps\/search\/[^"]+"/);
  const sira = ['class="kahraman-harita"', 'id="hizmetler"', 'id="guvence"', 'id="saatler"', 'id="galeri"'].map((s) => govde.indexOf(s));
  assert.ok(sira.every((i) => i >= 0) && sira.every((i, n) => n === 0 || sira[n - 1] < i), String(sira));
});

test('başlık: logo, canlı atölye rozeti, Hemen Ara ve WhatsApp; masaüstü telefon penceresi; mobil alt şerit', () => {
  for (const { ad, html } of tumSayfalar()) {
    const baslik = html.slice(html.indexOf('<header class="baslik">'), html.indexOf('</header>'));
    assert.match(baslik, /class="baslik__sol">\s*<a class="logo"[\s\S]*<p class="rozet rozet--baslik" data-durum>/, ad);
    assert.match(baslik, /<div class="baslik__eylem">\s*<a class="dugme dugme--altin dugme--kucuk" href="tel:\+905380773571">[\s\S]*Hemen Ara<\/a>\s*<a class="dugme dugme--wa/, ad);
    assert.match(html, /<dialog class="tel-pencere" id="telPencere"[\s\S]*data-kopyala="0538 077 35 71"[\s\S]*data-tel-dogrudan/, ad);
    assert.match(html, /<aside class="hizli"[\s\S]*class="hizli__ara"[\s\S]*class="hizli__wa"/, ad);
    const menu = [...html.matchAll(/<ul class="menu__liste"[\s\S]*?<\/ul>/g)][0][0];
    assert.deepEqual([...menu.matchAll(/href="([^"]+)"/g)].map((m) => m[1]), ['./', 'hizmetlerimiz.html', 'hakkimizda.html', 'iletisim.html', 'servis-talebi.html'], ad);
  }
});

test('hizmetler sayfası istenen hizmetleri içerir', () => {
  const metin = gorunenMetin('hizmetlerimiz');
  for (const h of ['Hidrolik Sistem Servisi', 'Şanzıman ve Tork Konvertörü', 'Dizel Motor Revizyonu (Overhaul)', 'Atölye Servisi', 'Yerinde Saha Servisi', 'Kova Tamiri ve Hardox Zırhlama', 'Mekanik Ağır Bakım']) {
    assert.ok(metin.includes(h), h);
  }
  for (const m of ['Greyder', 'Dozer', 'Silindir', 'Forklift', 'Teleskopik yükleyici', 'Beton pompası', 'Transmikser', 'Vinç']) assert.ok(metin.includes(m), m);
});

test('yapılmayan işler, model adı ve uydurma iddialar yok', () => {
  for (const ad of SAYFALAR) {
    const metin = gorunenMetin(ad);
    assert.doesNotMatch(metin, /borvek|imalat|sunulmamaktadır/i, ad);
    assert.doesNotMatch(metin, /hitachi|zaxis|\bzx\s?250/i, ad);
    assert.doesNotMatch(metin, /garanti|sertifika|müşteri yorum|memnun müşteri|\d+\+? yıllık|\d+\.?\d*\+ makine|%\d+/i, ad);
  }
});

test('servis talebi: 3 adım, seçenekler site.config.json\'dan, yalnız dört seçim zorunlu', () => {
  const html = sayfaHtml('servis-talebi');
  const ayar = JSON.parse(fs.readFileSync(path.join(KOK, 'site.config.json'), 'utf8'));
  for (const id of ['adim1', 'adim2', 'adim3']) assert.match(html, new RegExp('id="' + id + '"'), id);
  assert.deepEqual([...html.matchAll(/name="hizmet" value="([^"]+)"/g)].map((m) => m[1]), ayar.servisTalebi.hizmetler.map((h) => h.ad));
  assert.deepEqual([...html.matchAll(/name="aciliyet" value="([^"]+)"/g)].map((m) => m[1]), ayar.servisTalebi.aciliyetler);
  const secenekler = (ad) => [...html.match(new RegExp('<select[^>]*name="' + ad + '"[\\s\\S]*?</select>'))[0].matchAll(/<option>([^<]+)<\/option>/g)].map((m) => m[1]);
  assert.deepEqual(secenekler('ekipman'), ayar.servisTalebi.ekipmanlar);
  assert.deepEqual(secenekler('bolge'), ayar.bolgeler);
  assert.deepEqual(secenekler('kategori'), B.ARIZA_KATEGORILERI);
  assert.match(html, /id="konumAl"/);
  assert.match(html, /href="kvkk\.html"/);
  assert.match(html, /WhatsApp ile Talep Oluştur/);
  assert.deepEqual([...html.matchAll(/<(?:input|textarea|select)[^>]*\srequired[^>]*>/g)].map((m) => m[0].match(/name="([^"]+)"/)[1]), ['hizmet', 'ekipman', 'bolge', 'aciliyet']);
  assert.doesNotMatch(html, /<form[^>]*action=/, 'form bir sunucuya gönderiyormuş gibi görünmemeli');
  assert.doesNotMatch(gorunenMetin('servis-talebi'), /Hidromek|JCB|CAT\b|320D|3CX|102S/, 'örnek model adı yok');
});

test('hizmet sayfasındaki talep bağlantıları geçerli bir hizmete gider', () => {
  const html = sayfaHtml('hizmetlerimiz');
  const nolar = [...html.matchAll(/servis-talebi\.html\?hizmet=(\d+)/g)].map((m) => Number(m[1]));
  assert.ok(nolar.length >= 5);
  for (const n of nolar) assert.ok(n >= 1 && n <= B.HIZMETLER.length, String(n));
});

test('KVKK metni ana sayfada otomatik yüklenen haritayı açıklar', () => {
  const metin = gorunenMetin('kvkk');
  assert.match(metin, /Ana sayfanın en üstündeki harita, sayfa açılırken Google Haritalar'dan yüklenir/);
  assert.match(metin, /WhatsApp ile Talep Oluştur/);
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

test('site.config.json\'da zorunlu alan eksikse üreteç durur, "undefined" yayımlamaz', () => {
  const os = require('os');
  const { spawnSync } = require('child_process');
  const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'baskent-'));
  try {
    for (const d of ['araclar', 'assets', 'kaynak']) fs.cpSync(path.join(KOK, d), path.join(gecici, d), { recursive: true });
    const ayar = JSON.parse(fs.readFileSync(path.join(KOK, 'site.config.json'), 'utf8'));
    delete ayar.adres.satir;
    fs.writeFileSync(path.join(gecici, 'site.config.json'), JSON.stringify(ayar));
    const sonuc = spawnSync(process.execPath, [path.join(gecici, 'araclar/sayfa-uret.js')], { encoding: 'utf8' });
    assert.equal(sonuc.status, 1);
    assert.match(sonuc.stderr, /"adres\.satir" eksik ya da boş/);
    assert.equal(fs.existsSync(path.join(gecici, 'index.html')), false);
  } finally {
    fs.rmSync(gecici, { recursive: true, force: true });
  }
});
