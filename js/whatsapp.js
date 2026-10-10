// WhatsApp'ı yeni sekmede güvenli açma.
// 'noopener' verilirse window.open her zaman null döner ve sekmenin engellenip engellenmediği anlaşılamaz.
// Bu yüzden önce boş sekme açılır, sekmenin bu sayfaya erişimi (opener) kesilir, sonra WhatsApp yüklenir.
(function (kok) {
  // pencereAc: window.open ile aynı imza. Sekme açıldıysa true, engellendiyse ya da hata verdiyse false.
  function whatsappSekmesiAc(url, pencereAc) {
    let sekme;
    try {
      sekme = pencereAc('', '_blank');
    } catch (hata) {
      return false;
    }
    if (!sekme) return false;
    sekme.opener = null;
    sekme.location.href = url;
    return true;
  }

  const api = { whatsappSekmesiAc };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else kok.BaskentWhatsapp = api;
})(typeof window !== 'undefined' ? window : globalThis);
