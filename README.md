# Başkent İş Makinaları — web sitesi

İş makinelerinde hidrolik sistem, şanzıman ve tork konvertörü, dizel motor revizyonu; atölye ve mesai saatlerinde yerinde saha servisi veren atölyenin (Selimiye, Küçük Sanayi Sitesi, 48200 Milas / Muğla) çok sayfalı tanıtım sitesi.

Saf HTML, CSS ve JavaScript. Derleme adımı ve sunucu yoktur; kök klasördeki dosyaları herhangi bir statik barındırmaya (GitHub Pages, Netlify, Cloudflare Pages, cPanel vb.) yüklemek yeterlidir.

## Sayfalar

| Dosya | İçerik |
|---|---|
| `index.html` | En üstte Google Haritalar (Yol Tarifi Al / Konumu Paylaş), hizmet özetleri, Şirket Yönetimi güvencesi, çalışma saatleri, galeri |
| `hizmetlerimiz.html` | Hizmetler, servis verilen makineler, sık sorulanlar |
| `servis-talebi.html` | 3 adımlı servis talebi kartları → hazır WhatsApp mesajı |
| `hakkimizda.html` | Atölye, yönetim ve teknik sorumluluk, uzmanlıklar, servis süreci, saatler ve bölge |
| `iletisim.html` | Telefon, WhatsApp, adres, WhatsApp hızlı arıza kartları, harita |
| `kvkk.html` | KVKK aydınlatma metni |
| `kart/<ad>/` | WhatsApp kart sayfaları (genel servis + her hizmet). Mesajların ikinci satırındaki bağlantı buraya gelir; WhatsApp bu sayfanın görselinden önizleme kartı çizer. Arama motorlarına kapalı. |

### Diller

Türkçe ana dildir (kök klasör). Aynı sayfalar İngilizce (`en/`), Almanca (`de/`), İspanyolca (`es/`) ve Azerbaycanca (`az/`) olarak da üretilir; başlıktaki 🌐 düğmesi aynı sayfanın diğer dildeki karşılığına gider, arama motorları için her sayfada `hreflang` bağlantıları vardır.

- Sayfa çevirileri: `kaynak/sayfalar/<dil>/*.html`. Etiketler, sınıflar, bağlantılar ve `{{parçalar}}` Türkçe sayfayla birebir aynı kalmalıdır; yalnızca metinler (ve `alt`, `title`, `aria-label`, `placeholder`) çevrilir. `tests/ceviri.test.js` bunu ve çevrilmeden kalan Türkçe cümleyi denetler.
- Üretecin ve tarayıcı betiklerinin yazdığı metinler (menü, alt bilgi, hizmet/ekipman adları, hata mesajları, açık/kapalı durumu): `kaynak/ceviri/<dil>.json` → `uretec` ve `betik`. Türkçe metni anahtar olarak kullanır; karşılığı olmayan metin varsa üreteç durur.
- WhatsApp'a giden hazır mesajlar her dilde **Türkçedir** (teknisyen doğrudan okuyabilsin); form seçeneklerinin gönderilen değeri Türkçe, ziyaretçinin gördüğü adı çevrilidir.
- KVKK çevirileri bilgi amaçlıdır; sayfada Türkçe metnin bağlayıcı olduğu yazar ve ona bağlantı verir.
- Bir Türkçe metni değiştirirseniz aynı yeri dört dilde de güncelleyin; aksi hâlde test hata verir.

### WhatsApp kartları

`wa.me` bağlantısı yalnızca düz metin taşır. Bu yüzden her hazır mesajın **ikinci satırına** bir kart bağlantısı konur (`https://…/kart/hidrolik/`). WhatsApp önizlemeyi mesajdaki ilk bağlantıdan üretir; müşteri mesaj kutusunda, siz de gelen mesajda görselli kartı görürsünüz. Servis talebi formunda seçilen hizmetin kartı, yedek parça mesajında parça kartı, diğer düğmelerde genel servis kartı kullanılır.

- Kartların adı, açıklaması, ikonu ve bağlantısı `site.config.json` → `servisTalebi.hizmetler[]` ve `whatsapp.genelKart` içindedir.
- Görseller (`assets/images/kart/*.jpg`, 1200×630) metin değişince yeniden üretilir: `NODE_PATH="$(npm root -g)" node araclar/kart-gorsel-uret.js` (Playwright gerekir), ardından `node araclar/sayfa-uret.js`.
- WhatsApp önizlemeyi önbelleğe alır; görsel değişince kartın eskisi bir süre görünebilir. Kontrol: https://developers.facebook.com/tools/debug/

## Klasör yapısı

```
*.html                  üretilmiş sayfalar (doğrudan düzenlemeyin, aşağıya bakın)
favicon.svg, robots.txt, manifest.webmanifest
assets/css/site.css     tasarım sistemi (renk, yazı, boşluk değişkenleri ve bileşenler)
assets/js/cekirdek.js   iş mantığı: çalışma durumu, WhatsApp mesajları, talep doğrulama
assets/js/ayar.js       site.config.json'un tarayıcı kopyası (üretilir, elle düzenlemeyin)
assets/js/site.js       menü, canlı durum, harita, masaüstü telefon penceresi / WhatsApp Web, konum paylaşma, animasyonlar
assets/js/servis-talebi.js  servis talebi kartları ve konum
assets/js/vendor/       Lenis 1.3.27, GSAP 3.15.0 + ScrollTrigger
.claude/skills/         frontend-design, karpathy-guidelines (Claude Code becerileri)
.claude/agents/         backend-dev, code-reviewer, debugger, test-writer (Claude Code ekibi)
assets/fonts/           Archivo ve Figtree (OFL-1.1, Türkçe karakterli alt kümeler)
assets/images/          logo
assets/icons/           favicon ve uygulama ikonları
kaynak/sayfalar/        sayfa içerikleri (düzenlenecek yer)
kaynak/galeri.json      galeri fotoğrafları listesi
site.config.json        TÜM işletme bilgileri (telefon, WhatsApp, adres, saatler, yetkili, seçenekler, alan adı)
araclar/sayfa-uret.js   sayfa üreteci (kart/<ad>/ sayfaları dahil)
araclar/kart-gorsel-uret.js  WhatsApp kart görselleri (Playwright ile, elle çalıştırılır)
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
| Telefon, WhatsApp, hazır mesajlar, adres, koordinat, çalışma saatleri, yetkili ve unvan, hizmet / ekipman / aciliyet / bölge listeleri, arıza kategorileri, alan adı | `site.config.json` (tek kaynak; sayfalara ve tarayıcıya üreteçle aktarılır) |
| Harita bağlantıları, yapısal veri | `araclar/sayfa-uret.js` (değerleri `site.config.json`'dan alır) |
| Renkler ve yazı tipleri | `assets/css/site.css` → `:root` |

### Alan adı (canonical, sitemap)

Sitenin yayınlanacağı alan adı belli olunca `site.config.json` → `alanAdi` alanına yazın ve üreteci çalıştırın:

```json
"alanAdi": "https://www.ornek-alan-adi.com"
```

Atölyenin kesin koordinatı biliniyorsa `adres.koordinat` alanına `{ "enlem": 37.0, "boylam": 27.0 }` biçiminde yazın; harita ve yol tarifi adres yerine bu noktayı kullanır. Bilinmiyorsa `null` kalır (koordinat uydurulmaz).

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
4. Alan adını `site.config.json`'a yazıp üreteci yeniden çalıştırın.

Ayrıntılar, test sonuçları ve kalan işler: [TECHNICAL-REPORT.md](TECHNICAL-REPORT.md).
