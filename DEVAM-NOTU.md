# Başkent İş Makinaları — yeni oturum için devam notu

Bu notu yeni sohbetin ilk mesajı olarak yapıştırın.

---

Depo: `depder/hesab-na-bakanlar`, ana dal `master`, çalışma dalı `claude/baskent-is-makineleri-website-bjbltc` (her işte `origin/master`'dan yeniden başlatılır). Kurallar kökteki `CLAUDE.md`'de; teknik ayrıntılar `README.md` ve `TECHNICAL-REPORT.md`'de. Her değişiklikten sonra: `node araclar/sayfa-uret.js` → `node --test` → commit → PR → squash ile birleştir. Zorla gönderme (force push) hesap kuralıyla yasak; uzak dal eski geçmiş taşıyorsa `git merge -s ours origin/<dal>` ile bağlanıp normal gönderilir.

**Yayın:** Vercel projesi "baskent-is-makinalari" (takım Saforan) artık bu depoya (`depder/hesab-na-bakanlar`) bağlı. `master`'a her birleştirme otomatik yayına çıkar: https://baskent-is-makinalari.vercel.app

## Sitenin şu anki hâli (PR #17–#28 birleşti)
- Saf HTML/CSS/JS statik site. 3D yok.
- **Tek kaynak `site.config.json`:** telefon 0538 077 35 71, WhatsApp ve hazır mesaj, adres (Selimiye, Küçük Sanayi Sitesi, 48200 Milas / Muğla), koordinat 37.391047, 27.661943 (Google'da "Milas oto gaz" görünen dükkân noktası), saatler, yetkili, listeler, alan adı, WhatsApp kataloğu (`https://wa.me/c/905380773571`). Bir test bu bilgilerin sayfalara/betiklere sabit yazılmadığını denetler.
- **Saatler:** Pzt–Cum 08:30–18:00, Cmt 08:30–13:30, Pazar kapalı. Saha servisi de mesai saatlerinde; sitede "7/24" yok (test denetler).
- **Kişi:** yalnızca Mücahit ÇAKIR, "Baş Teknisyen / Master Technician"; yönetim yalnızca "Şirket Yönetimi".
- **Sayfalar:** `index`, `hizmetlerimiz`, `yedek-parca` (yağ bölmeleri, cer açıklaması, parça grupları, parça mesajlı WhatsApp), `servis-talebi` (3 adım → WhatsApp; 6. seçenek "Yedek Parça / Yağ Tedariki"), `hakkimizda`, `iletisim`, `kvkk`.
- **Yedek parça araştırması:** `YEDEK-PARCA-ARASTIRMA.md` (iç belge, sitede yok). Sitede marka/model adı geçmez; test denetler.
- **WhatsApp:** bağlantı paylaşılınca kart (og etiketleri) çıkar; "Hizmet kartlarını WhatsApp'ta aç" düğmesi kataloğu WhatsApp uygulamasında açar. Katalog kurulum adımları: `WHATSAPP-KATALOG.md`.
- **Başlık:** logo + "Atölye Açık / Kapalı" rozeti + menü; menü 1100px'e kadar hamburger; 1220px ve üstünde "Hemen Ara" / "WhatsApp" yalnız simge olarak görünür (1101–1219px arası gizli; 761–1100px arası yazılı). 320–1920px arası başlıkta taşma ve çakışma yok.
- Doğrulama: `node --test` 48/48; tarayıcı işlev kontrolü 27/27; hata yolları 6/6; axe 0 ihlal; 7 genişlikte taşma yok.

## Kullanıcının yapacakları
1. **WhatsApp Business kataloğu:** `WHATSAPP-KATALOG.md`'deki adımlarla 5 hizmet kartını telefondan kurmak. Kurulmazsa sitedeki katalog düğmesi boş katalog açar (istenirse `"katalog": ""` yapılıp düğme kaldırılır).
2. **Google İşletme Profili:** Haritada nokta şu an "Milas oto gaz · LPG Dönüşümü" adıyla görünüyor. 37.391047, 27.661943 noktasına "Başkent İş Makinaları" adıyla profil açmak ya da mevcut kaydı sahiplenmek; makine fotoğrafları o zaman harita kartında görünür.
3. **Gerçek fotoğraflar:** `assets/images/galeri/` + `kaynak/galeri.json`.
4. **KVKK metni:** bir hukukçuya kontrol ettirmek.

## Bilinen açıklar
- Gerçek telefonda deneme yapılmadı; Lighthouse yeniden ölçülmedi (harita otomatik yüklendiği için hız düşebilir).
- Eski sayfa adreslerine (`hizmetler/surec/is-emri.html`) gelenler "bulunamadı" görür.

## Sonraki adım
Kullanıcının yeni isteğini `site.config.json` veya `kaynak/sayfalar/` üzerinde yapmak; `node araclar/sayfa-uret.js` ve `node --test` çalıştırıp PR aç ve birleştir.
