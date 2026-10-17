# Başkent İş Makinaları — proje notları

Statik, çok sayfalı site (saf HTML/CSS/JS). Ayrıntı: README.md, TECHNICAL-REPORT.md.

## Kesin içerik kuralları (kullanıcının talimatı)
- Tek kişi adı: **Mücahit ÇAKIR**, unvanı her yerde **BAŞ TEKNİSYEN**. Başka isim yok (kurucu/yönetici adı yazılmaz).
- Tek numara: 0538 077 35 71 (`tel:+905380773571`, `https://wa.me/905380773571`).
- Hazır WhatsApp mesajı: "Merhaba. Başkent iş Makinalarından Servis bilgisi Almak İstiyorum."
- Adres: Selimiye Mah. Sanayi Sitesi, Milas / Muğla. Atölye: Pzt–Cum 09:00–17:30, Cmt 09:00–13:30, Pazar kapalı; saha servisi 7/24.
- Yapılmayan işler (seyyar borvek, sıfırdan imalat) ve örnek makine modeli adı sitede geçmez. 3D model yok.
- Sahte yorum, sertifika, istatistik, alan adı veya ölçüm uydurulmaz.

## Çalışma düzeni
- Sayfa içerikleri `kaynak/sayfalar/`, ortak parçalar `araclar/sayfa-uret.js`. Değişiklikten sonra: `node araclar/sayfa-uret.js` ve `node --test`.
- Her değişiklikten sonra: dalda commit → PR aç → squash ile birleştir.
- Kullanıcı Türkçe yazar, teknik değildir; kısa ve sade Türkçe yanıt ver.

## Kodlama ilkeleri
`.claude/skills/karpathy-guidelines` (önce düşün, en basit çözüm, cerrahi değişiklik, doğrulanabilir hedef) ve tasarım işlerinde `.claude/skills/frontend-design` kullanılır. Alt ajanlar: `.claude/agents/`.
