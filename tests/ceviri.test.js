// Çeviriler: her dilde her sayfa var, düzeni Türkçe sayfayla birebir aynı, çevrilmemiş metin yok, WhatsApp mesajı Türkçe.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { KOK, SAYFALAR, cekirdek } = require('./yardimci');

const B = cekirdek();
const DILLER = ['en', 'de', 'es', 'az'];
const ayar = JSON.parse(fs.readFileSync(path.join(KOK, 'site.config.json'), 'utf8'));
const kaynak = (dil, ad) => fs.readFileSync(path.join(KOK, 'kaynak/sayfalar', dil === 'tr' ? '' : dil, ad + '.html'), 'utf8');
const uretilmis = (dil, ad) => fs.readFileSync(path.join(KOK, dil === 'tr' ? '' : dil, ad + '.html'), 'utf8');
const sozluk = (dil) => JSON.parse(fs.readFileSync(path.join(KOK, 'kaynak/ceviri', dil + '.json'), 'utf8'));

// Çevrilen öznitelikler dışında etiketler (adları, sınıfları, bağlantıları, parçaları) birebir aynı kalmalı
const CEVRILEN_OZNITELIK = /\s(alt|title|aria-label|placeholder)="[^"]*"/g;
function parcala(metin) {
  const es = metin.match(/^<!--\s*(\{[\s\S]*?\})\s*-->\s*/);
  const govde = metin.slice(es[0].length);
  const etiketler = [];
  const metinler = [];
  for (const p of govde.match(/<[^>]+>|[^<]+/g)) {
    if (p[0] === '<') etiketler.push(p.replace(CEVRILEN_OZNITELIK, ' $1=""'));
    else if (p.trim()) metinler.push(p.trim());
  }
  const parcalar = (govde.match(/\{\{[^}]+\}\}/g) || []).sort();
  return { meta: JSON.parse(es[1]), etiketler, metinler, parcalar };
}

test('her dilde her sayfanın çevirisi var; düzen, bağlantılar ve parçalar Türkçe sayfayla aynı', () => {
  for (const ad of SAYFALAR) {
    const tr = parcala(kaynak('tr', ad));
    for (const dil of DILLER) {
      const c = parcala(kaynak(dil, ad));
      const yer = dil + '/' + ad;
      assert.deepEqual(Object.keys(c.meta), Object.keys(tr.meta), yer + ': meta alanları');
      for (const k of ['betikler', 'kapanis', 'yapisalVeri', 'dizinleme']) assert.deepEqual(c.meta[k], tr.meta[k], yer + ': ' + k);
      assert.notEqual(c.meta.baslik, tr.meta.baslik, yer + ': başlık çevrilmemiş');
      assert.notEqual(c.meta.aciklama, tr.meta.aciklama, yer + ': açıklama çevrilmemiş');
      assert.equal(c.etiketler.length, tr.etiketler.length, yer + ': etiket sayısı');
      c.etiketler.forEach((e, i) => assert.equal(e, tr.etiketler[i], yer + ': ' + (i + 1) + '. etiket'));
      assert.deepEqual(c.parcalar, tr.parcalar, yer + ': {{parçalar}}');
    }
  }
});

test('çevrilmemiş metin kalmamış (Türkçe cümle aynen bırakılmamış)', () => {
  // Çevrilmeden aynı kalabilecek kısa ya da özel adlı parçalar
  const serbest = /^(\{\{[^}]+\}\}[\s.,:;·—()-]*)+$|^(WhatsApp|AdBlue|Hardox|final drive|Motor|Telefon|Filter|Kabin|Milas \/ Muğla|01|02|03|04|05|06|07|1|2|3|\*|0 \/ 600)$/;
  for (const ad of SAYFALAR) {
    const tr = parcala(kaynak('tr', ad));
    for (const dil of DILLER) {
      const c = parcala(kaynak(dil, ad));
      // Yer tutucu ve noktalama atıldıktan sonra kalan sözcüklerin hepsi her dilde aynı yazılıyorsa çeviri gerekmez
      const kelimeler = (m) => m.replace(/\{\{[^}]+\}\}/g, ' ').replace(/[^\p{L}\s]/gu, ' ').split(/\s+/).filter((k) => k.length >= 3);
      const ayni = c.metinler.filter((m) => !serbest.test(m) && !kelimeler(m).every((k) => serbest.test(k)) && tr.metinler.includes(m));
      assert.deepEqual(ayni, [], dil + '/' + ad + ': Türkçesiyle aynı metin');
    }
  }
});

test('İngilizce, Almanca ve İspanyolca sayfalarda Türkçeye özgü harf yalnızca özel adlarda', () => {
  const ozelAdlar = [ayar.firma, ayar.yetkili.ad, ayar.yetkili.unvan, ayar.adres.satir, ayar.adres.il, ...ayar.bolgeler.filter((b) => !/^Diğer/.test(b)),
    'BAŞKENT', 'İş Makinaları', 'KVKK Aydınlatma Metni (Türkçe)', '“cer”', 'Aydın'];
  for (const dil of ['en', 'de', 'es']) {
    for (const ad of SAYFALAR) {
      let metin = uretilmis(dil, ad).replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<svg class="gorunmez"[\s\S]*?<\/svg>/, ' ')
        .replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
      for (const o of ozelAdlar.sort((a, b) => b.length - a.length)) metin = metin.split(o).join(' ');
      const kalan = metin.match(/[^\s]*[ğışİĞŞ][^\s]*/g) || [];
      assert.deepEqual(kalan, [], dil + '/' + ad);
    }
  }
});

test('üretilmiş sayfalar: dil etiketi, her dile karşılık bağlantısı, dil seçici ve betik çevirisi', () => {
  for (const dil of ['tr', ...DILLER]) {
    for (const ad of SAYFALAR) {
      const html = uretilmis(dil, ad);
      const yer = dil + '/' + ad;
      assert.match(html, new RegExp('<html lang="' + dil + '">'), yer);
      for (const d of ['tr', ...DILLER]) assert.match(html, new RegExp('<link rel="alternate" hreflang="' + d + '" href="[^"]+">'), yer + ' → ' + d);
      assert.match(html, /<link rel="alternate" hreflang="x-default"/, yer);
      assert.match(html, /<details class="dil">/, yer + ': dil seçici');
      assert.match(html, /<a href="[^"]*" hreflang="[a-z]{2}" lang="[a-z]{2}" aria-current="true">/, yer + ': seçili dil');
      assert.doesNotMatch(html, /\{\{|\}\}/, yer + ': doldurulmamış parça');
      assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, yer + ' H1');
      const aciklama = html.match(/<meta name="description" content="([^"]+)"/)[1];
      assert.ok(aciklama.length >= 70 && aciklama.length <= 200, yer + ' açıklama uzunluğu ' + aciklama.length);
      if (dil === 'tr') assert.doesNotMatch(html, /dil-[a-z]{2}\.js/, yer);
      else assert.ok(html.indexOf('assets/js/dil-' + dil + '.js') < html.indexOf('assets/js/cekirdek.js'), yer + ': çeviri betiği çekirdekten önce');
      // Alt klasördeki dillerde yerel varlıklar bir üst klasörden okunur ve gerçekten vardır
      for (const m of html.matchAll(/(?:src|href)="((?:\.\.\/)?(?:assets\/|favicon|manifest)[^"#?]*)"/g)) {
        assert.ok(fs.existsSync(path.join(KOK, dil === 'tr' ? '' : dil, m[1])), yer + ': ' + m[1]);
      }
    }
  }
});

test('WhatsApp\'a giden hazır mesajlar her dilde Türkçe; form değerleri Türkçe, görünen adlar çevrili', () => {
  for (const dil of DILLER) {
    for (const ad of SAYFALAR) {
      const html = uretilmis(dil, ad);
      for (const m of html.matchAll(/wa\.me\/(\d+)\?text=([^"&]+)/g)) {
        const metin = decodeURIComponent(m[2]);
        const izinli = [B.KARSILAMA_KARTLI, B.PARCA_MESAJI, ...B.ARIZA_KATEGORILERI.map((k) => B.hizliMesaj(k))];
        assert.ok(izinli.includes(metin), dil + '/' + ad + ': ' + metin.slice(0, 40));
      }
    }
    const html = uretilmis(dil, 'servis-talebi');
    assert.deepEqual([...html.matchAll(/name="hizmet" value="([^"]+)"/g)].map((m) => m[1]), ayar.servisTalebi.hizmetler.map((h) => h.ad));
    assert.deepEqual([...html.matchAll(/name="aciliyet" value="([^"]+)"/g)].map((m) => m[1]), ayar.servisTalebi.aciliyetler);
    const degerler = (sec) => [...html.match(new RegExp('<select[^>]*name="' + sec + '"[\\s\\S]*?</select>'))[0].matchAll(/<option value="([^"]+)">([^<]+)<\/option>/g)];
    assert.deepEqual(degerler('ekipman').map((m) => m[1]), ayar.servisTalebi.ekipmanlar, dil);
    assert.deepEqual(degerler('bolge').map((m) => m[1]), ayar.bolgeler, dil);
    assert.deepEqual(degerler('kategori').map((m) => m[1]), B.ARIZA_KATEGORILERI, dil);
    assert.ok(degerler('ekipman').every((m) => m[1] !== m[2] || m[1] === 'Forklift' || m[1] === 'Dozer'), dil + ': ekipman adları çevrili');
    assert.match(html, /class="not dil-notu"/, dil + ': mesajın neden Türkçe olduğu yazıyor');
    assert.match(uretilmis(dil, 'kvkk'), /href="\.\.\/kvkk\.html" hreflang="tr"/, dil + ': KVKK Türkçe metnine bağlantı');
  }
});

test('betiklerin ekrana yazdığı her metnin her dilde çevirisi var, fazlası yok', () => {
  const kaynaklar = ['cekirdek.js', 'site.js', 'servis-talebi.js'].map((d) => fs.readFileSync(path.join(KOK, 'assets/js', d), 'utf8')).join('\n');
  const anahtarlar = new Set(B.GUNLER);
  for (const m of kaynaklar.matchAll(/\b(?:ceviri|T)\('((?:[^'\\]|\\.)*)'/g)) anahtarlar.add(m[1].replace(/\\(.)/g, '$1'));
  for (const dil of DILLER) {
    const betik = sozluk(dil).betik;
    for (const a of anahtarlar) {
      assert.ok(Object.prototype.hasOwnProperty.call(betik, a), dil + ': "' + a + '"');
      assert.deepEqual((betik[a].match(/\{\d\}/g) || []).sort(), (a.match(/\{\d\}/g) || []).sort(), dil + ': yer tutucular "' + a + '"');
    }
    assert.deepEqual(Object.keys(betik).filter((k) => !anahtarlar.has(k)), [], dil + ': kullanılmayan betik çevirisi');
    for (const [k, v] of Object.entries(sozluk(dil).uretec)) {
      assert.deepEqual((v.match(/\{\d\}/g) || []).sort(), (k.match(/\{\d\}/g) || []).sort(), dil + ': yer tutucular "' + k + '"');
    }
    const js = fs.readFileSync(path.join(KOK, 'assets/js/dil-' + dil + '.js'), 'utf8');
    assert.deepEqual(JSON.parse(js.slice(js.indexOf('=') + 1).trim().replace(/;$/, '')), { kod: dil, metin: betik }, dil + ': dil betiği güncel');
  }
});

test('çeviri betiği yüklenince çalışma durumu ve hata mesajları sayfa dilinde, WhatsApp mesajı Türkçe', () => {
  const vm = require('vm');
  for (const dil of DILLER) {
    const pencere = { BaskentAyar: ayar, BaskentDil: { kod: dil, metin: sozluk(dil).betik }, Intl, Array, Object, String, Number, Math, Error };
    vm.createContext(pencere);
    vm.runInContext(fs.readFileSync(path.join(KOK, 'assets/js/cekirdek.js'), 'utf8').replace(/typeof module === 'object' && module\.exports/, 'false'), pencere);
    const C = pencere.Baskent;
    const acik = C.durumHesapla({ gun: 1, dakika: 10 * 60 });
    assert.equal(acik.baslik, sozluk(dil).betik['Atölye Açık'], dil);
    assert.ok(acik.ek.includes('18:00'), dil);
    const kapali = C.durumHesapla({ gun: 0, dakika: 12 * 60 });
    assert.equal(kapali.baslik, sozluk(dil).betik['Atölye Kapalı'], dil);
    assert.ok(kapali.ek.includes(sozluk(dil).betik['yarın']) && kapali.ek.includes('08:30'), dil + ': ' + kapali.ek);
    assert.equal(C.talepDogrula({}).hizmet, sozluk(dil).betik['Talep türünü seçin.'], dil);
    const mesaj = C.talepMetni({ hizmet: ayar.servisTalebi.hizmetler[0].ad, ekipman: 'Ekskavatör', aciliyet: 'Şantiye durdu', bolge: 'Milas' });
    assert.equal(mesaj, B.talepMetni({ hizmet: ayar.servisTalebi.hizmetler[0].ad, ekipman: 'Ekskavatör', aciliyet: 'Şantiye durdu', bolge: 'Milas' }), dil + ': mesaj Türkçe');
  }
});
