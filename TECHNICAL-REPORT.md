# Teknik rapor — Başkent İş Makinaları web sitesi

Tarih: 17 Ekim 2026 · Önceki sürümün yedeği: `master` dalındaki d725898 numaralı commit (PR #12, tek dosyalık `index.html`).

## 1. Başlangıç durumu

- Güncel site tek dosyaydı: `index.html` (~134 KB; CSS, JS ve logo içine gömülü). Kökteki `baskent-is-makinalari.html` git'te izlenmeyen, eski bir paket çıktısıydı; dokunulmadı.
- Çalışan özellikler: Türkiye saatine göre canlı "Açık / Kapalı" rozeti, WhatsApp iş emri oluşturucu, 3D ekskavatör (three.js), çerçeve içinde `tel:` düzeltmesi. Hepsi korundu.
- Doğrulanmış işletme bilgileri: Selimiye Mahallesi, Milas / Muğla · 0538 077 35 71 · atölye Pzt–Cum 08:30–18:00, Cmt 08:30–13:30, Pazar kapalı · hizmet bölgesi Muğla'nın tüm ilçeleri ve Didim · muhatap Mücahit ÇAKIR (Baş Teknisyen / Master Technician), yönetim "Şirket Yönetimi". Tümü `site.config.json`'da tek kaynaktan. "7/24 saha servisi" ve şanzıman / tork konvertörü hizmeti kullanıcının talimatından alındı.

## 2. Kaynak araştırması — erişim durumu

Bu çalışma ortamından istenen web sitelerinin **hiçbirine doğrudan erişilemedi** (DNS / proxy engeli): godly.design, recent.design, fontshare.com, realtimecolors.com, reactbits.dev, gsap.com, lenis.dev, lucide.dev, spline.design, docs.spline.design, squoosh.app, pagespeed.web.dev, developers.google.com, developers.facebook.com. Bu siteler incelenmiş gibi gösterilmedi. Erişilebilen kanallar: npm kayıt deposu ve web araması.

| Kaynak | Ne yapıldı |
|---|---|
| Lenis | npm'den 1.3.27 (MIT) indirildi; GSAP entegrasyonu ve seçenekler paketin kendi README'sinden doğrulandı |
| GSAP / ScrollTrigger | npm'den 3.15.0; lisans "Standard 'no charge' license" (ücretsiz, ticari kullanım dahil) — paketteki lisans başlığından |
| Lucide | `lucide-static` 1.59.0 (ISC) — 24 ikon SVG sprite olarak alındı |
| Fontshare | Erişilemedi; Türkçe karakter desteği ve kendi sunucunda barındırma izni doğrulanamadı (web aramasında kaynaklar çelişkili). Bu yüzden Fontshare fontu **kullanılmadı** |
| Yazı tipleri | Sitenin mevcut fontları Archivo + Figtree, `@fontsource-variable` (OFL-1.1) paketlerinden yerelde barındırıldı; Türkçe harfler (ğ ş ı İ ç ö ü) latin + latin-ext alt kümelerinde |
| Realtime Colors | Erişilemedi; aynı WCAG kontrast formülü yerelde hesaplandı (aşağıda) |
| React Bits, Spline | Kullanılmadı: site saf HTML; React'e geçmek ve ikinci bir 3D çalışma zamanı eklemek gerekçesiz yük olurdu |
| Squoosh | Erişilemedi; logo WebP olarak zaten küçültülmüştü (12 KB). Gerçek fotoğraf bulunmadığı için görsel optimizasyonu sınırlı kaldı |
| PageSpeed Insights | Site yayında olmadığı ve servise erişilemediği için çalıştırılamadı. Yerine Lighthouse 13.5.0 ile **laboratuvar** ölçümü yapıldı (bölüm 8) |
| axe-core | 4.14.0 ile erişilebilirlik denetimi |

## 3. Tasarım sistemi

Tüm değerler `assets/css/site.css` → `:root` içinde (renk, yazı ölçekleri, boşluklar, içerik genişliği, yarıçap, gölge, süreler).

Kontrast (WCAG 2.x formülü):

| Ön plan / arka plan | Oran | Kullanım |
|---|---|---|
| #F5F6F8 / #101827 | 16.43 (AAA) | koyu zeminde metin |
| #A7AFBA / #101827 | 8.02 (AAA) | koyu zeminde ikincil metin |
| #D6A64F / #101827 | 7.98 (AAA) | altın vurgu ve altın düğme üzerinde lacivert yazı |
| #101827 / #F5F6F8 | 16.43 (AAA) | açık zeminde metin |
| #7A5A1E / #FFFFFF | 6.35 (AA) | açık zeminde altın tonlu metin ("koyu altın") |
| #FFFFFF / #D6A64F | 2.23 — yetersiz | bu yüzden altın düğmelerde beyaz yazı kullanılmadı |
| #D6A64F / #F5F6F8 | 2.06 — yetersiz | bu yüzden açık zeminde altın yalnızca süs |

Palete bu iki "koyu altın" (#7A5A1E) ve açık zeminde ikincil metin (#4B5462) tonu eklendi; verilen altı renk değiştirilmedi.

Logo: mevcut logo korundu (`assets/images/logo.jpg`, `logo-isaret.png` yedek; sitede 12 KB'lık WebP). Favicon için yeni, sade bir "B" monogramı (`favicon.svg`) önerildi; beğenilmezse logodan türetilir.

## 4. Çok sayfalı yapı

Altı sayfa: `index`, `hizmetlerimiz`, `servis-talebi`, `hakkimizda`, `iletisim`, `kvkk`. Ortak üst bilgi, menü, alt bilgi ve ikonlar `araclar/sayfa-uret.js` ile tek kaynaktan üretilir (bağımlılıksız Node betiği). Ana sayfa sırası: Google Haritalar (ilk ekran; Yol Tarifi Al / Konumu Paylaş kartları) → kısa bilgi bandı → hizmet özetleri → Şirket Yönetimi güvencesi → çalışma saatleri → galeri. Harita ana sayfada otomatik yüklendiği için KVKK metni buna göre güncellendi. Masaüstünde telefon bağlantısı kopyala / ara penceresi açar, WhatsApp bağlantıları WhatsApp Web'e gider; mobilde alt şeritte Ara ve WhatsApp sabittir.

## 5. Akıcı kaydırma ve animasyonlar

- Lenis 1.3.27, GSAP 3.15.0, ScrollTrigger — yerelde (`assets/js/vendor/`), CDN yok.
- Senkronizasyon Lenis README'sindeki resmî yöntemle: `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`.
- Tek örnek garantisi (`window.__baskentLenis`); `gsap.matchMedia('(prefers-reduced-motion: no-preference)')` içinde kurulur, tercih değişirse animasyonlar geri alınır ve Lenis yok edilir.
- Dokunmatikte doğal kaydırma korunur (`syncTouch` kapalı). Menü açıkken Lenis durur, arka plan kaydırılmaz.
- Anchor'lar: sayfa içinde Lenis `anchors` + CSS `scroll-margin-top`; başka sayfadan gelen `#bağlantı` yükleme bittikten sonra sabit başlığın altına yeniden hizalanır.
- Efektler: karşılama başlığı/açıklaması (yalnızca kayma — LCP'yi geciktirmemek için saydamlık yok), 3D görselde kaydırmaya bağlı hafif hareket, kartların sırayla belirmesi, başlık geçişleri, düğme hover/tıklama tepkileri (CSS), iletişim kapanışında çizgi animasyonu.
- GSAP/Lenis yüklenemezse veya "hareketi azalt" açıksa tüm içerik görünür ve sayfa normal kaydırılır (test edildi).

## 6. Servis talebi, konum ve WhatsApp

- Alanlar: ad soyad (zorunlu), telefon (isteğe bağlı), makine türü / markası / modeli / seri numarası, arıza kategorisi (zorunlu), arıza açıklaması ("Diğer" seçilince zorunlu), aciliyet, adres, konum, KVKK bağlantısı.
- **Arıza kategorileri:** Mevcut projede 4 işlem kategorisi vardı (hidrolik, motor, kova/Hardox, mekanik); talimatta istenen "altı kategori + Diğer" mevcut projede bulunamadı. Kullanıcının MASTER talimatında verdiği altı başlık (sonuncusu "Diğer (Kendi arızamı yazmak istiyorum)") kullanıldı. Kova ve mekanik işler hizmetler sayfasında duruyor.
- Doğrulama, hata özeti (bağlantılı), alan bazında hata, `aria-invalid`, başarı bildirimi, 4 saniyelik çift gönderim kilidi.
- **Gerçek gönderim yok.** Sitenin sunucusu olmadığı için form veri göndermez/kaydetmez; "WhatsApp'a aktar" yalnızca `wa.me` bağlantısını hazır metinle açar, mesaj kullanıcı WhatsApp'ta Gönder'e basınca iletilir. Bu, sayfada açıkça yazıyor.
- Konum: yalnızca düğmeye basınca, `isSecureContext` kontrolüyle; izin reddi / konum yok / zaman aşımı için ayrı mesajlar ve adres alanına odak; `https://maps.google.com/?q=ENLEM,BOYLAM` bağlantısı yalnızca bellekte tutulur.
- Hazır mesaj: CLAUDE.md'de kayıtlı "Merhaba. Başkent iş Makinalarından Servis bilgisi Almak İstiyorum." korundu (talimattaki metin "örnek" olarak verilmişti). Değiştirmek için `assets/js/cekirdek.js` → `KARSILAMA`.
- İletişim sayfasında altı arıza başlığı "WhatsApp hızlı arıza kartı" olarak var: her biri WhatsApp'ı karşılama + seçilen başlıkla açar.

### WhatsApp Business Platform (Cloud API) — planlama, uygulanmadı

`wa.me` bir entegrasyon değildir; WhatsApp içinde tıklanabilir liste/kart göstermek, otomatik yanıt veya sunucuda mesaj işlemek için Cloud API ve bir sunucu gerekir. Resmî dokümantasyona (developers.facebook.com) bu ortamdan erişilemedi; aşağıdakiler web aramasıyla toplandı ve kurulum öncesinde Meta'nın güncel belgeleriyle doğrulanmalıdır.

- Gerekenler: Meta geliştirici hesabı, Meta işletme portföyü (gerekirse işletme doğrulaması), WhatsApp Business Hesabı ve API'ye bağlanacak telefon numarası. Numara WhatsApp Business uygulamasında kullanılıyorsa Meta'nın "Coexistence" özelliği ya da ayrı numara değerlendirilmeli — **0538 077 35 71 numarasının taşınması sahibinin onayını gerektirir.**
- Sunucu tarafı: webhook doğrulaması (`hub.mode`, `hub.verify_token`, `hub.challenge`), her olayda `X-Hub-Signature-256` HMAC-SHA256 imza kontrolü (uygulama gizli anahtarıyla, ham gövde üzerinden), hızlı 200 yanıtı ve işi kuyruğa alma, teslim durumu (sent/delivered/read/failed) olayları.
- Gizli bilgiler: erişim belirteci (kalıcı kullanım için System User belirteci) ve uygulama gizli anahtarı yalnızca sunucuda, ortam değişkeninde; ön yüze ve Git'e asla konmaz.
- Mesajlaşma kuralları: müşteri yazdıktan sonra 24 saatlik hizmet penceresinde serbest mesaj; pencere dışında yalnızca onaylı şablon mesaj. 1 Temmuz 2025'ten beri ücretlendirme mesaj başınadır; ücretler ülkeye ve kategoriye göre değişir.
- Etkileşimli mesajlar: yanıt düğmeleri (en fazla 3, ikincil kaynağa göre) ve liste mesajları desteklenir.
- Test/üretim: Meta'nın test numarasıyla geliştirme, ardından gerçek numaranın bağlanması.
- KVKK: mesajlar Meta sunucularında (yurt dışı) işlenir; aydınlatma metni ve gerekirse açık rıza buna göre güncellenmeli.

Bu nedenle `.env.example` oluşturulmadı: şu an hiçbir gizli değer kullanılmıyor.

Kaynaklar (web araması): [Meta — Cloud API Get Started](https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started), [Meta — Pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing.md), [360dialog — fiyat değişikliği 1 Temmuz 2025](https://docs.360dialog.com/partner/get-started/pricing-and-billing/whatsapp-pricing-changes-effective-july-1-2025), [Hookdeck — WhatsApp webhooks](https://hookdeck.com/webhooks/platforms/guide-to-whatsapp-webhooks-features-and-best-practices), [Webhook Relay — doğrulama ve imza](https://webhookrelay.com/blog/whatsapp-cloud-api-webhooks/), [chat-sdk — etkileşimli düğmeler](https://chat-sdk.dev/adapters/whatsapp).

## 7. SEO ve güvenlik

- Her sayfada benzersiz `title` ve `description`, `lang="tr"`, tek H1, sıralı H2/H3, Open Graph başlık/açıklama, favicon (SVG + PNG), `manifest.webmanifest`, `robots.txt`.
- **Canonical ve sitemap:** Üretim alan adı bilinmiyor. Sahte alan adı yayımlanmadı: canonical şimdilik göreli, `sitemap.xml`, `og:url` ve `og:image` üretilmiyor (Lighthouse SEO 92 bu yüzden — "canonical mutlak değil"). Alan adı `site.config.json`'a yazılınca tek komutla tamamlanır.
- Yapısal veri (LocalBusiness): yalnızca doğrulanmış ad, telefon, adres, atölye saatleri, hizmet bölgesi, hizmet listesi ve çalışan (Mücahit ÇAKIR, Baş Teknisyen / Master Technician). Puan, yorum, sertifika yok.
- Güvenlik: sitede kullanıcı girdisi DOM'a yalnızca `textContent` ile yazılır (XSS yolu yok); dış bağlantılar `rel="noopener"`; `Referrer-Policy` meta etiketi; üçüncü taraf betik yok (3D için yerel kopya, dosyadan açılışta yedek olarak jsDelivr); Google Haritalar yalnızca tıklayınca yüklenir. Sunucu, form gönderimi, dosya yükleme, API anahtarı yok — CSRF / istek sınırlama gerektiren bir uç nokta bulunmuyor. Barındırmada önerilen başlıklar: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`.
- KVKK metni sitenin bugünkü gerçek işleyişine göre yazıldı; **hukuki uygunluğu bir uzman tarafından doğrulanmadı**, yayından önce gözden geçirilmeli.

## 8. Testler ve ölçümler (bu ortamda gerçekten çalıştırılanlar)

| Test | Sonuç |
|---|---|
| `node --test` (iş mantığı + içerik, 37 test) | 37/37 geçti |
| Tarayıcı (Chromium, Playwright): 6 sayfa × 320/360/390/430/768/1024/1440 px — yatay taşma, ekran dışı öğe, 44 px dokunma hedefi, 12 px altı yazı, konsol hatası, kırık yerel istek | sorun yok |
| İşlev testleri (33 kontrol): mobil menü aç/kapa/Escape/odak, aktif sayfa, Lenis tek örnek ve tekerlek kaydırması, ScrollTrigger senkronu, sayfa içi ve sayfalar arası anchor konumu, harita yalnız tıklayınca, 3D yerel three.js ile, hareket azaltma, kütüphane yüklenemezse görünürlük, form doğrulama, "Diğer" kuralı, geçersiz telefon, çift gönderim, WhatsApp numarası ve mesaj içeriği, GPS izinli/izinsiz, manuel adres, kırık iç bağlantı | 33/33 geçti |
| axe-core 4.14 (WCAG 2.1 A/AA + best-practice), 6 sayfa × 390/1440 | ihlal yok |

Lighthouse 13.5.0, **laboratuvar verisi** (yerel sunucu, bu konteynerin yazılımsal GPU'su; gerçek kullanıcı verisi değil — CrUX/saha verisi yok, site yayında değil):

| Sayfa | Mobil Perf · LCP · TBT · CLS | Masaüstü Perf · LCP · TBT · CLS |
|---|---|---|
| index | 92 · 3,3 s · 30 ms · 0 | 70 · 0,7 s · 1.150 ms · 0,018 |
| hizmetler | 94 · 3,1 s · 0 ms · 0 | 100 · 0,7 s · 0 ms · 0 |
| surec | 95 · 2,9 s · 0 ms · 0 | 100 · 0,7 s · 0 ms · 0 |
| is-emri (eski adı; servis-talebi olarak yeniden yazıldı, yeniden ölçülmedi) | 94 · 3,0 s · 50 ms · 0 | 100 · 0,7 s · 0 ms · 0,001 |
| iletisim | 95 · 2,9 s · 10 ms · 0 | 100 · 0,7 s · 0 ms · 0 |
| kvkk | 94 · 3,0 s · 0 ms · 0 | 100 · 0,7 s · 0 ms · 0 |

Erişilebilirlik 100, En iyi uygulamalar 100, SEO 92 (göreli canonical) — tüm sayfalarda.

Yorum: CLS hedefi (≤0,1) her yerde sağlanıyor. Mobil laboratuvar LCP'si (yavaş 4G + 4× CPU simülasyonu) 2,9–3,3 s ile **2,5 s hedefinin üstünde**; gerçek kullanıcı değerleri ancak yayından sonra PageSpeed Insights / CrUX ile ölçülebilir. Masaüstü ana sayfadaki TBT, 3D sahnenin (three.js) yüklenmesinden geliyor ve bu konteynerde GPU olmadığı için abartılı; mobilde 3D yalnızca istenince yüklenir. Aynı nedenle bu ortamda masaüstünde 3D yüklenirken kartların belirmesi bir an gecikebiliyor (işlev testinde 1,2 s'de bir kez yakalandı, 3,7 s beklemede geçti). INP laboratuvarda ölçülemez.

Yapılan performans iyileştirmeleri: üçüncü taraf font/betik kaldırıldı, fontlar 200 KB'tan 98 KB'a indi, 3D yükleme ertelendi ve mobilde isteğe bağlandı, WebGL denetimi açılıştan çıkarıldı, harita tıklamaya bağlandı, LCP öğesi saydamlık animasyonundan çıkarıldı.

## 9. Kalan işler ve kullanıcıdan gerekenler

1. **Üretim alan adı** (canonical, sitemap, Open Graph görseli için).
2. **Gerçek atölye ve iş fotoğrafları** (galeri ve karşılama görseli için) — hiçbir fotoğraf uydurulmadı; galeri şimdilik WhatsApp'tan fotoğraf gönderme çağrısı gösteriyor.
3. **7/24 saha servisi** ve **şanzıman / tork konvertörü** hizmetinin doğruluğunun onayı (talimattan alındı).
4. **KVKK metninin** bir hukukçu tarafından gözden geçirilmesi.
5. **WhatsApp Cloud API** isteniyorsa: Meta işletme hesabı erişimi, numara kararı, bir sunucu/barındırma ve bütçe onayı.
6. Gerçek telefonda (iOS Safari, Android Chrome) ve gerçek GPU'da deneme — bu ortamda yalnızca Chromium öykünmesi yapıldı.
7. Görsel tasarım bu ortamda ekran görüntüsü açılamadığı için (araç engeli) gözle değerlendirilemedi; ölçümler otomatik denetimlere dayanıyor.
8. Kullanıcının istediği Firecrawl, Apify, Exa ve Brand24 araçları bu oturumda kullanılamadı (API anahtarı yok / ağ engeli); Playwright yerel olarak kullanıldı.

## 10. Eklenen paketler ve sürümler

| Paket | Sürüm | Lisans | Nerede |
|---|---|---|---|
| lenis | 1.3.27 | MIT | `assets/js/vendor/lenis.min.js` |
| gsap (+ ScrollTrigger) | 3.15.0 | GSAP Standard "no charge" | `assets/js/vendor/` |
| @fontsource-variable/archivo, figtree | 5.3.0 | OFL-1.1 | `assets/fonts/` |
| lucide-static (yalnızca ikon çizimleri) | 1.59.0 | ISC | `kaynak/ikonlar.svg` |

Geliştirme sırasında yalnızca test için (depoya eklenmedi): playwright-core, axe-core 4.14.0, lighthouse 13.5.0.

## 11. Güncelleme — 3D kaldırıldı, Claude Code becerileri eklendi

- Kullanıcının isteğiyle 3D ekskavatör tamamen kaldırıldı: `assets/js/sahne.js`, `three.module.min.js` ve ilgili CSS silindi. Karşılamada yerine sabit SVG ekskavatör çizimi duruyor (kaydırmaya bağlı hafif hareketiyle). Yukarıdaki bölümlerde geçen 3D ölçüm ve testleri bu değişiklikten önceki sürüme aittir.
- `.claude/skills/frontend-design/SKILL.md`: anthropics/claude-code deposundan. Lisansı "© Anthropic PBC, tüm hakları saklıdır"; depo herkese açıksa bu yeniden dağıtım sayılır, dikkate alınmalı.
- `.claude/skills/karpathy-guidelines/SKILL.md`: MIT. forrestchang ve multica-ai depolarındaki dosyalar birebir aynı.
- `.claude/agents/`: cerenazar/ekip ekibi — backend-dev, code-reviewer, debugger, test-writer (MIT, `LICENSE-ekip.txt`).
- vercel-labs/skills bir kurulum aracı (`npx skills add <depo>`); projeye dosya eklenmedi.
- jakechancariol/youtube-agent-skill indirilemedi (depo bulunamadı ya da erişim yok).
