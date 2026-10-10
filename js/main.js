// Atölye bilgileri: numara değişince yalnızca burayı güncelleyin.
const ATOLYE = {
  whatsapp: '905380773571', // ülke kodu ile, boşluksuz
};

// Mobil menü
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('menu');
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
  toggle.textContent = open ? 'Kapat' : 'Menü';
});
menu.addEventListener('click', (e) => {
  if (e.target.closest('a') && menu.classList.contains('open')) toggle.click();
});

// Yıl
document.getElementById('yil').textContent = new Date().getFullYear();

// Üst şeritte "şu an açık / kapalı". Betik yüklenmezse sabit saat bilgisi kalır.
const durumKutusu = document.getElementById('durum');
if (durumKutusu && window.BaskentSaatler) {
  let sonDurum = '';
  const durumuGuncelle = () => {
    const { gun, dakika } = BaskentSaatler.istanbulZamani(new Date());
    const d = BaskentSaatler.calismaDurumu(gun, dakika);
    const anahtar = `${d.baslik}|${d.ek}`;
    if (anahtar === sonDurum) return;
    sonDurum = anahtar;

    const nokta = document.createElement('span');
    nokta.className = 'durum__nokta';
    nokta.setAttribute('aria-hidden', 'true');
    const baslik = document.createElement('span');
    baslik.className = 'durum__yazi';
    baslik.textContent = d.baslik;
    const ek = document.createElement('span');
    ek.className = 'durum__ek';
    ek.textContent = d.ek;

    durumKutusu.classList.add('durum--canli');
    durumKutusu.classList.toggle('durum--acik', d.acik);
    durumKutusu.classList.toggle('durum--kapali', !d.acik);
    durumKutusu.title = 'Hafta içi 09:00–17:30 · Cumartesi 09:00–13:30 · Pazar kapalı';
    durumKutusu.replaceChildren(nokta, baslik, ek);
  };
  // Saat dilimi verisi olmayan eski bir tarayıcıda hesap hata verirse sabit saat bilgisi yerinde kalır
  const guvenliGuncelle = () => {
    try {
      durumuGuncelle();
    } catch (hata) {
      clearInterval(zamanlayici);
      console.warn('Açık/kapalı durumu hesaplanamadı:', hata);
    }
  };
  const zamanlayici = setInterval(guvenliGuncelle, 30 * 1000);
  guvenliGuncelle();
}

// Kaydırınca beliren bloklar
const revealables = document.querySelectorAll('.svc, .steps li, .mlist li, .g, .svc-extra > div, .faq details');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  revealables.forEach((el) => { el.classList.add('reveal'); io.observe(el); });
}

// İş emri numarası: tarih + rastgele kısa ek
const d = new Date();
const pad = (n) => String(n).padStart(2, '0');
const ticketNo = `${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.floor(100 + Math.random() * 900)}`;
document.getElementById('ticketNo').textContent = `No. ${ticketNo}`;

// Form → WhatsApp mesajı
const form = document.getElementById('form');
const msg = document.getElementById('formMsg');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  msg.className = 'ticket__msg';
  form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));

  const data = new FormData(form);
  const eksik = ['ad', 'tel', 'makine'].filter((k) => !String(data.get(k) || '').trim());
  const tel = String(data.get('tel') || '').replace(/\D/g, '');
  if (tel && tel.length < 10) eksik.push('tel');

  if (eksik.length) {
    eksik.forEach((k) => form.elements[k].classList.add('invalid'));
    form.elements[eksik[0]].focus();
    msg.textContent = 'Ad, telefon ve makine türü gerekli.';
    return;
  }

  const alanlar = data.getAll('alan');
  const satirlar = [
    `*Servis kaydı* (${ticketNo})`,
    `Ad / Firma: ${data.get('ad')}`,
    `Telefon: ${data.get('tel')}`,
    `Makine: ${data.get('makine')}${data.get('model') ? ' – ' + data.get('model') : ''}`,
    alanlar.length ? `Arıza alanı: ${alanlar.join(', ')}` : '',
    data.get('aciklama') ? `Şikâyet: ${data.get('aciklama')}` : '',
    `Konum: ${data.get('yer')}`,
  ].filter(Boolean);

  const url = `https://wa.me/${ATOLYE.whatsapp}?text=${encodeURIComponent(satirlar.join('\n'))}`;
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = 'buraya dokunun';

  // Önce boş sekme açıyoruz: 'noopener' verilirse window.open her zaman null döner ve engellendiğini
  // anlayamayız. Sekmenin bu sayfaya erişimini WhatsApp yüklenmeden önce kesiyoruz.
  const sekme = window.open('', '_blank');
  if (sekme) {
    sekme.opener = null;
    sekme.location.href = url;
    msg.classList.add('ok');
    msg.replaceChildren('WhatsApp yeni sekmede açıldı. Açılmadıysa ', link, '. Mesajı gönderdiğinizde kaydınız bize ulaşır.');
  } else {
    msg.replaceChildren('Tarayıcınız yeni sekmeyi engelledi. WhatsApp\'a geçmek için ', link, '.');
  }
});
