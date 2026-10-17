/* Başkent İş Makinaları — 3D ekskavatör sahnesi (three.js 0.170.0, MIT).
 * WebGL yoksa ya da three.js yüklenemezse sahnedeki SVG çizim yerinde kalır. */
(function () {
'use strict';
// Yerel kopya (assets/js/vendor) önce denenir; dosyadan (file://) açılışta tarayıcı modül yüklemeyi engellerse
// aynı sürüm jsDelivr'den alınır.
const THREE_YEREL = new URL('vendor/three.module.min.js', document.currentScript ? document.currentScript.src : location.href).href;
const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';
const sahneKutu = document.getElementById('sahne');
const tuval = document.getElementById('sahneTuval');

function webglVarMi() {
  try {
    const c = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (hata) {
    return false;
  }
}

function yedegeGec(neden) {
  if (sahneKutu) sahneKutu.dataset.sahne = 'yedek';
  if (neden) console.warn('3D sahne gösterilemiyor, çizim gösteriliyor:', neden);
}

if (!sahneKutu || !tuval) {
  // sayfada sahne yok
} else {
  // three.js (~690 KB) ilk boyamayı ve dokunma tepkisini geciktirmesin: masaüstünde sayfa yüklendikten sonra boşta,
  // telefon/tablette ve veri tasarrufu açıkken yalnızca ziyaretçi "3D modeli göster" derse yüklenir.
  // WebGL denetimi de bir GL bağlamı açtığı için ancak yükleme anında yapılır.
  const yukle = () => {
    if (!webglVarMi()) { yedegeGec('WebGL desteklenmiyor'); return; }
    sahneKutu.dataset.sahne = 'yukleniyor';
    import(THREE_YEREL).catch(() => import(THREE_CDN)).then((THREE) => kur(THREE)).catch((hata) => yedegeGec(hata));
  };
  const dokunmatik = window.matchMedia('(max-width: 980px), (pointer: coarse)').matches;
  const tasarruf = Boolean(navigator.connection && navigator.connection.saveData);
  const baslat = sahneKutu.querySelector('.sahne__baslat');
  if ((dokunmatik || tasarruf) && baslat) {
    baslat.hidden = false;
    baslat.addEventListener('click', () => { baslat.hidden = true; yukle(); }, { once: true });
  } else {
    const bosta = () => ('requestIdleCallback' in window ? window.requestIdleCallback(yukle, { timeout: 2500 }) : setTimeout(yukle, 600));
    if (document.readyState === 'complete') bosta();
    else window.addEventListener('load', bosta, { once: true });
  }
}

function kur(THREE) {
  const azHareket = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas: tuval, antialias: (window.devicePixelRatio || 1) < 2, alpha: true, powerPreference: 'high-performance' });
  let pikselOrani = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(pikselOrani);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const sahne = new THREE.Scene();
  const kamera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const hedef = new THREE.Vector3(0, 1.45, 0);
  const V2 = (x, y) => new THREE.Vector2(x, y);

  // ---- Ortam yansıması: küçük bir "atölye" sahnesinden önceden filtrelenmiş ışık ----
  const pmrem = new THREE.PMREMGenerator(renderer);
  const ortam = new THREE.Scene();
  const ortamGeo = [];
  const odaGeo = new THREE.BoxGeometry(14, 8, 14); ortamGeo.push(odaGeo);
  ortam.add(new THREE.Mesh(odaGeo, new THREE.MeshBasicMaterial({ color: 0x0d1016, side: THREE.BackSide })));
  function panel(renk, guc, w, h, x, y, z, rx, ry) {
    const g = new THREE.PlaneGeometry(w, h); ortamGeo.push(g);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: new THREE.Color(renk).multiplyScalar(guc), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.rotation.set(rx, ry, 0); ortam.add(m);
  }
  panel(0xffffff, 4, 9, 1.6, 0, 3.9, 0, Math.PI / 2, 0);
  panel(0xf5a524, 3, 1.2, 6, -6.8, 0.8, 0, 0, Math.PI / 2);
  panel(0xbcd0ff, 1.6, 6, 2.4, 0, 1, 6.8, 0, Math.PI);
  panel(0xffffff, 1.2, 2.4, 3.4, 6.8, 1.2, -2.4, 0, -Math.PI / 2);
  sahne.environment = pmrem.fromScene(ortam, 0.035).texture;
  sahne.environmentIntensity = 1.4;
  ortamGeo.forEach((g) => g.dispose());
  pmrem.dispose();

  // ---- Işıklar ----
  sahne.add(new THREE.HemisphereLight(0x9fb1cf, 0x14110c, 0.8));
  const anaIsik = new THREE.DirectionalLight(0xfff1dc, 3); anaIsik.position.set(4, 7, 6); sahne.add(anaIsik);
  const konturIsik = new THREE.DirectionalLight(0xf5a524, 3); konturIsik.position.set(-6, 3.5, -5); sahne.add(konturIsik);
  const dolguIsik = new THREE.DirectionalLight(0x9db4ff, 0.8); dolguIsik.position.set(-3, 1.5, 6); sahne.add(dolguIsik);

  // ---- Malzemeler ----
  const M = {
    turuncu: new THREE.MeshStandardMaterial({ color: 0xe8661e, metalness: 0.3, roughness: 0.42 }),
    koyu: new THREE.MeshStandardMaterial({ color: 0x2d3239, metalness: 0.5, roughness: 0.5 }),
    siyah: new THREE.MeshStandardMaterial({ color: 0x16191e, metalness: 0.4, roughness: 0.45 }),
    cam: new THREE.MeshStandardMaterial({ color: 0x1b2836, metalness: 0.95, roughness: 0.06 }),
    palet: new THREE.MeshStandardMaterial({ color: 0x2b2d31, metalness: 0.55, roughness: 0.78 }),
    celik: new THREE.MeshStandardMaterial({ color: 0x5d6675, metalness: 0.85, roughness: 0.36 }),
    krom: new THREE.MeshStandardMaterial({ color: 0xeef2f7, metalness: 1, roughness: 0.1 }),
    hardox: new THREE.MeshStandardMaterial({ color: 0xb4bcc8, metalness: 0.92, roughness: 0.3, side: THREE.DoubleSide }),
    kova: new THREE.MeshStandardMaterial({ color: 0x3d3b39, metalness: 0.55, roughness: 0.52, side: THREE.DoubleSide }),
    kovaIc: new THREE.MeshStandardMaterial({ color: 0x292725, metalness: 0.4, roughness: 0.7, side: THREE.DoubleSide })
  };

  // ---- Yardımcılar ----
  function kutu(en, boy, derinlik, malzeme, x, y, z, ebeveyn) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(en, boy, derinlik), malzeme);
    m.position.set(x, y, z);
    ebeveyn.add(m);
    return m;
  }
  // Ekseni z yönünde (pim yönünde) duran silindir
  function pimSilindiri(yaricap, boy, malzeme, x, y, z, ebeveyn) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(yaricap, yaricap, boy, 24).rotateX(Math.PI / 2), malzeme);
    m.position.set(x, y, z);
    ebeveyn.add(m);
    return m;
  }
  function ekstrude(sekil, derinlik, malzeme, zBas, ebeveyn) {
    const geo = new THREE.ExtrudeGeometry(sekil, { depth: derinlik, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 1, curveSegments: 16 });
    const m = new THREE.Mesh(geo, malzeme);
    m.position.z = zBas;
    ebeveyn.add(m);
    return m;
  }
  function nokta(ebeveyn, x, y, z) {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    ebeveyn.add(o);
    return o;
  }

  const duzen = new THREE.Group();   // fareyle dönen ana grup
  sahne.add(duzen);
  const makine = new THREE.Group();
  makine.position.x = -1.25;         // makinenin ortası dönme ekseninde dursun
  duzen.add(makine);

  // ---- Paletler (alt yürüyüş) ----
  const PALET_X = 1.75, PALET_R = 0.43, PALET_G = 0.62, PALET_Z = 1.12;
  function stadyum(r) {
    const s = new THREE.Shape();
    s.moveTo(-PALET_X, -r);
    s.lineTo(PALET_X, -r);
    s.absarc(PALET_X, 0, r, -Math.PI / 2, Math.PI / 2, false);
    s.lineTo(-PALET_X, r);
    s.absarc(-PALET_X, 0, r, Math.PI / 2, Math.PI * 1.5, false);
    return s;
  }
  const kusakSekil = stadyum(PALET_R);
  kusakSekil.holes.push(stadyum(PALET_R - 0.11));
  const kusakGeo = new THREE.ExtrudeGeometry(kusakSekil, { depth: PALET_G, bevelEnabled: false, curveSegments: 18 });
  const sasiGeo = new THREE.ExtrudeGeometry(stadyum(PALET_R - 0.12), { depth: PALET_G - 0.14, bevelEnabled: false, curveSegments: 14 });
  [-1, 1].forEach((yon) => {
    const zMerkez = yon * PALET_Z;
    const k = new THREE.Mesh(kusakGeo, M.palet); k.position.set(0, PALET_R, zMerkez - PALET_G / 2); makine.add(k);
    const s = new THREE.Mesh(sasiGeo, M.koyu); s.position.set(0, PALET_R, zMerkez - (PALET_G - 0.14) / 2); makine.add(s);
    pimSilindiri(0.31, 0.06, M.celik, PALET_X, PALET_R, zMerkez + yon * (PALET_G / 2 - 0.02), makine);   // gergi tekeri
    pimSilindiri(0.31, 0.06, M.celik, -PALET_X, PALET_R, zMerkez + yon * (PALET_G / 2 - 0.02), makine);  // yürüyüş dişlisi
  });
  // Palet pabuçları (tek çizimde, örnekli)
  const PABUC = 54;
  const pabuclar = new THREE.InstancedMesh(new THREE.BoxGeometry(0.15, 0.055, PALET_G + 0.02), M.palet, PABUC * 2);
  const cevre = 4 * PALET_X + 2 * Math.PI * PALET_R;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), birim = new THREE.Vector3(1, 1, 1), yer = new THREE.Vector3(), eksenZ = new THREE.Vector3(0, 0, 1);
  let say = 0;
  [-1, 1].forEach((yon) => {
    for (let i = 0; i < PABUC; i++) {
      let s = (i / PABUC) * cevre, x, y, aci;
      const r = PALET_R + 0.02;
      if (s < 2 * PALET_X) { x = -PALET_X + s; y = -r; aci = 0; }
      else if ((s -= 2 * PALET_X) < Math.PI * PALET_R) { const t = s / PALET_R - Math.PI / 2; x = PALET_X + Math.cos(t) * r; y = Math.sin(t) * r; aci = t + Math.PI / 2; }
      else if ((s -= Math.PI * PALET_R) < 2 * PALET_X) { x = PALET_X - s; y = r; aci = Math.PI; }
      else { s -= 2 * PALET_X; const t = s / PALET_R + Math.PI / 2; x = -PALET_X + Math.cos(t) * r; y = Math.sin(t) * r; aci = t + Math.PI / 2; }
      q.setFromAxisAngle(eksenZ, aci);
      yer.set(x, y + PALET_R, yon * PALET_Z);
      pabuclar.setMatrixAt(say++, m4.compose(yer, q, birim));
    }
  });
  makine.add(pabuclar);
  const makaralar = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16).rotateX(Math.PI / 2), M.celik, 12);
  say = 0;
  [-1, 1].forEach((yon) => {
    for (let i = 0; i < 6; i++) makaralar.setMatrixAt(say++, m4.makeTranslation(-1.3 + i * 0.52, 0.2, yon * (PALET_Z + PALET_G / 2)));
  });
  makine.add(makaralar);
  kutu(1.5, 0.3, 1.7, M.koyu, 0, 0.78, 0, makine);   // alt şasi
  const tabla = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.12, 40), M.koyu);
  tabla.position.y = 0.98;
  makine.add(tabla);

  // ---- Üst yapı (döner) ----
  const ust = new THREE.Group();
  ust.position.y = 1.04;
  makine.add(ust);
  kutu(3.3, 0.22, 2.6, M.koyu, -0.3, 0.11, 0, ust);                       // döner şasi
  const agirlik = new THREE.Shape();                                     // karşı ağırlık (yandan profil)
  agirlik.moveTo(-1.45, 0.05);
  agirlik.lineTo(-2.0, 0.05);
  agirlik.quadraticCurveTo(-2.32, 0.05, -2.32, 0.4);
  agirlik.lineTo(-2.32, 0.62);
  agirlik.quadraticCurveTo(-2.32, 0.98, -1.95, 0.98);
  agirlik.lineTo(-1.45, 0.98);
  agirlik.lineTo(-1.45, 0.05);
  ekstrude(agirlik, 2.5, M.siyah, -1.25, ust);
  kutu(1.5, 0.74, 1.85, M.turuncu, -0.75, 0.59, -0.33, ust);           // motor kaputu
  kutu(1.35, 0.05, 1.7, M.koyu, -0.75, 0.985, -0.33, ust);             // kaput üstü
  for (let i = 0; i < 7; i++) kutu(0.06, 0.42, 0.02, M.siyah, -1.33 + i * 0.13, 0.62, -1.265, ust);   // havalandırma
  const egzoz = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.46, 16), M.siyah);
  egzoz.position.set(-0.55, 1.2, -0.85);
  ust.add(egzoz);
  kutu(1.3, 0.03, 0.03, M.siyah, -0.75, 1.21, -1.2, ust);             // tırabzan
  [-1.35, -0.75, -0.15].forEach((x) => kutu(0.03, 0.22, 0.03, M.siyah, x, 1.1, -1.2, ust));
  kutu(1.2, 0.68, 0.85, M.turuncu, 0.62, 0.56, -0.83, ust);             // sağ ön dolap
  kutu(1.15, 1.7, 0.86, M.siyah, 0.62, 1.07, 0.83, ust);                // kabin
  kutu(0.02, 1.0, 0.7, M.cam, 1.205, 1.3, 0.83, ust);                   // ön cam
  kutu(0.95, 0.9, 0.02, M.cam, 0.6, 1.33, 1.265, ust);                  // sol cam
  kutu(0.95, 0.9, 0.02, M.cam, 0.6, 1.33, 0.395, ust);                  // sağ cam
  kutu(1.2, 0.06, 0.92, M.siyah, 0.62, 1.95, 0.83, ust);                // kabin tavanı
  kutu(0.55, 0.55, 0.55, M.koyu, 1.02, 0.47, -0.03, ust);               // bom ayağı
  kutu(0.25, 0.2, 0.95, M.koyu, 1.55, 0.3, -0.03, ust);                 // bom silindiri bağlantısı
  const motorIsareti = nokta(ust, -0.75, 0.75, -1.28);

  // ---- Bom ----
  const BOM_UC = V2(3.62, 0);
  const bom = new THREE.Group();
  bom.position.set(1.05, 0.75, -0.03);
  ust.add(bom);
  const bomSekil = new THREE.Shape();
  bomSekil.moveTo(-0.28, 0);
  bomSekil.quadraticCurveTo(-0.28, 0.22, -0.05, 0.24);
  bomSekil.lineTo(0.45, 0.38);
  bomSekil.lineTo(1.6, 0.8);
  bomSekil.lineTo(3.45, 0.22);
  bomSekil.quadraticCurveTo(3.85, 0.1, 3.82, -0.06);
  bomSekil.quadraticCurveTo(3.78, -0.24, 3.52, -0.2);
  bomSekil.lineTo(1.62, 0.42);
  bomSekil.lineTo(0.6, 0);
  bomSekil.lineTo(0, -0.22);
  bomSekil.quadraticCurveTo(-0.28, -0.22, -0.28, 0);
  ekstrude(bomSekil, 0.46, M.turuncu, -0.23, bom);
  pimSilindiri(0.17, 0.58, M.celik, 0, 0, 0, bom);
  pimSilindiri(0.14, 0.52, M.celik, BOM_UC.x, BOM_UC.y, 0, bom);
  kutu(0.22, 0.42, 0.2, M.turuncu, 1.0, 0.8, 0, bom);                   // kol silindiri ayağı
  kutu(0.2, 0.22, 0.86, M.koyu, 1.35, 0.25, 0, bom);                    // bom silindiri kulağı
  const pimIsareti = nokta(bom, BOM_UC.x, BOM_UC.y, -0.28);

  // ---- Kol ----
  const KOL_UC = V2(2.02, 0);
  const kol = new THREE.Group();
  kol.position.set(BOM_UC.x, BOM_UC.y, 0);
  bom.add(kol);
  const kolSekil = new THREE.Shape();
  kolSekil.moveTo(-0.62, 0.2);
  kolSekil.quadraticCurveTo(-0.62, 0.38, -0.42, 0.38);
  kolSekil.lineTo(0.55, 0.2);
  kolSekil.lineTo(2.02, 0.08);
  kolSekil.quadraticCurveTo(2.2, 0, 2.02, -0.09);
  kolSekil.lineTo(0.45, -0.2);
  kolSekil.lineTo(-0.12, -0.17);
  kolSekil.quadraticCurveTo(-0.62, -0.05, -0.62, 0.2);
  ekstrude(kolSekil, 0.36, M.turuncu, -0.18, kol);
  pimSilindiri(0.1, 0.46, M.celik, KOL_UC.x, KOL_UC.y, 0, kol);

  // ---- Kova (kolun ucunda; ağzı makineye bakar) ----
  const kovaMafsal = new THREE.Group();
  kovaMafsal.position.set(KOL_UC.x, KOL_UC.y, 0);
  kol.add(kovaMafsal);
  const kovaCevir = new THREE.Group();
  kovaCevir.rotation.y = Math.PI;
  kovaMafsal.add(kovaCevir);
  const kovaParca = kovaYap();
  kovaCevir.add(kovaParca.grup);

  function disNormal(noktalar, i) {
    const a = noktalar[Math.max(0, i - 1)], b = noktalar[Math.min(noktalar.length - 1, i + 1)];
    const tx = b.x - a.x, ty = b.y - a.y, l = Math.hypot(tx, ty) || 1;
    return V2(-ty / l, tx / l);
  }
  // 2B bir eğri boyunca dikdörtgen kesitli levha üretir (normal yönü eğrinin dış tarafı)
  function supur(noktalar, z0, z1, ofset, kalinlik, gruplu) {
    const konum = [], indeks = [];
    const raylar = { ic0: [], dis0: [], ic1: [], dis1: [] };
    noktalar.forEach((p, i) => {
      const n = disNormal(noktalar, i);
      const a = ofset, b = ofset + kalinlik;
      raylar.ic0.push([p.x + n.x * a, p.y + n.y * a, z0]);
      raylar.dis0.push([p.x + n.x * b, p.y + n.y * b, z0]);
      raylar.ic1.push([p.x + n.x * a, p.y + n.y * a, z1]);
      raylar.dis1.push([p.x + n.x * b, p.y + n.y * b, z1]);
    });
    const geo = new THREE.BufferGeometry();
    function serit(A, Bray, grup) {
      const bas = konum.length / 3, ilkIndeks = indeks.length;
      for (let i = 0; i < A.length; i++) konum.push(...A[i], ...Bray[i]);
      for (let i = 0; i < A.length - 1; i++) {
        const a = bas + i * 2, b = a + 1, c = a + 2, d = a + 3;
        indeks.push(a, b, c, b, d, c);
      }
      if (gruplu) geo.addGroup(ilkIndeks, indeks.length - ilkIndeks, grup);
    }
    serit(raylar.dis0, raylar.dis1, 0);
    serit(raylar.ic0, raylar.ic1, 1);
    serit(raylar.ic0, raylar.dis0, 0);
    serit(raylar.ic1, raylar.dis1, 0);
    geo.setAttribute('position', new THREE.Float32BufferAttribute(konum, 3));
    geo.setIndex(indeks);
    geo.computeVertexNormals();
    return geo;
  }

  function kovaYap() {
    const OLCEK = 0.62;
    const ARKA_PIM = V2(0, 1.15), ON_PIM = V2(0.38, 1.15), KOVA_G = 1.12, yariG = KOVA_G / 2;
    const grup = new THREE.Group();
    grup.scale.setScalar(OLCEK);
    grup.position.set(-ARKA_PIM.x * OLCEK, -ARKA_PIM.y * OLCEK, 0);
    const yol = new THREE.Path();
    yol.moveTo(1.02, -0.38);
    yol.quadraticCurveTo(0.62, -0.66, 0.05, -0.6);
    yol.bezierCurveTo(-0.36, -0.56, -0.52, -0.05, -0.47, 0.42);
    yol.quadraticCurveTo(-0.44, 0.88, -0.22, 0.98);
    yol.lineTo(0.6, 0.98);
    const kabuk = yol.getSpacedPoints(80);
    grup.add(new THREE.Mesh(supur(kabuk, -yariG + 0.03, yariG - 0.03, 0, 0.03, true), [M.kova, M.kovaIc]));
    const yanGeo = new THREE.ExtrudeGeometry(new THREE.Shape(kabuk), { depth: 0.035, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1, curveSegments: 8 });
    const yanSag = new THREE.Mesh(yanGeo, M.kova); yanSag.position.z = yariG - 0.035; grup.add(yanSag);
    const yanSol = new THREE.Mesh(yanGeo, M.kova); yanSol.position.z = -yariG; grup.add(yanSol);
    const taban = kabuk.slice(4, 36);
    [-0.36, -0.12, 0.12, 0.36].forEach((zc) => grup.add(new THREE.Mesh(supur(taban, zc - 0.075, zc + 0.075, 0.03, 0.022), M.hardox)));
    // Kesici bıçak ve tırnaklar
    const kenar = kabuk[0], geri = kabuk[3];
    const ileri = V2(kenar.x - geri.x, kenar.y - geri.y).normalize();
    const kenarAci = Math.atan2(ileri.y, ileri.x);
    const bicak = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, KOVA_G + 0.02), M.hardox);
    bicak.position.set(kenar.x - ileri.x * 0.06, kenar.y - ileri.y * 0.06 + 0.012, 0);
    bicak.rotation.z = kenarAci;
    grup.add(bicak);
    const adaptorGeo = new THREE.BoxGeometry(0.2, 0.085, 0.1);
    const tirnakGeo = new THREE.ConeGeometry(0.06, 0.26, 4);
    tirnakGeo.rotateY(Math.PI / 4);
    tirnakGeo.scale(0.62, 1, 1);
    let ortaTirnak = null;
    [-0.44, -0.22, 0, 0.22, 0.44].forEach((z) => {
      const adaptor = new THREE.Mesh(adaptorGeo, M.celik);
      adaptor.position.set(kenar.x + ileri.x * 0.05, kenar.y + ileri.y * 0.05, z);
      adaptor.rotation.z = kenarAci;
      grup.add(adaptor);
      const tirnak = new THREE.Mesh(tirnakGeo, M.celik);
      tirnak.position.set(kenar.x + ileri.x * 0.25, kenar.y + ileri.y * 0.25, z);
      tirnak.rotation.z = kenarAci - Math.PI / 2;
      grup.add(tirnak);
      if (z === 0) ortaTirnak = tirnak;
    });
    // Kulaklar, pimler, burçlar (kolun iki yanında)
    const kulak = new THREE.Shape();
    kulak.moveTo(-0.17, 0.97);
    kulak.lineTo(-0.17, 1.15);
    kulak.absarc(0, 1.15, 0.17, Math.PI, Math.PI / 2, true);
    kulak.lineTo(0.38, 1.32);
    kulak.absarc(0.38, 1.15, 0.17, Math.PI / 2, 0, true);
    kulak.lineTo(0.55, 0.97);
    kulak.lineTo(-0.17, 0.97);
    [ARKA_PIM, ON_PIM].forEach((p) => {
      const delik = new THREE.Path();
      delik.absarc(p.x, p.y, 0.058, 0, Math.PI * 2, false);
      kulak.holes.push(delik);
    });
    const kulakGeo = new THREE.ExtrudeGeometry(kulak, { depth: 0.045, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1, curveSegments: 20 });
    [0.31, -0.355].forEach((z) => { const k = new THREE.Mesh(kulakGeo, M.kova); k.position.z = z; grup.add(k); });
    [ARKA_PIM, ON_PIM].forEach((p) => {
      pimSilindiri(0.05, 0.84, M.krom, p.x, p.y, 0, grup);
      pimSilindiri(0.088, 0.05, M.celik, p.x, p.y, 0.39, grup);
      pimSilindiri(0.088, 0.05, M.celik, p.x, p.y, -0.39, grup);
    });
    return { grup, onPim: nokta(grup, ON_PIM.x, ON_PIM.y, 0), tirnakUcu: nokta(ortaTirnak, 0, 0.13, 0) };
  }

  // ---- Hidrolik silindirler: iki uç noktası arasında her karede uzayıp kısalır ----
  const silindirler = [];
  function silindirKur(ebeveyn, A, B, govdeR, milR) {
    const grup = new THREE.Group();
    ebeveyn.add(grup);
    const govde = new THREE.Mesh(new THREE.CylinderGeometry(govdeR, govdeR, 1, 24).translate(0, 0.5, 0), M.turuncu);
    const kapak = new THREE.Mesh(new THREE.CylinderGeometry(govdeR * 1.14, govdeR * 1.14, 0.05, 24), M.celik);
    const mil = new THREE.Mesh(new THREE.CylinderGeometry(milR, milR, 1, 20).translate(0, 0.5, 0), M.krom);
    const dipGoz = new THREE.Mesh(new THREE.CylinderGeometry(govdeR * 0.95, govdeR * 0.95, govdeR * 1.7, 20).rotateX(Math.PI / 2), M.celik);
    const milGoz = new THREE.Mesh(new THREE.CylinderGeometry(milR * 1.7, milR * 1.7, milR * 2.6, 20).rotateX(Math.PI / 2), M.celik);
    grup.add(govde, kapak, mil, dipGoz, milGoz);
    const s = { grup, govde, kapak, mil, milGoz, A, B, ebeveyn, govdeBoy: 0 };
    silindirler.push(s);
    return s;
  }
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), yon = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  function silindirGuncelle(s) {
    s.A.getWorldPosition(vA);
    s.B.getWorldPosition(vB);
    s.ebeveyn.worldToLocal(vA);
    s.ebeveyn.worldToLocal(vB);
    yon.subVectors(vB, vA);
    const boy = yon.length();
    if (!s.govdeBoy) s.govdeBoy = boy * 0.58;   // ilk duruşta gövde boyun %58'i
    s.grup.position.copy(vA);
    s.grup.quaternion.setFromUnitVectors(Y, yon.multiplyScalar(1 / boy));
    s.govde.scale.y = s.govdeBoy;
    s.kapak.position.y = s.govdeBoy;
    s.mil.position.y = s.govdeBoy * 0.9;
    s.mil.scale.y = Math.max(0.05, boy - s.govdeBoy * 0.9);
    s.milGoz.position.y = boy;
  }
  silindirKur(ust, nokta(ust, 1.55, 0.35, 0.33), nokta(bom, 1.35, 0.2, 0.36), 0.085, 0.05);
  const sagBomSilindiri = silindirKur(ust, nokta(ust, 1.55, 0.35, -0.39), nokta(bom, 1.35, 0.2, -0.36), 0.085, 0.05);
  silindirKur(bom, nokta(bom, 1.0, 1.0, 0), nokta(kol, -0.48, 0.3, 0), 0.08, 0.048);
  silindirKur(kol, nokta(kol, 0.3, 0.26, 0), kovaParca.onPim, 0.065, 0.04);
  const silindirIsareti = nokta(sagBomSilindiri.grup, 0.1, 0.45, 0);

  // ---- Zemin gölgesi ve kehribar parıltı ----
  function radyalDoku(ic, dis) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, ic); g.addColorStop(1, dis);
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const golge = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.6), new THREE.MeshBasicMaterial({ map: radyalDoku('rgba(0,0,0,0.8)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false }));
  golge.rotation.x = -Math.PI / 2; golge.position.set(1.25, 0.004, 0); makine.add(golge);
  const parilti = new THREE.Mesh(new THREE.PlaneGeometry(11, 6.5), new THREE.MeshBasicMaterial({ map: radyalDoku('rgba(245,165,36,0.5)', 'rgba(245,165,36,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  parilti.rotation.x = -Math.PI / 2; parilti.position.set(1.25, 0.002, 0); makine.add(parilti);

  // ---- Kazı döngüsü: bom, kol ve kova birlikte çalışır ----
  function pozla(t) {
    const w = 0.55;
    bom.rotation.z = 0.32 + 0.08 * Math.sin(w * t);
    kol.rotation.z = -2.05 + 0.18 * Math.sin(w * t + 1.3);
    kovaMafsal.rotation.z = 2.53 + 0.3 * Math.sin(w * t + 2.4);
    ust.rotation.y = 0.1 * Math.sin(0.3 * t);
  }

  // ---- Etiket işaretleri (3B noktayı ekrana yansıtır) ----
  const isaretler = [
    { nesne: silindirIsareti, el: sahneKutu.querySelector('[data-isaret="silindir"]') },
    { nesne: motorIsareti, el: sahneKutu.querySelector('[data-isaret="motor"]') },
    { nesne: kovaParca.tirnakUcu, el: sahneKutu.querySelector('[data-isaret="kova"]') },
    { nesne: pimIsareti, el: sahneKutu.querySelector('[data-isaret="pim"]') }
  ].filter((x) => x.el);
  const yansit = new THREE.Vector3();
  let gen = 1, yuk = 1;
  function etiketleriGuncelle() {
    isaretler.forEach(({ nesne, el }) => {
      nesne.getWorldPosition(yansit).project(kamera);
      const x = (yansit.x + 1) / 2 * gen;
      const y = (1 - yansit.y) / 2 * yuk;
      // Kadraj dışına düşen noktanın etiketi gizlenir (kenardan taşmasın)
      const icinde = yansit.z < 1 && x > 16 && x < gen - 16 && y > 16 && y < yuk - 16;
      const sol = x > gen * 0.6;
      el.classList.toggle('isaret--gizli', !icinde);
      el.classList.toggle('isaret--sol', sol);
      // Sağ yarıdaki etiketin yazısı noktanın soluna düşer; kutu kendi genişliği kadar sola kaydırılır
      el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)' + (sol ? ' translateX(-100%)' : '');
    });
  }

  // ---- Boyut ve kamera kadrajı: makinenin tamamı her en-boy oranında sığar ----
  const YARI_EN = 4.1, YARI_BOY = 2.05;
  function boyutla() {
    gen = Math.max(1, sahneKutu.clientWidth);
    yuk = Math.max(1, sahneKutu.clientHeight);
    renderer.setSize(gen, yuk, false);
    kamera.aspect = gen / yuk;
    const tanY = Math.tan(THREE.MathUtils.degToRad(kamera.fov / 2));
    const uzaklik = Math.max(YARI_BOY / tanY, YARI_EN / (tanY * kamera.aspect)) * 1.06;
    kamera.position.set(hedef.x + uzaklik * 0.1, hedef.y + uzaklik * 0.13, hedef.z + uzaklik);
    kamera.lookAt(hedef);
    kamera.updateProjectionMatrix();
  }

  // ---- Etkileşim: fare paralaksı, sürükleyerek döndürme ve atalet ----
  const TABAN_DONUS = Math.PI + 0.42;
  let imlecX = 0, imlecY = 0, ekDonus = 0, atalet = 0, surukle = null;
  const kahraman = document.querySelector('.kahraman') || sahneKutu;
  kahraman.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = sahneKutu.getBoundingClientRect();
    imlecX = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2 + 200)));
    imlecY = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2 + 200)));
    uyandir();
  });
  kahraman.addEventListener('pointerleave', () => { imlecX = 0; imlecY = 0; uyandir(); });
  tuval.addEventListener('pointerdown', (e) => {
    surukle = { x: e.clientX, t: performance.now(), hiz: 0 };
    atalet = 0;
    try { tuval.setPointerCapture(e.pointerId); } catch (hata) { /* yok say */ }
    uyandir();
  });
  tuval.addEventListener('pointermove', (e) => {
    if (!surukle) return;
    const simdi = performance.now();
    const fark = (e.clientX - surukle.x) * 0.009;
    ekDonus += fark;
    surukle.hiz = fark / Math.max(0.008, (simdi - surukle.t) / 1000);
    surukle.x = e.clientX; surukle.t = simdi;
    uyandir();
  });
  function surukleBitti() { if (surukle) { atalet = Math.max(-6, Math.min(6, surukle.hiz)); surukle = null; uyandir(); } }
  tuval.addEventListener('pointerup', surukleBitti);
  tuval.addEventListener('pointercancel', () => { surukle = null; });

  // ---- Döngü: yalnızca sahne görünürken ve sekme açıkken çizer ----
  const saat = new THREE.Clock();
  let zaman = 0, gorunur = true, sekmeAcik = !document.hidden, calisiyor = false, ilkKare = true;
  let olcumToplam = 0, olcumKare = 0;

  function kare() {
    const dt = Math.min(saat.getDelta(), 0.05);
    if (!azHareket) zaman += dt;
    pozla(zaman);

    if (!surukle && atalet) {
      ekDonus += atalet * dt;
      atalet *= Math.pow(0.03, dt);
      if (Math.abs(atalet) < 0.01) atalet = 0;
    }
    const salinim = azHareket ? 0 : Math.sin(zaman * 0.4) * 0.06;
    const hedefY = TABAN_DONUS + imlecX * 0.35 + ekDonus + salinim;
    const hedefX = imlecY * 0.1;
    const yumusak = 1 - Math.pow(0.002, dt);
    duzen.rotation.y += (hedefY - duzen.rotation.y) * yumusak;
    duzen.rotation.x += (hedefX - duzen.rotation.x) * yumusak;

    duzen.updateMatrixWorld(true);
    silindirler.forEach(silindirGuncelle);
    renderer.render(sahne, kamera);
    etiketleriGuncelle();

    if (ilkKare) { ilkKare = false; sahneKutu.dataset.sahne = 'hazir'; }

    // Yavaş cihazda çözünürlüğü kademeli düşürerek akıcılığı korur
    if (!azHareket) {
      olcumToplam += dt; olcumKare += 1;
      if (olcumKare >= 90) {
        const ortalama = olcumToplam / olcumKare;
        if (ortalama > 1 / 45 && pikselOrani > 1) {
          pikselOrani = Math.max(1, pikselOrani - 0.25);
          renderer.setPixelRatio(pikselOrani);
          boyutla();
        }
        olcumToplam = 0; olcumKare = 0;
      }
    }

    // Hareket azaltıldığında görüntü durulunca döngüyü durdur
    if (azHareket && !surukle && !atalet && Math.abs(hedefY - duzen.rotation.y) < 1e-4 && Math.abs(hedefX - duzen.rotation.x) < 1e-4) {
      durdur();
    }
  }

  function baslat() {
    if (calisiyor || !gorunur || !sekmeAcik) return;
    calisiyor = true;
    saat.getDelta();
    renderer.setAnimationLoop(kare);
  }
  function durdur() {
    if (!calisiyor) return;
    calisiyor = false;
    renderer.setAnimationLoop(null);
  }
  function uyandir() { baslat(); }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((girdiler) => {
      gorunur = girdiler[girdiler.length - 1].isIntersecting;
      if (gorunur) baslat(); else durdur();
    }, { rootMargin: '120px' }).observe(sahneKutu);
  }
  document.addEventListener('visibilitychange', () => {
    sekmeAcik = !document.hidden;
    if (sekmeAcik) baslat(); else durdur();
  });
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { boyutla(); uyandir(); }).observe(sahneKutu);
  } else {
    window.addEventListener('resize', () => { boyutla(); uyandir(); });
  }

  tuval.addEventListener('webglcontextlost', (e) => { e.preventDefault(); durdur(); yedegeGec('WebGL bağlamı kayboldu'); });

  duzen.rotation.y = TABAN_DONUS;
  boyutla();
  baslat();
}
})();
