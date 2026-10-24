# Başkent İş Makinaları — yeni oturum için devam notu

Bu notu yeni sohbetin ilk mesajı olarak yapıştırın.

---

Depo: `depder/hesab-na-bakanlar`, ana dal `master`, çalışma dalı `claude/baskent-is-makineleri-website-bjbltc` (her işte `origin/master`'dan yeniden başlatılır). Kurallar kökteki `CLAUDE.md`'de; teknik ayrıntılar `README.md` ve `TECHNICAL-REPORT.md`'de. Her değişiklikten sonra: `node araclar/sayfa-uret.js` → `node --test` → commit → PR → squash ile birleştir. Zorla gönderme (force push) hesap kuralıyla yasak; uzak dal eski geçmiş taşıyorsa `git merge -s ours origin/<dal>` ile bağlanıp normal gönderilir.

## Sitenin şu anki hâli (PR #17, #18, #19 birleşti)
- Saf HTML/CSS/JS statik site. Next.js'e geçilmedi (kullanıcı "mevcut siteyi geliştir" dedi). 3D yok.
- **Tek kaynak `site.config.json`:** telefon 0538 077 35 71, WhatsApp ve hazır mesajlar, adres (Selimiye, Küçük Sanayi Sitesi, 48200 Milas / Muğla), koordinat (`null` — bilinmiyor, uydurulmaz), çalışma saatleri, yetkili, hizmet / ekipman / aciliyet / bölge listeleri, 6 arıza kategorisi, alan adı (`https://baskent-is-makinalari.vercel.app` — WhatsApp bağlantı kartı için). Üreteç bunu sayfalara ve `assets/js/ayar.js`'e aktarır; bir test sayfa kaynaklarında ve betiklerde bu bilgilerin sabit yazılmadığını denetler.
- **Saatler:** Pzt–Cum 08:30–18:00, Cmt 08:30–13:30, Pazar kapalı; saha servisi 7/24.
- **Kişi:** yalnızca Mücahit ÇAKIR, unvanı "Baş Teknisyen / Master Technician"; yönetim yalnızca "Şirket Yönetimi" olarak anılır. Başka isim yok.
- **Sayfalar:** `index` (ilk ekranda Google Haritalar + "Yol Tarifi Al" / "Konumu Paylaş"; ardından hizmetler, Şirket Yönetimi güvencesi, saatler, galeri), `hizmetlerimiz`, `servis-talebi` (3 adım: hizmet kartı → ekipman/aciliyet/bölge → WhatsApp şablonu), `hakkimizda` (yönetim, uzmanlık, servis süreci), `iletisim`, `kvkk`. Eski `hizmetler/surec/is-emri.html` kaldırıldı (yönlendirme yok).
- **Başlık:** logo + canlı "Atölye Açık / Hizmete Hazır" rozeti, "Hemen Ara" ve "WhatsApp". Masaüstünde telefon bağlantısı kopyala/ara penceresi açar, WhatsApp bağlantıları WhatsApp Web'e gider; mobilde altta sabit Ara/WhatsApp şeridi.
- Ana sayfa haritası otomatik yüklendiği için KVKK metni buna göre güncellendi.
- Üreteç: hatalı/eksik ayarda mesajla durur; dosya yazılamazsa hiçbir sayfayı değiştirmez (önce `.yeni` dosyalarına yazar).
- Doğrulama: `node --test` 44/44; tarayıcı işlev kontrolü 27/27; hata yolları 6/6; axe 0 ihlal; 7 genişlikte yatay taşma yok.
- Kullanıcıya `baskentismakinaları.com.zip` (ana dalın tamamı + tek dosyalık önizleme) gönderildi.

## Kullanıcıdan beklenenler
1. Atölyenin kesin harita koordinatı → `site.config.json` → `adres.koordinat` (`{ "enlem": .., "boylam": .. }`).
2. Sitenin alan adı → `site.config.json` → `alanAdi` (canonical, sitemap, sosyal medya görseli için).
3. Gerçek atölye/iş fotoğrafları → `assets/images/galeri/` + `kaynak/galeri.json`.
4. KVKK metninin bir hukukçuya kontrol ettirilmesi.
5. CAT / JCB / Hitachi sitelerinin incelenmesi isteniyorsa ortam ağ ayarlarında bu alan adlarına izin verilmesi (şu an engelli).

## Bilinen açıklar
- Harita ve yeni tasarım gerçek ekranda gözle kontrol edilemedi (ağ kapalı, görüntü okuma engelli); gerçek telefonda deneme yapılmadı.
- Yeni ana sayfa için Lighthouse yeniden ölçülmedi; otomatik yüklenen harita hızı düşürebilir.
- Eski sayfa adreslerine gelenler "bulunamadı" görür.

## Sonraki adım
Kullanıcı koordinat veya alan adı verirse `site.config.json`'a yazıp `node araclar/sayfa-uret.js` ve `node --test` çalıştırmak; ardından PR aç ve birleştir.
