# Başkent İş Makinaları — web sitesi

İş makinelerinde hidrolik sistem, şanzıman ve tork konvertörü, dizel motor revizyonu; atölye ve 7/24 yerinde saha servisi veren atölyenin (Selimiye Mah. Sanayi Sitesi, Milas / Muğla) çok sayfalı tanıtım sitesi.

Saf HTML, CSS ve JavaScript. Derleme adımı ve sunucu yoktur; kök klasördeki dosyaları herhangi bir statik barındırmaya (GitHub Pages, Netlify, Cloudflare Pages, cPanel vb.) yüklemek yeterlidir.

## Sayfalar

| Dosya | İçerik |
|---|---|
| `index.html` | Karşılama ve ekskavatör çizimi, konum (harita), iletişim bilgileri, uzmanlık alanları, galeri |
| `hizmetler.html` | Hizmetler, servis verilen makineler, sık sorulanlar |
| `surec.html` | Servis süreci, atölye saatleri, saha servisi ve hizmet bölgesi |
| `is-emri.html` | Servis talebi formu (konum ekleme, WhatsApp'a aktarma) |
| `iletisim.html` | Telefon, WhatsApp, adres, WhatsApp hızlı arıza kartları, harita |
| `kvkk.html` | KVKK aydınlatma metni |

## Klasör yapısı

```
*.html                  üretilmiş sayfalar (doğrudan düzenlemeyin, aşağıya bakın)
favicon.svg, robots.txt, manifest.webmanifest
assets/css/site.css     tasarım sistemi (renk, yazı, boşluk değişkenleri ve bileşenler)
assets/js/cekirdek.js   iş mantığı: çalışma durumu, WhatsApp mesajı, form doğrulama
assets/js/site.js       menü, canlı durum, harita, Lenis + GSAP animasyonları
assets/js/is-emri.js    servis talebi formu ve konum
assets/js/vendor/       Lenis 1.3.27, GSAP 3.15.0 + ScrollTrigger
.claude/skills/         frontend-design, karpathy-guidelines (Claude Code becerileri)
.claude/agents/         backend-dev, code-reviewer, debugger, test-writer (Claude Code ekibi)
assets/fonts/           Archivo ve Figtree (OFL-1.1, Türkçe karakterli alt kümeler)
assets/images/          logo
assets/icons/           favicon ve uygulama ikonları
kaynak/sayfalar/        sayfa içerikleri (düzenlenecek yer)
kaynak/site.json        alan adı ayarı
kaynak/galeri.json      galeri fotoğrafları listesi
araclar/sayfa-uret.js   sayfa üreteci
tests/                  testler
```

## Düzenleme ve yeniden üretme

Ortak üst bilgi, menü, alt bilgi ve ikonlar tek yerde (`araclar/sayfa-uret.js`) durur; sayfaların içerikleri `kaynak/sayfalar/` altındadır. Bir değişiklikten sonra (Node.js 18 veya üstü gerekir, paket kurulumu gerekmez):

```
node araclar/sayfa-uret.js    # kök klasördeki .html dosyalarını, robots.txt ve manifest'i yeniden yazar
node --test                   # testler
```

### Bilgiler nerede

| Ne | Nerede |
|---|---|
| Telefon / WhatsApp numarası, hazır mesaj | `assets/js/cekirdek.js` → `TELEFON`, `KARSILAMA` |
| Atölye çalışma saatleri (canlı durum) | `assets/js/cekirdek.js` → `SAATLER`; tablo: `araclar/sayfa-uret.js` → `SAATLER_TABLOSU` |
| Arıza kategorileri | `assets/js/cekirdek.js` → `ARIZA_KATEGORILERI` |
| Adres, harita bağlantıları, yapısal veri | `araclar/sayfa-uret.js` |
| Renkler ve yazı tipleri | `assets/css/site.css` → `:root` |

### Alan adı (canonical, sitemap)

Sitenin yayınlanacağı alan adı belli olunca `kaynak/site.json` içine yazın ve üreteci çalıştırın:

```json
{ "alanAdi": "https://www.ornek-alan-adi.com" }
```

Bu durumda canonical bağlantıları mutlak olur, Open Graph görseli eklenir, `sitemap.xml` üretilir ve `robots.txt`'ye eklenir. Alan adı boşken sahte adres yayımlanmaz.

### Galeriye fotoğraf ekleme

Fotoğrafları (tercihen 1600 px genişliğe küçültülmüş WebP) `assets/images/galeri/` altına koyun ve `kaynak/galeri.json`'a ekleyin:

```json
[{ "dosya": "assets/images/galeri/kova-hardox.webp", "en": 1600, "boy": 1200, "alt": "Hardox kaplanmış ekskavatör kovası", "aciklama": "Kova tamiri ve Hardox zırhlama" }]
```

## Yayına alma

1. Kök klasördeki her şeyi (`kaynak/`, `araclar/`, `tests/` dahil edilse de zararı yoktur) statik barındırmaya yükleyin.
2. HTTPS zorunludur: konum özelliği tarayıcılarda yalnızca güvenli bağlantıda çalışır.
3. GitHub Pages için: depo → Settings → Pages → Branch: `master`, klasör: `/ (root)`.
4. Alan adını `kaynak/site.json`'a yazıp üreteci yeniden çalıştırın.

Ayrıntılar, test sonuçları ve kalan işler: [TECHNICAL-REPORT.md](TECHNICAL-REPORT.md).
