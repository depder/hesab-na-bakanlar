// Test yardımcıları: iş mantığı assets/js/cekirdek.js'ten, sayfalar kök klasördeki üretilmiş HTML'den okunur.
const fs = require('fs');
const path = require('path');

const KOK = path.join(__dirname, '..');
const SAYFALAR = ['index', 'hizmetlerimiz', 'servis-talebi', 'hakkimizda', 'iletisim', 'kvkk'];

function sayfaHtml(ad = 'index') {
  return fs.readFileSync(path.join(KOK, ad + '.html'), 'utf8');
}

function tumSayfalar() {
  return SAYFALAR.map((ad) => ({ ad, html: sayfaHtml(ad) }));
}

function cekirdek() {
  return require(path.join(KOK, 'assets/js/cekirdek.js'));
}

// Betikleri, ikon tanımlarını ve etiketleri çıkarır; yalnızca ziyaretçinin gördüğü metin kalır
function gorunenMetin(ad = 'index') {
  return sayfaHtml(ad)
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ');
}

module.exports = { KOK, SAYFALAR, sayfaHtml, tumSayfalar, cekirdek, gorunenMetin };
