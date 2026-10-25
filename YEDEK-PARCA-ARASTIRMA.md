# Yedek Parça ve Yağ Tedariki — Araştırma Notu

Başkent İş Makinaları'nın iç başvuru belgesi (sitede yayımlanmaz). Ekim 2026.

**Okumadan önce tek kural:** Bir makinenin hangi yağı, hangi filtreyi, hangi parçayı aldığı **markaya, modele, seri (şasi) numarasına ve yıla** göre değişir. Aynı modelin iki farklı seri numarası farklı parça alabilir. Bu belge doğru soruyu sormanızı ve doğru sınıfı tanımanızı sağlar; **kesin kararı her zaman makinenin kullanım/bakım kılavuzu ve parça kataloğu verir.** Aşağıda üreticinin kendi kaynağında doğruladığım bilgiler "doğrulandı" diye, doğrulayamadıklarım açıkça "kılavuzdan teyit" diye işaretli.

---

## 1. Terimler: "cer" ne demek? "Ciğer" diye bir parça var mı?

- **Cer (yürüyüş ceri, cer grubu)** — Paletli makinelerde paleti döndüren son tahrik ünitesidir. İngilizcesi *final drive* / *travel device*. İçinde **yürüyüş hidromotoru** ve **planet dişli redüktör** bulunur: hidromotor dönüş üretir, planet redüktör devri düşürüp torku artırır ve palete verir. Sektörde "cer", "final drive", "travel device", "komple yürüyüş ünitesi" aynı şeyi anlatır. Kelime Arapça *cerr* (çekmek) kökünden gelir; makinenin son güç aktarım noktasıdır, en yüksek tork burada oluşur.
- **Cer dişlisi** — Cerin dış tarafındaki, palet zincirine geçen dişli (İng. *sprocket*). Piyasada "rim dişlisi" / "turbin" diye de anılır. Büyük makinelerde diş segmentleri cıvatalı ve ayrı değişir.
- **Cer yağı** — Cer redüktörünün içindeki dişli yağı. Motor ve hidrolik yağından ayrı bir bölmedir; sağ ve sol cer ayrı ayrı doldurulur.
- **Kule dönüş redüktörü (swing)** — Cer değildir; üst gövdeyi döndüren ayrı redüktördür, kendi yağı vardır.
- **"Ciğer"** — Kaynaklarda iş makinesi parçası olarak "ciğer" adında bir terim bulamadım. Aradığınız terim büyük ihtimalle **cer**dir. (Radyatör peteğini kastediyorsanız onun yaygın adı "petek"tir.)

Kaynak: MEB *Paletli Yürüyüş Sistemleri* modülü ("Cer (nihai tahrik) dişli grubu"); Vikipedi *Palet (mekanik)*; parça satıcılarının "yürüyüş ceri komple" ürün sayfaları.

---

## 2. Makine tipine göre yağ bölmeleri (her makine için ayrı ayrı sorulacak yağlar)

| Makine | Yağ / sıvı bölmeleri |
|---|---|
| **Paletli ekskavatör** | Motor yağı · Hidrolik yağı · Kule dönüş redüktörü yağı · Sağ cer yağı · Sol cer yağı · (varsa) pompa tahrik / damper kutusu yağı · Antifriz · Gres · (Stage V/Tier 4 ise) AdBlue |
| **Lastikli ekskavatör** | Motor · Hidrolik · Kule dönüş · Şanzıman · Ön aks · Arka aks · Antifriz · Gres |
| **Beko loder (kazıcı yükleyici)** | Motor · Hidrolik · Şanzıman (powershift/autoshift/manuel mekik) · Ön aks + göbekler · Arka aks (çoğunda ıslak fren) · Fren hidroliği (bazı modellerde ayrı) · Antifriz · Gres |
| **Lastikli yükleyici (loder)** | Motor · Hidrolik · Şanzıman/tork konvertörü · Ön ve arka aks (ıslak fren) · Antifriz · Gres |
| **Paletli dozer** | Motor · Hidrolik · Powershift şanzıman · Cer (final drive) sağ/sol · Direksiyon/fren bölmesi (modele göre) · Antifriz · Gres |
| **Greyder** | Motor · Hidrolik · Şanzıman · Arka aks/diferansiyel · Tandem kutuları · Daire (sirkıl) dişlisi · Antifriz |
| **Silindir** | Motor · Hidrolik · Tambur/vibrasyon yatağı yağı · Aks/redüktör · Antifriz |
| **Forklift / teleskopik** | Motor (veya akü) · Hidrolik · Şanzıman · Aks · Fren sıvısı |
| **Mini ekskavatör** | Motor · Hidrolik · Cer yağı (sağ/sol) · Antifriz · Gres (dönüş dişlisi çoğunda gresle) |

---

## 3. Yağ sınıfları — bilinmesi gereken genel karşılıklar

Bu tablo "hangi tür yağ nereye" sorusunun genel cevabıdır; marka adı değil **sınıf** verir.

| Bölme | Genel sınıf | Not |
|---|---|---|
| Dizel motor | API CK-4 / CI-4, SAE 15W-40 veya 10W-30 | DPF'li (partikül filtreli) yeni motorlar **düşük küllü (low SAPS / LA)** yağ ister |
| Hidrolik | ISO VG 46 aşınma önleyici (HM / DIN 51524-2 HLP); geniş sıcaklık için HV (HVLP) | Sıcak iklimde bazı üreticiler VG 68 veya daha kalın verir; soğukta VG 32 |
| Powershift şanzıman, ıslak fren, cer (bazı markalar) | Caterpillar **TO-4** sınıfı, SAE 10W / 30 / 50 | Cat ve Komatsu ağırlıklı bu sınıfı kullanır |
| Beko loder arka aks (ıslak fren) | Islak fren uyumlu aks yağı / UTTO | **Normal GL-5 dişli yağı konmaz** — fren kayar, öter, gücü düşer |
| Aks, diferansiyel, göbek | API GL-5, SAE 80W-90 / 85W-140 | Kilitli (LSD) diferansiyele "LS" katkılı yağ |
| Ekskavatör cer ve dönüş redüktörü | Markaya göre: GL-4/GL-5 90 dişli yağı **veya** TO-4 SAE 30/50 | Burada markalar farklı; aşağıdaki tabloya bakın |
| Gres | NLGI 2 lityum / lityum kompleks EP | Kırıcı ucu için ayrı **çekiç (keski) gresi** |
| Soğutma | Uzun ömürlü (OAT/ELC) antifriz, üreticinin tipine göre | Farklı tip antifrizler karıştırılmaz |

---

## 4. Marka marka orijinal yağlar (üretici kaynağından doğrulananlar)

### Caterpillar — doğrulandı
- **Motor:** Cat DEO, Cat DEO-ULS (egzoz sonrası arıtmalı motorlar) 15W-40 / 10W-30.
- **Hidrolik:** Cat HYDO Advanced 10 / 20 / 30, Cat Bio HYDO Advanced. HYDO Advanced'e geçerken eski yağla karışımın %10'un altında kalması isteniyor; yağ analiziyle (S·O·S) değişim aralığı 6.000 saate kadar uzatılabiliyor.
- **Şanzıman / güç aktarma:** Cat TDTO — SAE 10W, 30, 50. Üretici: tüm Cat şanzıman, **final drive (cer)**, aks ve ıslak fren bölmeleri için önerilir.
- **Aks / final drive:** Cat FDAO, FDAO SYN (ağır yüklü final drive ve akslar).
- **Diğer:** Cat GO (dişli yağı), MTO (traktör yağı), ELC antifriz, Cat gresleri.
- Hangi bölmeye hangi viskozite: Cat yayını **SEBU6250 (Machine Fluid Recommendations)** ve makinenin kılavuzu.

### Komatsu — doğrulandı
- **Motor:** EO15W40-LA (düşük küllü, yeni nesil motorlar için), EO10W30 vb.
- **Hidrolik:** HO46-HM (ISO VG 46, DIN 51524-2 HLP), HO56-HE (yüksek verimli, -40 °C ile 50 °C arası), soğuk iklim için HO-MVK.
- **Güç aktarma:** TO10, TO30 (SAE 30, API CD). Komatsu'nun güncel ekskavatör parça kılavuzlarında **cer (final drive) sağ/sol, kule dönüş ve damper kutusu TO30** olarak geçiyor (ör. PC130-11, PC290LL-11 kılavuzları).
- **Aks:** AXO 80 (frenli akslar). **Antifriz:** AF-NAC.
- Not: Eski Komatsu makinelerin bazılarında hidrolik için motor yağı (10W) öngörülmüş; eski makinede kılavuza bakmadan HO46'ya geçilmez.

### Volvo İş Makineleri — doğrulandı
- **Motor:** Volvo Engine Oil VDS-4.5 (15W-40 / 10W-30); Volvo filtresiyle 1.000 saat değişim (uygun modellerde).
- **Hidrolik:** Volvo Hydraulic Oil 98608 Super, 98609 Extra, 98620 Ultra, 98610 Biyobozunur.
- **Şanzıman:** Volvo Transmission Oil 30, Volvo ATF 97342 AT102.
- **Aks:** Volvo Axle Oil 97321 80W-90 / 85W-140, 97317 75W-80, LS 85W-90 GL-5.
- **Islak fren:** Volvo Wet Brake Oil 97303 WB101, 97304 WB102.

### JCB — doğrulandı
- **Motor:** JCB Engine Oil (EP / HP 15W-40), DPF'li motorlar için JCB Advanced Engine Oil 10W-30.
- **Hidrolik:** JCB Hydraulic Fluid HP 46, OP 46, HP 32, UP 32 (soğuk iklim), OP 68, HP 15.
- **Şanzıman:** JCB EP Transmission Fluid 10W — powershift ve synchroshift şanzımanlar, hidrostatik şanzımanlar ve göbek redüktörleri için.
- **Aks:** JCB Gear Oil HP Plus / LS Plus — ıslak frenli akslarda fren ötmesini önleyen katkılı yağ. Satıcı uyarısı: standart dişli yağıyla karıştırılmaz, yanlış yağ fren gücü kaybına yol açar.
- **Gres:** JCB Special HP Grease, Special Hammer Grease (kırıcı).

### Hitachi — doğrulandı
- **Motor:** Hitachi Engine Oil 15W-40 DH-1 (Zaxis-1 ve eskiler), 10W-40 DH-2 (ZX-3, -5, -6, -7 ve ZW serileri).
- **Hidrolik:** Hydraulic Oil 5000 (5.000 saat değişim hedefi), Hydraulic Oil Multi, TP46; Amerika'da Super 46HN, Super 32HC.
- **Cer ve dönüş redüktörü:** Hitachi Genuine Gear Oil 90 (API GL-4) / 80W-90 — üretici bunu ekskavatörlerin **yürüyüş (cer) ve dönüş redüktörleri** için veriyor.
- **ZW loder:** ZW Transmission Oil 10W, aks yağı (High Gear GL-4), ZX-W lastikli ekskavatör aksı için GL-5-LS.

### Develon (eski Doosan) — kısmen doğrulandı
- Orijinal motor, hidrolik ve dişli/aks/şanzıman yağı serisi var. Üretici notu: **orijinal olmayan hidrolik yağ kullanılırsa değişim aralığı 1.000 saatle sınırlıdır.**
- Bölme bazında sınıf ve viskozite: kılavuzdan teyit.

### Hyundai (HD Hyundai) — kısmen doğrulandı
- Orijinal hidrolik yağı ISO VG 32 (5.000 saatlik "uzun ömürlü"), VG 46, VG 68 olarak satılıyor (parça no. 91EE-… serisi).
- Motor, cer ve dönüş redüktörü yağı: kılavuzdan teyit.

### Liebherr — doğrulandı
- **Motor:** Liebherr Motoroil 10W-40, 10W-40 low ash, 5W-30, 5W-30 low ash.
- **Hidrolik:** Hydraulic Plus, Hydraulic Plus Arctic, Hydraulic Plus 37, Hydraulic HVI (ISO VG 46, -20 °C ile +40 °C), **Hydraulic Basic 100 (ISO VG 100, 0 °C ile +55 °C — sıcak iklim için).**
- Şanzıman/aks: Liebherr Gear serisi (ör. Gear ATF Plus 37); bölmeye göre kılavuzdan teyit.

### Case ve New Holland (CNH) — doğrulandı (ürün adları)
- CASE No. 1 Engine Oil 15W-40 CK; CNHi Premium Hydraulic Oil HM 46, HV 46, HM 68, HV 68; CNHi Hypoid Gear Oil 85W-140; Premium Transaxle Oil 80W-140; Universal Tractor/Transmission Oil (beko loder arka aks için UTTO tipi). Bölme eşleşmesi kılavuzdan teyit.

### Kubota (mini ekskavatör) — doğrulandı
- Kubota Super UDT2: hidrolik, final drive, şanzıman, diferansiyel ve ıslak fren sistemleri için.
- Kubota Excavator Hydraulic Oil ISO VG 32 / VG 46.

### Kobelco — kısmen doğrulandı
- Orijinal motor, hidrolik ve dişli yağı + uzun ömürlü antifriz serisi var. Eski SK60 gibi makinelerde dönüş ve yürüyüş redüktörü için SAE 30 (CD) motor yağı belirtilmiş — yeni nesilde kılavuzdan teyit.

### Hidromek — kısmen doğrulandı
- Dolum kapasiteleri üretici kataloglarında var (ör. HMK 140 LC: motor 16 L, hidrolik sistem 210 L, dönüş redüktörü 3 L, yürüyüş redüktörü 2 × 2,1 L; HMK 102B Alpha: motor 8 L, hidrolik tank 70 L).
- Motorlar dönemine göre Perkins, John Deere, Isuzu; beko loderlerin bir kısmında Carraro şanzıman — **filtre ve parça seçimi motor/şanzıman markasına göre** yapılır.
- Orijinal bakım paketleri saat bazlı (ör. HMK 102 Perkins/Carraro 1000 saat paketi). Yağ sınıfları: kılavuzdan teyit.

### Doğrulayamadığım markalar (kılavuz şart)
Sany, XCMG, LiuGong, Sumitomo, Takeuchi, Bobcat, Yanmar, Mecalac, John Deere, Manitou, Terex, Bomag, Hamm, Dynapac, Putzmeister, Schwing ve forklift markaları. Bunlar için yağ sınıfını tahminle vermeyin; müşteriden kılavuz sayfasının veya yağ kapağı/etiket fotoğrafının gelmesini isteyin.

---

## 5. Tedarik edilecek parça grupları (tam liste)

**Filtreler** — motor yağ filtresi · yakıt ön filtresi / su ayırıcı · ana yakıt filtresi · hava filtresi iç + dış · hidrolik dönüş filtresi · hidrolik emiş süzgeci · pilot filtresi · drenaj (kaçak) filtresi · kırıcı hattı filtresi · şanzıman filtresi · kabin / klima filtresi · hidrolik tank havalandırma (breather) · DEF/AdBlue filtresi · antifriz filtresi.

**Motor** — conta takımı (üst/alt) · segman, piston, gömlek, kol-ana yatak · turbo · enjektör ve yakıt pompası · su pompası · termostat · fan ve kayışlar · radyatör (petek) · intercooler · yağ soğutucu · marş ve şarj dinamosu · motor takozları.

**Hidrolik** — ana pompa ve tamir takımı · pilot pompa · kumanda (ana) valfi ve keçeleri · kule dönüş motoru ve redüktörü · **cer komple ve iç parçaları (planet dişliler, güneş dişlisi, rulmanlar, yüzer keçe)** · yürüyüş hidromotoru · döner mafsal (center joint) keçeleri · silindir keçe takımları, mil, gömlek · hortum, rakor, ara bağlantı · hızlı bağlantı (quick coupler) · kırıcı tesisatı.

**Joystick ve kumanda** — pilot joystick kolu · joystick itici (pusher) ve tamir takımı · pilot (uzaktan kumanda) valfi · kol başlığı ve butonları · yürüyüş pedal valfi · elektrikli joystick ve sensörleri · emniyet (kilit) kolu valfi/solenoidi.

**Alt takım / yürüyüş (paletli)** — palet zinciri · pabuç ve pabuç cıvata-somunu · **cer dişlisi (sprocket) / segmentleri** · avara (istikamet) tekeri · alt makaralar · üst taşıyıcı makaralar · gergi silindiri ve yayı · palet koruyucu · mini ekskavatörlerde **lastik palet**.

**Şanzıman ve aks (lastikli)** — tork konvertörü · disk/balata (kavrama) takımları · şanzıman solenoidleri ve sensörleri · aks göbeği planetleri · diferansiyel · ıslak fren diskleri · kardan mili ve istavroz.

**Aşınma ve ataşman** — kova tırnağı ve adaptörü · bıçak ve yan bıçaklar · pim–burç takımları · kova bağlantı pimleri · kırıcı keskisi (uç) ve burçları.

**Elektrik ve elektronik** — ECU (beyin) · sensörler (basınç, sıcaklık, devir) · monitör/gösterge · akü · kablo tesisatı · röle, sigorta · çalışma lambaları · klima kompresörü.

**Kabin** — cam · koltuk · ayna · silecek motoru · kapı kilit ve menteşesi.

**Sarf** — tüm yağlar (motor, hidrolik, şanzıman, aks, cer, dönüş) · gres ve çekiç gresi · antifriz · AdBlue.

---

## 6. Doğru parça için müşteriden istenecek bilgiler

1. Makinenin **markası ve modeli**.
2. **Seri / şasi numarası** (makine plakası — çoğunda kabinin yanında veya ön şasi üstünde).
3. **Motor marka ve seri numarası** (motor etiketinden; özellikle filtre ve motor parçası için).
4. **Üretim yılı.**
5. Değişecek parçanın üzerindeki **parça numarası**.
6. Parçanın ve makine plakasının **fotoğrafı** (WhatsApp'tan).

Bu bilgiler gelmeden yağ ya da parça önerilmemeli. Aynı model adı farklı seri numaralarında farklı pompa, valf ve filtre alabiliyor.

---

## 7. Sık yapılan yanlışlar (sitede de anlatıldı)

- Islak frenli beko loder aksına **normal GL-5 dişli yağı** koymak → fren gücü düşer, fren öter.
- Hidrolik sisteme, üretici öngörmeden **motor yağı** koymak (ya da tersi) → keçe ve pompa zarar görür.
- Farklı tip hidrolik yağları karıştırmak → Cat örneğinde karışımın %10'un altında kalması isteniyor; geçişte sistem boşaltılıp filtre değiştirilmeli.
- Cer yağını kontrol etmemek → cer içindeki planet ve rulman aşınır; cer komple değişimi makinenin en pahalı onarımlarından biridir.
- DPF'li yeni motora yüksek küllü eski tip motor yağı koymak → partikül filtresi tıkanır.

---

## Kaynaklar
- Caterpillar: [Cat oils](https://www.cat.com/en_US/campaigns/awareness/filters-and-fluids/fluids/oils.html) · [Cat TDTO ürün sayfası (PDF)](https://www.petersoncat.com/sites/cat/files/downloads/Cat%20TDTO.pdf) · [HYDO Advanced 10 veri sayfası](https://mujstroj.zeppelin.cz/fileadmin/downloads/Cat-HYDO-Advanced-10-Datasheet-2.pdf) · [Toromont Cat yağ tablosu](https://www.toromontcat.com/docs/default-source/default-document-library/cat-fluids-oils-3_11-lo-res.pdf)
- Komatsu: [Yağlayıcılar broşürü](https://www.komatsu.com/content/dam/komatsu/websites/middle-east/en-ae/documents/brochure-pdf/Lubricants_FENS00935_2505_v3.pdf) · [PC130-11 parça kılavuzu](https://www.komatsu.com/content/dam/komatsu/sales-and-marketing-documents/quick-reference-parts-guides/pc130-11-excavator-qrpg-komatsu.pdf) · [PC290LL-11 parça kılavuzu](https://www.komatsu.com/content/dam/komatsu/sales-and-marketing-documents/quick-reference-parts-guides/pc290ll-11-excavator-qrpg-komatsu.pdf) · [Komatsu Japonya yağ serisi](https://kcsj.komatsu/-/media/kcsj/contact/download/pdf/parts/supplies_01.pdf)
- Volvo: [Volvo CE yağlayıcılar](https://www.volvoce.com/en-us/ocean-spray/parts/maintenance-parts/lubricants) · [VDS-4.5 ile 1.000 saat](https://www.volvogroup.com/en/news-and-media/news/2021/apr/volvo-construction-equipment-extends.html)
- JCB: [JCB yağlayıcılar kataloğu](https://jcb.com/dfsmedia/261086efe15a46f5afb95d093ef038ea/55045-source) · [JCB servis sıvıları](https://www.jcb.com/en-gb/customer-support/parts/lubricants) · [EP Transmission 10W ürün sayfası](https://hydroczesci.pl/en/filters-oils-jcb-cat/oils-grease/15781-jcb-fluid-ep-transmission-10w-5-gallon20l-original.html)
- Hitachi: [Avrupa yağlayıcı broşürü 2024](https://hitachicm.com/content/dam/hitachicm/eu/en/docs/brochures/lubricants/HITACHI-LUBRICANTS-Leaflet-EN-2024.pdf) · [Genuine Gear Oil 90](https://hitachicm.com/eu/en/lubricants/hitachi-genuine-gear-oil) · [Amerika yağlayıcıları](https://www.hitachicm.com/content/dam/hitachicm/us/en/lubricants/Genuine%20Lubricants_Coolants_english.pdf)
- Develon: [Orijinal yağlar](https://cis.develon-ce.com/en/parts-service/genuine-parts/oil/)
- Hyundai: [91EE-61250 VG46](https://shop.moderngroup.com/91ee-61250-hyd-oil-vg46-4l) · [91EE-61350 VG32 5000 saat](https://shop.moderngroup.com/91ee-61350-hyd-oil-l-life-vg32-pail)
- Liebherr: [Liebherr yağlayıcılar](https://www.liebherr.com/en-us/group/about-liebherr/services/operating-materials/operating-materials-3781973) · [Liebherr broşürü](https://assets-cdn.liebherr.com/assets/api/953f98b9-6557-4b54-aead-6124a2a371b8/Original)
- Case / CNH: [Güvenlik bilgi formları (ürün listesi)](https://www.casece.com/en-au/oceania/service-and-support/safety-data-sheet)
- Kubota: [Kubota yağlayıcılar](https://www.kubotausa.com/parts/kubota-parts-products/lubricants)
- Kobelco: [Kobelco orijinal parçalar](https://www.kobelco.com.au/parts/)
- Hidromek: [HMK 140 LC kapasiteler](https://www.bcmakina.com.tr/hidromek-hmk-140-lc-paletli-ekskavator/) · [HMK 102B Alpha](https://www.bcmakina.com.tr/hidromek-hmk-102b-alpha-kazici-yukleyici/) · [HMK 102 1000 saat bakım paketi](https://turhanismakine.com.tr/urunler/hmk-102-perkins-motor-serisi-1000-saatlik-bakim-paketi-filtreleri/)
- Cer terimi: [MEB Paletli Yürüyüş Sistemleri](https://megep.meb.gov.tr/mte_program_modul/moduller_pdf/Paletli%20Y%C3%BCr%C3%BCy%C3%BC%C5%9F%20Sistemleri.pdf) · [Palet (mekanik) — Vikipedi](https://tr.wikipedia.org/wiki/Palet_(mekanik)) · [Yürüyüş ceri komple ürün açıklaması](https://www.tkykeremithalat.com/urunler/yuruyus-ceri-komple-hitachi-zx350lch-3/) · [Cer nedir?](https://makineteknoloji.wordpress.com/cer-nedir/)
