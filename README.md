# Başkent İş Makinaları

İş makinası tamir ve bakım atölyesi için tek sayfalık tanıtım sitesi. Derleme adımı yoktur: `index.html` dosyasını tarayıcıda açmanız ya da klasörü herhangi bir statik sunucuya (Netlify, GitHub Pages, cPanel vb.) yüklemeniz yeterli.

```
index.html        sayfa
css/style.css     tasarım
js/main.js        menü, animasyonlar, servis formu (WhatsApp'a yönlendirir), açık/kapalı yazısı
js/saatler.js     çalışma saatleri ve "şu an açık mı" hesabı (Türkiye saatine göre)
js/whatsapp.js    WhatsApp sekmesini güvenli açma (engellenirse false döner)
tests/            saat hesabının testleri: `node --test` (Node 20+, kurulum gerekmez)
assets/           favicon
```

## İletişim bilgileri nerede

| Ne | Nerede |
|---|---|
| Telefon numarası | `index.html` içindeki `0538 077 35 71` ve `tel:+905380773571` |
| WhatsApp numarası | `js/main.js` → `ATOLYE.whatsapp` |
| E-posta | Şimdilik yok. Eklenecekse `index.html` → `.contact__dl` içine bir satır |
| Adres | `index.html` → `Selimiye Mah. Sanayi Sitesi, Milas / Muğla` (iki yerde) |
| Saha servisi bölgeleri | `index.html` → `.field__list` |

## Görseller

Şimdilik Wikimedia Commons'taki özgür lisanslı gerçek fotoğraflar kullanılıyor. Kaynak ve lisans listesi sayfanın en altındaki "Görsel kaynakları" bölümünde. Kendi atölye fotoğraflarınız hazır olunca `assets/img/` klasörüne koyup ilgili `<img src="...">` değerini değiştirmeniz yeterli. Bir görsel yüklenemezse sayfa bozulmaz, yerine desenli koyu bir alan görünür.
