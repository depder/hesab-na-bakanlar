// Arama (tel:) bağlantıları.
// Doğrudan açılan sitede tel: bağlantısı telefonun arama ekranını kendiliğinden açar; burada hiçbir şey değişmez.
// Site bir çerçevenin (iframe) içinde gösteriliyorsa (ör. önizleme bağlantısı) tarayıcı çerçevenin kendi içinden
// arama ekranına geçişi engelleyebilir. O durumda bağlantı, çalışan WhatsApp düğmesi gibi yeni pencere yolundan açılır.
(function (kok) {
  // Sayfa bir çerçevenin içinde mi? Üst pencereye erişim hata verirse kesin çerçevenin içindeyiz.
  function cerceveIcindeMi(pencere) {
    try {
      return pencere.self !== pencere.top;
    } catch (hata) {
      return true;
    }
  }

  // Çerçeve içindeyse tel: bağlantılarını yeni pencerede açılacak hale getirir; değiştirilen bağlantı sayısını döndürür.
  function telBaglantilariniAyarla(baglantilar, cerceveIcinde) {
    if (!cerceveIcinde) return 0;
    let sayi = 0;
    for (const a of baglantilar) {
      if (!String(a.getAttribute('href') || '').startsWith('tel:')) continue;
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
      sayi += 1;
    }
    return sayi;
  }

  const api = { cerceveIcindeMi, telBaglantilariniAyarla };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else kok.BaskentTelefon = api;
})(typeof window !== 'undefined' ? window : globalThis);
