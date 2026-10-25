# Başkent İş Makinaları — proje notları

Statik, çok sayfalı site (saf HTML/CSS/JS). Ayrıntı: README.md, TECHNICAL-REPORT.md.

## Kesin içerik kuralları (kullanıcının talimatı)
- Tek kişi adı: **Mücahit ÇAKIR**, unvanı **Baş Teknisyen / Master Technician**; yönetim yalnızca "Şirket Yönetimi" olarak anılır. Başka isim yok (kurucu/yönetici adı yazılmaz).
- Tek numara: 0538 077 35 71 (`tel:+905380773571`, `https://wa.me/905380773571`).
- Hazır WhatsApp mesajı: "Merhaba. Başkent iş Makinalarından Servis bilgisi Almak İstiyorum." Altına (2. satır) ilgili `kart/<ad>/` bağlantısı eklenir; WhatsApp onu görselli karta çevirir.
- Adres: Selimiye, Küçük Sanayi Sitesi, 48200 Milas / Muğla. Atölye: Pzt–Cum 08:30–18:00, Cmt 08:30–13:30, Pazar kapalı; saha servisi de mesai saatlerinde (7/24 yok).
- Tüm bu bilgiler yalnızca `site.config.json`'da durur; sayfalara, betiklere ve üretece sabit yazılmaz (test bunu denetler).
- Yapılmayan işler (seyyar borvek, sıfırdan imalat) ve örnek makine modeli adı sitede geçmez. 3D model yok.
- Sahte yorum, sertifika, istatistik, alan adı veya ölçüm uydurulmaz.

## Çalışma düzeni
- Sayfalar: index, hizmetlerimiz, servis-talebi, hakkimizda, iletisim, kvkk. Sayfa içerikleri `kaynak/sayfalar/`, ortak parçalar `araclar/sayfa-uret.js`. Değişiklikten sonra: `node araclar/sayfa-uret.js` ve `node --test`.
- Diller: Türkçe ana dil (kök), ayrıca `en/ de/ es/ az/`. Çeviriler `kaynak/sayfalar/<dil>/*.html` (düzeni Türkçeyle birebir aynı; test denetler) ve `kaynak/ceviri/<dil>.json` (üreteç + betik metinleri). Türkçe sayfada metin değişirse 4 dilde de değiştir. WhatsApp mesajları her dilde Türkçe; KVKK çevirisi bilgi amaçlı, geçerli olan Türkçe metin. Kart sayfaları (`kart/`) yalnız Türkçe.
- Telefon önceliklidir (ziyaretçilerin %85–90'ı telefondan gelir). Telefonda başlık: logo + dil + menü; açık/kapalı durumu başlığın altındaki şeritte.
- Her değişiklikten sonra: dalda commit → PR aç → squash ile birleştir.
- Kullanıcı Türkçe yazar, teknik değildir; kısa ve sade Türkçe yanıt ver.

## Kodlama ilkeleri
`.claude/skills/karpathy-guidelines` (önce düşün, en basit çözüm, cerrahi değişiklik, doğrulanabilir hedef) ve tasarım işlerinde `.claude/skills/frontend-design` kullanılır. Alt ajanlar: `.claude/agents/`.
