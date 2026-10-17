# Başkent İş Makinaları — yeni oturum için devam notu

Bu notu yeni sohbetin ilk mesajı olarak yapıştırın.

---

Depo: `depder/hesab-na-bakanlar`, çalışma dalı `claude/baskent-is-makineleri-website-bjbltc`. Kurallar kökteki `CLAUDE.md` dosyasında; teknik ayrıntılar `README.md` ve `TECHNICAL-REPORT.md`'de.

## Şu ana kadar yapılanlar
- Site 6 sayfaya ayrıldı: index (ana sayfa), hizmetler, surec, is-emri (servis talebi), iletisim, kvkk.
- Yeni renk paleti (#101827, #171B22, #A7AFBA, #F5F6F8, #D6A64F), Archivo + Figtree fontları (yerelde).
- Lenis + GSAP/ScrollTrigger ile akıcı kaydırma ve ölçülü animasyonlar.
- Servis talebi formu: 6 arıza kategorisi, doğrulama, çift gönderim engeli, isteğe bağlı GPS konumu, WhatsApp'a hazır mesajla aktarma (sunucu yok; site veri kaydetmez).
- İletişim sayfasında 6 arıza başlığıyla WhatsApp hızlı kartları; harita tıklayınca yükleniyor.
- 3D model tamamen kaldırıldı; karşılamada sabit ekskavatör çizimi var.
- Claude Code eklemeleri: `.claude/skills/frontend-design`, `.claude/skills/karpathy-guidelines`, `.claude/agents/` (backend-dev, code-reviewer, debugger, test-writer).
- Testler: 37 birim/içerik testi, 33 tarayıcı işlev testi, 7 ekran genişliği, axe erişilebilirlik — hepsi geçti.
- PR'lar: #13 (çok sayfalı site), #14 (üreteç hata mesajı) birleşti; 3D kaldırma ve skill'ler sonraki PR'da.

## Kullanıcıdan beklenenler
1. Sitenin alan adı (canonical, sitemap, sosyal medya görseli için) → `kaynak/site.json`.
2. Gerçek atölye/iş fotoğrafları (galeri için) → `kaynak/galeri.json`.
3. "7/24 saha servisi" ve "şanzıman / tork konvertörü" hizmetlerinin onayı.
4. KVKK metninin bir hukukçuya kontrol ettirilmesi.
5. WhatsApp Business (Cloud API) istenirse: Meta işletme hesabı, numara kararı, sunucu.

## Bilinen açıklar
- Telefonda deneme ölçümünde sayfanın görünme süresi 2,9–3,3 sn (hedef 2,5 sn).
- Tasarım gözle (ekran görüntüsüyle) kontrol edilemedi; gerçek telefonda deneme yapılmadı.
- jakechancariol/youtube-agent-skill deposu indirilemedi.

## Sonraki adım
Kullanıcının göndereceği alan adı ve fotoğrafları eklemek; ardından `node araclar/sayfa-uret.js`, `node --test`, PR aç ve birleştir.
