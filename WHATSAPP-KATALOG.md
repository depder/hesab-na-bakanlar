# WhatsApp Business Katalog kurulumu

Bu adımlar telefonda, **0538 077 35 71** numarasıyla yapılır. Süre: yaklaşık 30 dakika. Ücretsizdir.

Katalog kurulunca müşteri sohbette mağaza simgesine (🛍) ya da sitedeki **"Hizmet kartlarını WhatsApp'ta aç"** düğmesine dokunur. Hizmet kartlarını WhatsApp'ın içinde görür ve seçtiği kartı tek dokunuşla size gönderir.

## 1. WhatsApp Business uygulaması
- Numara şu an normal WhatsApp'taysa Play Store / App Store'dan **WhatsApp Business** uygulamasını indirin.
- Uygulama aynı numarayı algılar ve sohbetleri taşımayı önerir: **Devam**'a basın. Sohbetler kaybolmaz.
- İşletme profili:
  - Ad: **Başkent İş Makinaları**
  - Kategori: **Otomotiv hizmeti**
  - Adres: **Selimiye, Küçük Sanayi Sitesi, 48200 Milas / Muğla**
  - Çalışma saatleri: Pzt–Cum **08:30–18:00**, Cmt **08:30–13:30**, Pazar kapalı
  - Web sitesi: **https://baskent-is-makinalari.vercel.app**

## 2. Kataloğu açın
**⋮ (Diğer seçenekler) → Ayarlar → İşletme araçları → Katalog → Yeni ürün ekle**

## 3. Beş hizmet kartı
Her kart için: **fotoğraf** (atölyeden gerçek bir fotoğraf), **ad**, **açıklama**. Fiyat alanını boş bırakın. **Bağlantı** alanına siteyi yazın.

| # | Ad | Açıklama |
|---|---|---|
| 1 | Kova Tamiri / Zırhlama | Çatlak, tırnak, bıçak, Hardox aşınma plakası |
| 2 | Mekanik Bakım / Overhaul | Motor revizyonu, pim–burç, periyodik ağır bakım |
| 3 | Hidrolik Sistem | Pompa, valf, silindir, kaçak, güç kaybı |
| 4 | Şanzıman / Tork Konvertörü | Yürümeme, çekiş kaybı, vites sorunu |
| 5 | Saha Acil Servis | Makine şantiyede durdu, 7/24 |

Bağlantı alanı için: `https://baskent-is-makinalari.vercel.app/servis-talebi.html`

## 4. Deneyin
- Katalog ekranında **Paylaş**'a basın. Bağlantı `https://wa.me/c/905380773571` olmalı; site bu adresi kullanıyor.
- Başka bir telefondan bu bağlantıyı açın. Kartlar WhatsApp'ın içinde görünmeli.

## 5. (İsteğe bağlı) Otomatik karşılama
**Ayarlar → İşletme araçları → Karşılama mesajı**: "Merhaba, Başkent İş Makinaları. Hizmet kartlarımızı görmek için yukarıdaki 🛍 simgesine dokunun ya da arızayı yazın."

---
Not: Katalog kurulmadan sitedeki düğmeye basılırsa WhatsApp boş bir katalog gösterir. Kurulumu ertelemek isterseniz `site.config.json` içindeki `"katalog"` satırını boş bırakın (`"katalog": ""`); düğme siteden kalkar.
