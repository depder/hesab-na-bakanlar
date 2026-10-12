// index.html tek dosyadır: testler sayfadaki <script id="cekirdek"> bloğunu doğrudan çalıştırır.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SAYFA = path.join(__dirname, '..', 'index.html');

function sayfaHtml() {
  return fs.readFileSync(SAYFA, 'utf8');
}

function cekirdek() {
  const html = sayfaHtml();
  const eslesme = html.match(/<script id="cekirdek">([\s\S]*?)<\/script>/);
  if (!eslesme) throw new Error('index.html içinde <script id="cekirdek"> bulunamadı');
  const modul = { exports: {} };
  // Aynı realm'de çalıştırılır ki dönen nesneler deepStrictEqual ile karşılaştırılabilsin
  vm.runInThisContext(`(function (module) {\n${eslesme[1]}\n})`, { filename: 'index.html#cekirdek' })(modul);
  return modul.exports;
}

// Gömülü görselleri (base64) ve betikleri çıkarır; yalnızca ziyaretçinin gördüğü metin kalır
function gorunenMetin() {
  return sayfaHtml()
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
}

module.exports = { sayfaHtml, cekirdek, gorunenMetin };
