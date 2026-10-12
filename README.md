# Başkent İş Makinaları

İş makinası kova tamiri, Hardox aşınma zırhlama, hidrolik silindir revizyonu ve mekanik ağır bakım atölyesinin tanıtım sitesi. **Tek dosyadır:** `index.html` içinde tüm HTML, CSS ve JavaScript ile gömülü logo bulunur. Derleme adımı yoktur; dosyayı tarayıcıda açmanız ya da herhangi bir statik sunucuya (GitHub Pages, Netlify, cPanel vb.) yüklemeniz yeterli.

```
index.html        sitenin tamamı (tek dosya)
tests/            iş mantığı ve içerik testleri: `node --test` (Node 20+, kurulum gerekmez)
assets/           sosyal medya önizleme görseli (logo.jpg) ve apple-touch simgesi
```

## Sayfadaki özellikler

- **3D sahne (Three.js 0.170.0, jsDelivr CDN):** fareyle yönlenen, sürükleyerek çevrilen kova + hidrolik silindir modeli. Sahne yalnızca ekranda görünürken çizilir; yavaş cihazda çözünürlük kendiliğinden düşer. CDN yüklenemezse ya da WebGL yoksa yerine teknik çizim (SVG) kalır. "Hareketi azalt" tercihinde animasyon durur.
- **Canlı çalışma durumu:** Hafta içi 09:00–17:30, Cumartesi 09:00–13:30. Durum ziyaretçinin bulunduğu yerden bağımsız olarak **Türkiye saatine** göre hesaplanır: "Açık / Atölye Hizmet Veriyor" ya da "Kapalı / İlk Mesai Saatinde Dönüş Yapılacak".
- **WhatsApp iş emri jeneratörü:** makine türü, arıza kategorisi, aciliyet ve detaylardan biçimli bir servis bileti oluşturur ve 0538 077 35 71 hattına hazır metinle açar.
- **Hizmet kapsamı:** Seyyar borvek ve sıfırdan imalat şu anda sunulmamaktadır; bu not kapsam bölümünde, formda, SSS'de ve alt bilgide yazılıdır.

## Bilgiler nerede

| Ne | `index.html` içinde |
|---|---|
| Telefon / WhatsApp | `TELEFON` sabiti (`<script id="cekirdek">`) ve `tel:+905380773571` bağlantıları |
| Hazır WhatsApp mesajı | `KARSILAMA` sabiti |
| Çalışma saatleri | `SAATLER` sabiti ve `.saatler` tablosu |
| Adres | "Selimiye Mah. Sanayi Sitesi" geçen yerler |
| Hizmet bölgesi | `.cipler` listesi ve formdaki konum seçenekleri |
