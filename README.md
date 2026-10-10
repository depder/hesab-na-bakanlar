# Başkent İş Makinaları

İş makinası tamir ve bakım atölyesi için tek sayfalık tanıtım sitesi. Derleme adımı yoktur: `index.html` dosyasını tarayıcıda açmanız ya da klasörü herhangi bir statik sunucuya (Netlify, GitHub Pages, cPanel vb.) yüklemeniz yeterli.

```
index.html        sayfa
css/style.css     tasarım
js/main.js        menü, animasyonlar, servis formu (WhatsApp'a yönlendirir)
assets/           favicon
```

## Yayına almadan önce değiştirilecekler

| Ne | Nerede |
|---|---|
| Telefon numarası | `index.html` içindeki `0 (312) 000 00 00` ve `tel:+903120000000` |
| WhatsApp numarası | `js/main.js` → `ATOLYE.whatsapp` |
| E-posta | `index.html` → `servis@baskentismakinalari.com` |
| Adres | `index.html` → `Sanayi Sitesi, Ankara` (iki yerde) |
| Saha servisi bölgeleri | `index.html` → `.field__list` |

## Görseller

Şimdilik Wikimedia Commons'taki özgür lisanslı gerçek fotoğraflar kullanılıyor. Kaynak ve lisans listesi sayfanın en altındaki "Görsel kaynakları" bölümünde. Kendi atölye fotoğraflarınız hazır olunca `assets/img/` klasörüne koyup ilgili `<img src="...">` değerini değiştirmeniz yeterli. Bir görsel yüklenemezse sayfa bozulmaz, yerine desenli koyu bir alan görünür.
