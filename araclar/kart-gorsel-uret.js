#!/usr/bin/env node
/* WhatsApp kart görselleri — assets/images/kart/<kart>.jpg (1200×630, JPEG, 300 KB altı).
 *
 *   node araclar/kart-gorsel-uret.js
 *
 * Görseller depoda durur; yalnızca site.config.json'daki kart adı, açıklaması ya da ikonu değişince yeniden üretilir.
 * Tarayıcıyla çizildiği için Playwright gerekir (sitenin kendisi buna bağlı değildir):
 *   npm i -g playwright && npx playwright install chromium
 * Metinlerin tamamı site.config.json'dan gelir. */
'use strict';
const fs = require('fs');
const path = require('path');

const KOK = path.resolve(__dirname, '..');
const K = require(path.join(KOK, 'assets/js/cekirdek.js'));
const A = K.AYAR;
const CIKTI = path.join(KOK, 'assets/images/kart');
const SINIR = 300 * 1024;

let playwright;
try { playwright = require('playwright'); } catch (yok) {
  console.error('Playwright bulunamadı. Kurulum: npm i -g playwright && npx playwright install chromium\n(Global kurulumda NODE_PATH="$(npm root -g)" ile çalıştırın.)');
  process.exit(1);
}

const sprite = fs.readFileSync(path.join(KOK, 'kaynak/ikonlar.svg'), 'utf8');
function ikonGovde(ad) {
  const m = sprite.match(new RegExp('<symbol id="i-' + ad + '" viewBox="0 0 24 24">([\\s\\S]*?)</symbol>'));
  if (!m) throw new Error('İkon yok: i-' + ad);
  return m[1];
}
function kacir(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
// Sayfa about:blank'ta açıldığı için yazı tipleri ve logo dosya yolu yerine gömülü (data:) verilir
const MIME = { '.woff2': 'font/woff2', '.png': 'image/png' };
const url = (p) => 'data:' + MIME[path.extname(p)] + ';base64,' + fs.readFileSync(path.join(KOK, p)).toString('base64');

const SAAT = A.calismaSaatleri.filter((s) => s.acilis).map((s) => s.etiket.replace('Pazartesi – Cuma', 'Pzt–Cum').replace('Cumartesi', 'Cmt') + ' ' + s.acilis + '–' + s.kapanis).join('   ·   ');

function sahne(kart, no) {
  const etiket = no ? 'Servis kartı  ' + String(no).padStart(2, '0') : 'Servis kartı';
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>
@font-face { font-family: Archivo; font-weight: 100 900; src: url("${url('assets/fonts/archivo-latin-wght-normal.woff2')}"); }
@font-face { font-family: Archivo; font-weight: 100 900; src: url("${url('assets/fonts/archivo-latin-ext-wght-normal.woff2')}"); unicode-range: U+0100-02BA; }
@font-face { font-family: Figtree; font-weight: 300 900; src: url("${url('assets/fonts/figtree-latin-wght-normal.woff2')}"); }
@font-face { font-family: Figtree; font-weight: 300 900; src: url("${url('assets/fonts/figtree-latin-ext-wght-normal.woff2')}"); unicode-range: U+0100-02BA; }
* { margin: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; }
body { background: #101827; color: #f5f6f8; font-family: Figtree, sans-serif; position: relative; overflow: hidden; }
/* İnce teknik çizim ızgarası; sağa doğru kaybolur */
.izgara { position: absolute; inset: 0;
  background-image: linear-gradient(rgba(167,175,186,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(167,175,186,.07) 1px, transparent 1px);
  background-size: 30px 30px; background-position: -1px -1px;
  -webkit-mask-image: linear-gradient(90deg, #000 0, rgba(0,0,0,.35) 62%, transparent 100%); }
.sol { position: absolute; left: 72px; top: 58px; bottom: 54px; width: 690px; display: flex; flex-direction: column; }
.marka { display: flex; align-items: center; gap: 16px; }
.marka img { width: 82px; height: auto; border-radius: 5px; }
.marka b { display: block; font: 800 26px/1 Archivo; letter-spacing: .03em; }
.marka span { display: block; margin-top: 6px; font-size: 15px; letter-spacing: .2em; text-transform: uppercase; color: #a7afba; }
.govde { margin-top: auto; margin-bottom: auto; padding-top: 18px; }
.ust { display: flex; align-items: center; gap: 14px; font: 700 17px/1 Figtree; letter-spacing: .22em; text-transform: uppercase; color: #d6a64f; }
.ust::before { content: ""; width: 38px; height: 3px; background: #d6a64f; }
h1 { margin-top: 22px; font: 800 76px/.98 Archivo; letter-spacing: -.012em; text-wrap: balance; max-width: 13ch; }
h1.uzun { font-size: 66px; }
p { margin-top: 24px; font-size: 29px; line-height: 1.3; color: #c5cbd3; max-width: 24ch; text-wrap: pretty; }
.alt { display: flex; align-items: center; gap: 22px; font-size: 19px; color: #a7afba; }
.alt b { font: 800 25px/1 Archivo; color: #f5f6f8; letter-spacing: .02em; font-variant-numeric: tabular-nums; }
.wa { width: 12px; height: 12px; border-radius: 50%; background: #25d366; box-shadow: 0 0 0 5px rgba(37,211,102,.18); }
/* Sağ pano: altın kenar çizgisi + kesik köşe */
.pano { position: absolute; top: 0; right: 0; bottom: 0; width: 360px; background: #171b22;
  clip-path: polygon(64px 0, 100% 0, 100% 100%, 0 100%, 0 64px); }
.pano::before { content: ""; position: absolute; left: 0; top: 64px; bottom: 0; width: 5px; background: #d6a64f; }
.pano::after { content: ""; position: absolute; left: 0; top: 0; width: 91px; height: 5px; background: #d6a64f; transform-origin: 0 0; transform: translate(0, 64px) rotate(-45deg); }
.sekil { position: absolute; right: 70px; top: 158px; width: 226px; height: 226px; color: #d6a64f; }
.sekil svg { width: 100%; height: 100%; fill: none; stroke: currentColor; stroke-width: .36; stroke-linecap: round; stroke-linejoin: round; overflow: visible; }
.olcu { position: absolute; right: 70px; width: 226px; top: 410px; height: 14px; border-left: 1.5px solid #6b7380; border-right: 1.5px solid #6b7380; }
.olcu::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; border-top: 1.5px solid #6b7380; }
.olcu span { position: absolute; left: 50%; top: -1px; transform: translate(-50%, -50%); padding: 0 10px; background: #171b22; font: 600 13px/1 Figtree; letter-spacing: .18em; color: #8a929e; text-transform: uppercase; white-space: nowrap; }
.yer { position: absolute; right: 70px; bottom: 58px; text-align: right; font: 700 16px/1.5 Figtree; letter-spacing: .14em; text-transform: uppercase; color: #a7afba; }
.yer b { color: #f5f6f8; font-weight: 800; }
</style></head><body>
<div class="izgara"></div>
<div class="pano"></div>
<div class="sekil"><svg viewBox="0 0 24 24">${ikonGovde(kart.ikon)}</svg></div>
<div class="olcu"><span>${kacir(etiket)}</span></div>
<div class="yer"><b>${kacir(A.adres.ilce)}</b> / ${kacir(A.adres.il)}<br>Atölye + saha</div>
<div class="sol">
  <div class="marka"><img src="${url('assets/images/logo-isaret.png')}" alt=""><div><b>BAŞKENT</b><span>İş Makinaları</span></div></div>
  <div class="govde">
    <div class="ust">${no ? 'Hizmet' : 'Servis bilgisi'}</div>
    <h1${kart.ad.length > 22 ? ' class="uzun"' : ''}>${kacir(kart.ad).replace(/ \/ /g, '\u00a0/ ')}</h1>
    <p>${kacir(kart.aciklama)}</p>
  </div>
  <div class="alt"><span class="wa"></span><b>${kacir(A.telefon.gorunen)}</b><span>${kacir(SAAT)}</span></div>
</div>
</body></html>`;
}

(async () => {
  fs.mkdirSync(CIKTI, { recursive: true });
  const tarayici = await playwright.chromium.launch();
  const sayfa = await tarayici.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const yazilan = [];
  for (const [i, kart] of K.KARTLAR.entries()) {
    await sayfa.setContent(sahne(kart, i), { waitUntil: 'load' });
    await sayfa.evaluate(() => document.fonts.ready);
    // Başlık taşarsa (3 satırdan uzun) yayımlamadan durur
    const satir = await sayfa.evaluate(() => { const h = document.querySelector('h1'); return Math.round(h.getBoundingClientRect().height / parseFloat(getComputedStyle(h).lineHeight)); });
    if (satir > 3) throw new Error(kart.kart + ': başlık çok uzun (' + satir + ' satır)');
    let kalite = 86;
    let resim;
    do { resim = await sayfa.screenshot({ type: 'jpeg', quality: kalite }); kalite -= 6; } while (resim.length > SINIR && kalite > 50);
    if (resim.length > SINIR) throw new Error(kart.kart + ': 300 KB altına inmedi');
    fs.writeFileSync(path.join(CIKTI, kart.kart + '.jpg'), resim);
    yazilan.push(kart.kart + '.jpg (' + Math.round(resim.length / 1024) + ' KB)');
  }
  await tarayici.close();
  console.log('Yazıldı: ' + yazilan.join(', '));
})().catch((hata) => { console.error('Görsel üretimi durdu: ' + hata.message); process.exit(1); });
