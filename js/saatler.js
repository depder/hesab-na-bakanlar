// Çalışma saatleri ve "şu an açık mı" hesabı.
// Saat her zaman Türkiye saatine göre hesaplanır, ziyaretçinin bulunduğu saat diliminden bağımsızdır.
(function (kok) {
  // getDay() sırasıyla: 0 = Pazar … 6 = Cumartesi. Günün dakikası olarak [açılış, kapanış]; null = kapalı.
  const SAATLER = [
    null,          // Pazar
    [540, 1110],   // Pazartesi 09:00–18:30
    [540, 1110],   // Salı
    [540, 1110],   // Çarşamba
    [540, 1110],   // Perşembe
    [540, 1110],   // Cuma
    [540, 810],    // Cumartesi 09:00–13:30
  ];
  const GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const KAPANISA_AZ_KALDI = 30; // dakika

  const saatYaz = (dk) => `${String(Math.floor(dk / 60)).padStart(2, '0')}:${String(dk % 60).padStart(2, '0')}`;

  const istanbulBicimi = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Istanbul',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  // Verilen anın İstanbul'daki günü (0–6) ve günün dakikası (0–1439)
  function istanbulZamani(tarih) {
    const parcalar = istanbulBicimi.formatToParts(tarih);
    const al = (tur) => parcalar.find((p) => p.type === tur).value;
    const gun = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(al('weekday'));
    return { gun, dakika: Number(al('hour')) * 60 + Number(al('minute')) };
  }

  // { acik, baslik, ek } döner. ek: kapanış ya da bir sonraki açılış bilgisi.
  function calismaDurumu(gun, dakika) {
    const bugun = SAATLER[gun];
    if (bugun && dakika >= bugun[0] && dakika < bugun[1]) {
      const kapanmakUzere = bugun[1] - dakika <= KAPANISA_AZ_KALDI;
      return {
        acik: true,
        baslik: kapanmakUzere ? 'Kapanmak üzereyiz' : 'Şu an açığız',
        ek: `kapanış ${saatYaz(bugun[1])}`,
      };
    }

    for (let fark = 0; fark <= 7; fark++) {
      const g = (gun + fark) % 7;
      const s = SAATLER[g];
      if (!s || (fark === 0 && dakika >= s[0])) continue;
      const hangiGun = fark === 0 ? 'bugün' : fark === 1 ? 'yarın' : GUNLER[g];
      return { acik: false, baslik: 'Şu an kapalıyız', ek: `açılış ${hangiGun} ${saatYaz(s[0])}` };
    }
    return { acik: false, baslik: 'Şu an kapalıyız', ek: '' };
  }

  const api = { SAATLER, istanbulZamani, calismaDurumu };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else kok.BaskentSaatler = api;
})(typeof window !== 'undefined' ? window : globalThis);
