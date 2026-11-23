/* Process’Amiante — v2 maquette 3D du confinement (démo, non publié)
   Three.js r159 + GSAP ScrollTrigger. Le cube de confinement est l’objet-héros. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.innerWidth < 820;
  var loader = document.getElementById("loader");
  var progressBar = document.getElementById("progress-bar");

  (function uiChrome() {
    var toggle = document.querySelector(".nav__toggle");
    var nav = document.getElementById("primary-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = document.body.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      nav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          document.body.classList.remove("nav-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
    var form = document.getElementById("demo-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var msg = document.getElementById("form-msg");
        if (msg) {
          msg.textContent =
            "Modèle de démonstration : aucune demande n’a été envoyée. Le formulaire sera actif sur le site en service.";
        }
      });
    }
  })();

  function hasWebGL() {
    try {
      var c = document.createElement("canvas");
      return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
    } catch (e) {
      return false;
    }
  }

  if (typeof THREE === "undefined" || typeof gsap === "undefined" || !hasWebGL()) {
    var fb = document.getElementById("fallback");
    if (fb) fb.hidden = false;
    if (loader) loader.classList.add("is-hidden");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var GOLD = 0xf2c230;
  var CYAN = 0x7ee7f0;
  var OCEAN = 0x0e4d5c;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smoothstep(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function range(t, a, b) { return smoothstep((t - a) / Math.max(0.0001, b - a)); }

  function softDot(size) {
    var c = document.createElement("canvas");
    c.width = c.height = size;
    var ctx = c.getContext("2d");
    var g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawMark(ctx, x, y, s, variant) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s / 100, s / 100);
    roundedRect(ctx, 0, 0, 100, 100, 16);
    ctx.clip();
    ctx.fillStyle = variant === "teal" ? "#0E4D5C" : "#FFFFFF";
    ctx.fillRect(0, 0, 100, 100);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 76, 100, 24);
    ctx.clip();
    ctx.translate(50, 88);
    ctx.rotate(-Math.PI / 4);
    for (var i = -90; i < 90; i += 7) {
      ctx.fillStyle = Math.floor((i + 90) / 7) % 2 === 0 ? "#F2C230" : "#1F2D34";
      ctx.fillRect(i, -50, 7, 100);
    }
    ctx.restore();
    ctx.strokeStyle = variant === "teal" ? "#FFFFFF" : "#0E4D5C";
    ctx.lineWidth = 5.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(22, 72); ctx.lineTo(18, 72); ctx.lineTo(18, 20);
    ctx.quadraticCurveTo(18, 16, 22, 16); ctx.lineTo(78, 16);
    ctx.quadraticCurveTo(82, 16, 82, 20); ctx.lineTo(82, 72); ctx.lineTo(78, 72);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(50, 16); ctx.lineTo(50, 72); ctx.stroke();
    ctx.lineWidth = 2.4; ctx.globalAlpha = 0.9;
    [[32, 28, 58], [40, 28, 54], [60, 28, 58], [68, 28, 54]].forEach(function (l) {
      ctx.beginPath(); ctx.moveTo(l[0], l[1]); ctx.lineTo(l[0], l[2]); ctx.stroke();
    });
    ctx.restore();
  }

  function makePolyane() {
    var c = document.createElement("canvas");
    c.width = c.height = 512;
    var ctx = c.getContext("2d");
    var g = ctx.createLinearGradient(0, 0, 80, 512);
    g.addColorStop(0, "#d7e4e8");
    g.addColorStop(0.5, "#c5d5da");
    g.addColorStop(1, "#e4eef0");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    ctx.globalAlpha = 0.18;
    for (var i = 0; i < 18; i++) {
      ctx.strokeStyle = i % 2 ? "#8aa3aa" : "#f3f7f8";
      ctx.lineWidth = 6 + Math.random() * 18;
      ctx.beginPath();
      var x = Math.random() * 512;
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + 40, 160, x - 50, 320, x + 20, 512);
      ctx.stroke();
    }
    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1.5, 1.2);
    return tex;
  }

  function makeHazard() {
    var c = document.createElement("canvas");
    c.width = 256; c.height = 64;
    var ctx = c.getContext("2d");
    ctx.translate(0, 32);
    ctx.rotate(-Math.PI / 4);
    for (var i = -80; i < 400; i += 22) {
      ctx.fillStyle = Math.floor((i + 80) / 22) % 2 === 0 ? "#F2C230" : "#1A1D22";
      ctx.fillRect(i, -80, 22, 160);
    }
    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.set(8, 1);
    return tex;
  }

  function makeSign(title, sub) {
    var c = document.createElement("canvas");
    c.width = 512; c.height = 256;
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#F2C230";
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = "#1A1D22";
    ctx.fillRect(10, 10, 492, 236);
    ctx.fillStyle = "#F2C230";
    ctx.fillRect(10, 10, 492, 52);
    ctx.fillStyle = "#1A1D22";
    ctx.font = "700 36px Oswald, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(title, 256, 48);
    ctx.fillStyle = "#F3F2EE";
    ctx.font = "600 42px Oswald, sans-serif";
    ctx.fillText(sub, 256, 150);
    ctx.font = "500 22px Oswald, sans-serif";
    ctx.fillStyle = "#F2C230";
    ctx.fillText("ACCÈS RÉSERVÉ", 256, 200);
    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /* ---------- Footer logo scatter (2D) ---------- */
  function attachFooterLogo() {
    var wrap = document.getElementById("footer-logo");
    var canvas = document.getElementById("logo-particles");
    if (!wrap || !canvas) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var size = 480;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var off = document.createElement("canvas");
    off.width = off.height = size;
    var octx = off.getContext("2d");
    drawMark(octx, 90, 90, 300, "teal");
    var img = octx.getImageData(0, 0, size, size).data;
    var particles = [];
    var step = 4;
    for (var y = 0; y < size; y += step) {
      for (var x = 0; x < size; x += step) {
        var i = (y * size + x) * 4;
        if (img[i + 3] < 20) continue;
        particles.push({ x: x, y: y, ox: x, oy: y, vx: 0, vy: 0, r: img[i], g: img[i + 1], b: img[i + 2], a: img[i + 3] / 255 });
      }
    }
    var hover = false, cx = size / 2, cy = size / 2;
    wrap.addEventListener("pointerenter", function () { hover = true; });
    wrap.addEventListener("pointerleave", function () { hover = false; });
    wrap.addEventListener("pointermove", function (e) {
      var rec = wrap.getBoundingClientRect();
      cx = ((e.clientX - rec.left) / rec.width) * size;
      cy = ((e.clientY - rec.top) / rec.height) * size;
    });
    (function frame() {
      ctx.clearRect(0, 0, size, size);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (hover) {
          var dx = p.x - cx, dy = p.y - cy;
          var dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
          var force = clamp(140 / dist, 0, 8);
          p.vx += (dx / dist) * force * 0.35;
          p.vy += (dy / dist) * force * 0.35;
        }
        p.vx += (p.ox - p.x) * 0.06;
        p.vy += (p.oy - p.y) * 0.06;
        p.vx *= 0.78; p.vy *= 0.78;
        p.x += p.vx; p.y += p.vy;
        ctx.fillStyle = "rgba(" + p.r + "," + p.g + "," + p.b + "," + p.a + ")";
        ctx.fillRect(p.x, p.y, step, step);
      }
      requestAnimationFrame(frame);
    })();
  }

  /* ---------- 3D ---------- */
  var mount = document.getElementById("webgl");
  var renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.4 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x070809, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  mount.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070809, 0.028);

  var camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.08, 80);
  camera.position.set(5.6, 2.6, 6.8);

  scene.add(new THREE.HemisphereLight(0xc5d8de, 0x0a0d10, 0.75));
  var key = new THREE.DirectionalLight(0xfff4dc, 1.05);
  key.position.set(6, 8, 5);
  scene.add(key);
  var fill = new THREE.DirectionalLight(0x7ee7f0, 0.4);
  fill.position.set(-6, 3, -3);
  scene.add(fill);
  var rim = new THREE.PointLight(0xf2c230, 1.2, 22);
  rim.position.set(-3, 4, 4);
  scene.add(rim);
  var innerLight = new THREE.PointLight(0x9fd7de, 0.55, 8);
  innerLight.position.set(0, 1.3, 0);
  scene.add(innerLight);

  /* Ground + zone ring */
  var ground = new THREE.Mesh(
    new THREE.CircleGeometry(9, 72),
    new THREE.MeshStandardMaterial({ color: 0x0c1012, metalness: 0.4, roughness: 0.7 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  scene.add(ground);
  var zone = new THREE.Mesh(
    new THREE.TorusGeometry(3.6, 0.025, 8, 80),
    new THREE.MeshStandardMaterial({ color: GOLD, emissive: GOLD, emissiveIntensity: 0.25, metalness: 0.3, roughness: 0.45 })
  );
  zone.rotation.x = -Math.PI / 2;
  zone.position.y = 0.01;
  scene.add(zone);

  var polyaneMap = makePolyane();
  var hazardMap = makeHazard();
  var wallMat = new THREE.MeshStandardMaterial({
    map: polyaneMap, color: 0xffffff, roughness: 0.32, metalness: 0.04,
    transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false
  });
  var frameMat = new THREE.MeshStandardMaterial({ color: 0x3a4146, metalness: 0.55, roughness: 0.4 });
  var tapeMat = new THREE.MeshStandardMaterial({ map: hazardMap, roughness: 0.55, metalness: 0.1 });
  var metalDark = new THREE.MeshStandardMaterial({ color: 0x1a2226, metalness: 0.7, roughness: 0.35 });
  var goldMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.7, roughness: 0.3, emissive: GOLD, emissiveIntensity: 0.15 });

  var W = 3.2, H = 2.35, D = 2.7;
  var cube = new THREE.Group();
  cube.position.y = 0;
  scene.add(cube);
  var parts = [];

  function addPart(mesh, kind, dir, amt) {
    mesh.userData.kind = kind;
    mesh.userData.rest = mesh.position.clone();
    mesh.userData.dir = dir ? dir.clone().normalize() : new THREE.Vector3();
    mesh.userData.amt = amt || 0;
    mesh.userData.baseOpacity = (mesh.material && mesh.material.opacity !== undefined) ? mesh.material.opacity : 1;
    parts.push(mesh);
    return mesh;
  }

  function post(x, z) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(0.07, H, 0.07), frameMat);
    m.position.set(x, H / 2, z);
    cube.add(m);
    addPart(m, "frame", new THREE.Vector3(x, 0.2, z), 0.35);
  }
  function beam(w, h, d, x, y, z, dir, amt) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), frameMat);
    m.position.set(x, y, z);
    cube.add(m);
    addPart(m, "frame", dir || new THREE.Vector3(0, 1, 0), amt || 0.25);
  }

  post(W / 2, D / 2); post(W / 2, -D / 2); post(-W / 2, D / 2); post(-W / 2, -D / 2);
  post(0, D / 2); post(0, -D / 2); post(W / 2, 0); post(-W / 2, 0);
  beam(W, 0.07, 0.07, 0, H, D / 2, new THREE.Vector3(0, 1, 1), 0.4);
  beam(W, 0.07, 0.07, 0, H, -D / 2, new THREE.Vector3(0, 1, -1), 0.4);
  beam(0.07, 0.07, D, W / 2, H, 0, new THREE.Vector3(1, 1, 0), 0.4);
  beam(0.07, 0.07, D, -W / 2, H, 0, new THREE.Vector3(-1, 1, 0), 0.4);
  beam(W, 0.07, 0.07, 0, 0.035, D / 2, new THREE.Vector3(0, -0.2, 1), 0.25);
  beam(W, 0.07, 0.07, 0, 0.035, -D / 2, new THREE.Vector3(0, -0.2, -1), 0.25);
  beam(0.07, 0.07, D, W / 2, 0.035, 0, new THREE.Vector3(1, -0.2, 0), 0.25);
  beam(0.07, 0.07, D, -W / 2, 0.035, 0, new THREE.Vector3(-1, -0.2, 0), 0.25);

  function wallPanel(w, h, d, x, y, z, dir, amt) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat.clone());
    m.position.set(x, y, z);
    m.renderOrder = 1;
    cube.add(m);
    addPart(m, "wall", dir, amt);
    return m;
  }

  /* Front +Z has waste opening; back -Z solid; +X has duct hole (two panels); -X has personnel opening */
  wallPanel(W - 0.08, H - 0.08, 0.03, 0, H / 2, -D / 2, new THREE.Vector3(0, 0, -1), 1.15);
  /* +Z split around door 0.8 x 1.7 */
  var doorW = 0.82, doorH = 1.7;
  wallPanel(W - 0.08, H - doorH - 0.1, 0.03, 0, doorH + (H - doorH) / 2, D / 2, new THREE.Vector3(0, 0.4, 1), 1.15);
  wallPanel((W - doorW) / 2 - 0.06, doorH - 0.08, 0.03, -(doorW + (W - doorW) / 2) / 2, doorH / 2, D / 2, new THREE.Vector3(-1, 0, 1), 1.1);
  wallPanel((W - doorW) / 2 - 0.06, doorH - 0.08, 0.03, (doorW + (W - doorW) / 2) / 2, doorH / 2, D / 2, new THREE.Vector3(1, 0, 1), 1.1);
  /* -X split around personnel door 0.9 x 1.9 */
  var pW = 0.9, pH = 1.9;
  wallPanel(0.03, H - pH - 0.08, D - 0.08, -W / 2, pH + (H - pH) / 2, 0, new THREE.Vector3(-1, 0.4, 0), 1.15);
  wallPanel(0.03, pH - 0.06, (D - pW) / 2 - 0.05, -W / 2, pH / 2, (pW + (D - pW) / 2) / 2, new THREE.Vector3(-1, 0, 1), 1.1);
  wallPanel(0.03, pH - 0.06, (D - pW) / 2 - 0.05, -W / 2, pH / 2, -(pW + (D - pW) / 2) / 2, new THREE.Vector3(-1, 0, -1), 1.1);
  /* +X split around duct 0.28 */
  wallPanel(0.03, H - 0.08, D / 2 - 0.22, W / 2, H / 2, D / 4 + 0.05, new THREE.Vector3(1, 0, 1), 1.15);
  wallPanel(0.03, H - 0.08, D / 2 - 0.22, W / 2, H / 2, -(D / 4 + 0.05), new THREE.Vector3(1, 0, -1), 1.15);
  wallPanel(0.03, 0.7, 0.4, W / 2, 0.4, 0, new THREE.Vector3(1, -0.3, 0), 0.9);
  wallPanel(0.03, 0.55, 0.4, W / 2, H - 0.35, 0, new THREE.Vector3(1, 0.4, 0), 0.9);
  /* Roof + floor */
  wallPanel(W - 0.06, 0.03, D - 0.06, 0, H, 0, new THREE.Vector3(0, 1, 0), 1.3);
  var floor = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.04, 0.03, D - 0.04),
    new THREE.MeshStandardMaterial({ color: 0x1c282c, roughness: 0.75, metalness: 0.08, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
  );
  floor.position.set(0, 0.02, 0);
  cube.add(floor);
  addPart(floor, "wall", new THREE.Vector3(0, -1, 0), 0.5);

  /* Hazard tape: perimeter only, not a slab on the floor */
  function tapeStrip(w, h, d, x, y, z, dir) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), tapeMat);
    m.position.set(x, y, z);
    cube.add(m);
    addPart(m, "tape", dir, 0.3);
  }
  tapeStrip(W + 0.18, 0.09, 0.09, 0, 0.06, D / 2 + 0.05, new THREE.Vector3(0, -0.2, 1));
  tapeStrip(W + 0.18, 0.09, 0.09, 0, 0.06, -D / 2 - 0.05, new THREE.Vector3(0, -0.2, -1));
  tapeStrip(0.09, 0.09, D + 0.18, W / 2 + 0.05, 0.06, 0, new THREE.Vector3(1, -0.2, 0));
  tapeStrip(0.09, 0.09, D + 0.18, -W / 2 - 0.05, 0.06, 0, new THREE.Vector3(-1, -0.2, 0));

  /* Signs */
  function signboard(tex, x, y, z, ry, dir) {
    var m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
    m.position.set(x, y, z);
    m.rotation.y = ry;
    cube.add(m);
    addPart(m, "sign", dir, 0.9);
  }
  signboard(makeSign("AMIANTE", "ZONE CONFINÉE"), -0.2, 1.85, D / 2 + 0.03, 0, new THREE.Vector3(0, 0.2, 1));
  signboard(makeSign("AMIANTE", "SAS PERSONNEL"), -W / 2 - 0.04, 2.05, 0, Math.PI / 2, new THREE.Vector3(-1, 0.2, 0));

  /* Sas personnel : 3 chambers along -X */
  var sasP = new THREE.Group();
  sasP.position.set(-W / 2 - 1.15, 0, 0);
  cube.add(sasP);
  addPart(sasP, "sas", new THREE.Vector3(-1, 0, 0), 1.4);
  (function buildSasP() {
    var lens = [0.7, 0.7, 0.7];
    var acc = 0;
    var sasWall = wallMat.clone();
    sasWall.opacity = 0.5;
    for (var i = 0; i < 3; i++) {
      var g = new THREE.Group();
      var len = lens[i];
      var box = new THREE.Mesh(new THREE.BoxGeometry(len - 0.04, 1.95, 0.95), sasWall.clone());
      box.material.opacity = 0.36;
      box.renderOrder = 1;
      g.add(box);
      var ed = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(len - 0.04, 1.95, 0.95)), new THREE.LineBasicMaterial({ color: 0x8eb8c0, transparent: true, opacity: 0.55 }));
      g.add(ed);
      if (i < 2) {
        var flap = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 1.7), new THREE.MeshStandardMaterial({ color: 0x9aaeb4, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
        flap.position.x = len / 2;
        g.add(flap);
      }
      g.position.set(-acc - len / 2, 1.95 / 2, 0);
      acc += len;
      sasP.add(g);
    }
    var base = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.06, 1.05), tapeMat);
    base.position.set(-1.05, 0.04, 0);
    sasP.add(base);
  })();

  /* Sas déchets : 2 chambers along +Z */
  var sasW = new THREE.Group();
  sasW.position.set(0, 0, D / 2 + 0.8);
  cube.add(sasW);
  addPart(sasW, "sas", new THREE.Vector3(0, 0, 1), 1.4);
  (function buildSasW() {
    var sasWall = wallMat.clone();
    var lens = [0.7, 0.7];
    var acc = 0;
    for (var i = 0; i < 2; i++) {
      var g = new THREE.Group();
      var len = lens[i];
      var box = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.75, len - 0.04), sasWall.clone());
      box.material.opacity = 0.36;
      box.renderOrder = 1;
      g.add(box);
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.95, 1.75, len - 0.04)), new THREE.LineBasicMaterial({ color: 0xf2c230, transparent: true, opacity: 0.4 })));
      g.position.set(0, 1.75 / 2, acc + len / 2 - 0.8);
      acc += len;
      sasW.add(g);
    }
  })();

  /* Extracteur + gaine */
  var extractor = new THREE.Group();
  extractor.position.set(W / 2 + 1.05, 0, 0);
  cube.add(extractor);
  addPart(extractor, "extractor", new THREE.Vector3(1, 0, 0), 1.5);
  (function buildEx() {
    var body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.85, 0.55), metalDark);
    body.position.y = 0.5;
    extractor.add(body);
    extractor.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.7, 0.85, 0.55)), new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.5 })));
    var top = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.4), goldMat);
    top.position.set(0, 1.0, 0);
    extractor.add(top);
    var grille = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.4), new THREE.MeshStandardMaterial({ color: 0x0e4d5c, metalness: 0.4, roughness: 0.4 }));
    grille.position.set(-0.4, 0.55, 0);
    extractor.add(grille);
    var legs = [[-0.25, -0.2], [0.25, -0.2], [-0.25, 0.2], [0.25, 0.2]];
    legs.forEach(function (l) {
      var lg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.06), metalDark);
      lg.position.set(l[0], 0.09, l[1]);
      extractor.add(lg);
    });
    var curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.35, 0.85, 0),
      new THREE.Vector3(-0.55, 1.25, 0),
      new THREE.Vector3(-0.85, 1.28, 0),
      new THREE.Vector3(-1.05, 1.25, 0)
    ]);
    var duct = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 24, 0.07, 10, false),
      new THREE.MeshStandardMaterial({ color: 0x2a3338, metalness: 0.45, roughness: 0.45 })
    );
    extractor.add(duct);
  })();

  /* Waste bags */
  var bags = new THREE.Group();
  cube.add(bags);
  for (var b = 0; b < 3; b++) {
    var bag = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.42, 0.28),
      new THREE.MeshStandardMaterial({ color: 0xc9a227, transparent: true, opacity: 0.72, roughness: 0.6, metalness: 0.05 })
    );
    bag.position.set((b - 1) * 0.28, 0.28, D / 2 - 0.35);
    bag.userData.baseZ = bag.position.z;
    bag.userData.offset = b * 0.28;
    bags.add(bag);
    addPart(bag, "bag", new THREE.Vector3(0, 0, 1), 0.8);
  }

  /* Suction + ambient particles */
  var SUCT = isMobile ? 280 : 700;
  var suctPos = new Float32Array(SUCT * 3);
  var suctCol = new Float32Array(SUCT * 3);
  var suctSeed = [];
  var goldC = new THREE.Color(GOLD);
  var cyanC = new THREE.Color(CYAN);
  var whiteC = new THREE.Color(0xf3f2ee);
  function randInCube() {
    return [
      (Math.random() - 0.5) * (W - 0.3),
      0.2 + Math.random() * (H - 0.4),
      (Math.random() - 0.5) * (D - 0.3)
    ];
  }
  for (var i = 0; i < SUCT; i++) {
    var rp = randInCube();
    suctPos[i * 3] = rp[0]; suctPos[i * 3 + 1] = rp[1]; suctPos[i * 3 + 2] = rp[2];
    var col = Math.random() > 0.7 ? goldC : Math.random() > 0.4 ? cyanC : whiteC;
    suctCol[i * 3] = col.r; suctCol[i * 3 + 1] = col.g; suctCol[i * 3 + 2] = col.b;
    suctSeed.push(Math.random());
  }
  var suctGeo = new THREE.BufferGeometry();
  suctGeo.setAttribute("position", new THREE.BufferAttribute(suctPos, 3));
  suctGeo.setAttribute("color", new THREE.BufferAttribute(suctCol, 3));
  var suctMat = new THREE.PointsMaterial({
    size: 0.045, map: softDot(64), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, vertexColors: true, opacity: 0, sizeAttenuation: true
  });
  var suction = new THREE.Points(suctGeo, suctMat);
  suction.renderOrder = 2;
  cube.add(suction);

  var AURA = isMobile ? 500 : 1100;
  var auraPos = new Float32Array(AURA * 3);
  var auraCol = new Float32Array(AURA * 3);
  for (var a = 0; a < AURA; a++) {
    var phi = Math.random() * Math.PI * 2;
    var r = 2.2 + Math.random() * 2.2;
    var y = (Math.random() - 0.15) * 3.4;
    auraPos[a * 3] = Math.cos(phi) * r;
    auraPos[a * 3 + 1] = y;
    auraPos[a * 3 + 2] = Math.sin(phi) * r;
    var ac = Math.random() > 0.6 ? goldC : Math.random() > 0.4 ? cyanC : whiteC;
    auraCol[a * 3] = ac.r; auraCol[a * 3 + 1] = ac.g; auraCol[a * 3 + 2] = ac.b;
  }
  var auraGeo = new THREE.BufferGeometry();
  auraGeo.setAttribute("position", new THREE.BufferAttribute(auraPos, 3));
  auraGeo.setAttribute("color", new THREE.BufferAttribute(auraCol, 3));
  var aura = new THREE.Points(auraGeo, new THREE.PointsMaterial({
    size: 0.04, map: softDot(64), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, vertexColors: true, opacity: 0.7, sizeAttenuation: true
  }));
  scene.add(aura);

  var inletLocal = new THREE.Vector3(W / 2 - 0.08, 1.25, 0);

  /* Camera keys remapped to sections */
  var camPos = new THREE.Vector3();
  var camLook = new THREE.Vector3();
  var camKeys = [];

  function buildCamKeys() {
    var plan = [
      { id: "hero", p: [5.6, 2.55, 6.8], l: [0, 1.1, 0] },
      { id: "ss3", p: [6.3, 2.1, 1.6], l: [0, 1.05, 0] },
      { id: "ss4", p: [6.9, 2.25, 3.6], l: [1.4, 0.95, 0] },
      { id: "formation", p: [-0.35, 1.45, 0.35], l: [1.1, 1.15, -0.2] },
      { id: "conseil", p: [0.15, 1.25, 4.6], l: [0, 1.0, 1.4] },
      { id: "restitution", p: [7.2, 6.4, 7.0], l: [0, 1.1, 0] },
      { id: "contact", p: [5.0, 3.1, 7.4], l: [0, 1.0, 0] }
    ];
    /* Mid keys for entering the sas before going inside */
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var tall = { ss3: 1, ss4: 1, formation: 1, conseil: 1, restitution: 1 };
    camKeys = [];
    plan.forEach(function (s, i) {
      var el = document.getElementById(s.id);
      var t;
      if (i === 0) t = 0;
      else if (!el) t = i / (plan.length - 1);
      else {
        var top = el.getBoundingClientRect().top + window.scrollY;
        var frac = tall[s.id] ? 0.2 : 0;
        t = clamp((top + el.offsetHeight * frac - window.innerHeight * 0.3) / max, 0, 1);
      }
      camKeys.push({ t: t, p: s.p, l: s.l, id: s.id });
    });
    for (var i = 1; i < camKeys.length; i++) {
      if (camKeys[i].t <= camKeys[i - 1].t) camKeys[i].t = Math.min(0.96, camKeys[i - 1].t + 0.05);
    }
    /* Go around the cube, then through the sas — never tunnel through walls */
    var form = camKeys.filter(function (k) { return k.id === "formation"; })[0];
    var ss4k = camKeys.filter(function (k) { return k.id === "ss4"; })[0];
    if (form && ss4k) {
      var mix = function (a, b) { return ss4k.t * (1 - a) + form.t * a; };
      camKeys.push({ t: mix(0.32), p: [2.2, 2.35, 6.8], l: [0, 1.1, 0], id: "orbit-z" });
      camKeys.push({ t: mix(0.52), p: [-5.6, 1.7, 3.2], l: [-1.0, 1.15, 0], id: "sas-approach" });
      camKeys.push({ t: mix(0.68), p: [-5.1, 1.2, 0], l: [-1.2, 1.15, 0], id: "sas-in" });
      camKeys.push({ t: mix(0.85), p: [-2.15, 1.18, 0], l: [0.4, 1.15, 0], id: "sas-mid" });
    }
    camKeys.sort(function (a, b) { return a.t - b.t; });
    var last = camKeys[camKeys.length - 1];
    camKeys.push({ t: 1, p: last.p, l: last.l, id: "end" });
  }

  function tOf(id) {
    for (var i = 0; i < camKeys.length; i++) if (camKeys[i].id === id) return camKeys[i].t;
    return 0;
  }

  function sampleKeys(t, outP, outL) {
    t = clamp(t, 0, 1);
    var i = 0;
    while (i < camKeys.length - 2 && t > camKeys[i + 1].t) i++;
    var a = camKeys[i], b = camKeys[i + 1];
    var u = smoothstep((t - a.t) / Math.max(0.0001, b.t - a.t));
    outP.set(lerp(a.p[0], b.p[0], u), lerp(a.p[1], b.p[1], u), lerp(a.p[2], b.p[2], u));
    outL.set(lerp(a.l[0], b.l[0], u), lerp(a.l[1], b.l[1], u), lerp(a.l[2], b.l[2], u));
  }

  /* Orbit on hero */
  var orbit = { x: 0.12, y: 0.35 };
  var orbitTarget = { x: 0.12, y: 0.35 };
  var dragging = false, lastX = 0, lastY = 0;
  var stage = document.getElementById("orbit-stage");
  var scrollProgress = 0;
  if (stage) {
    stage.addEventListener("pointerdown", function (e) {
      if (scrollProgress > 0.1) return;
      dragging = true; lastX = e.clientX; lastY = e.clientY;
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      orbitTarget.y += (e.clientX - lastX) * 0.005;
      orbitTarget.x = clamp(orbitTarget.x + (e.clientY - lastY) * 0.003, -0.4, 0.6);
      lastX = e.clientX; lastY = e.clientY;
    });
    window.addEventListener("pointerup", function () { dragging = false; });
  }

  function updateTheme(p) {
    var light = p > tOf("restitution") - 0.03 && p < tOf("contact") - 0.02;
    document.body.classList.toggle("theme-light", light);
    var bg = light ? 0xe8e6e1 : 0x070809;
    renderer.setClearColor(bg, 1);
    scene.fog.color.setHex(bg);
    scene.fog.density = light ? 0.016 : 0.028;
  }

  var st = ScrollTrigger.create({
    trigger: document.documentElement,
    start: "top top",
    end: "bottom bottom",
    scrub: reduced ? 0 : 0.9,
    onUpdate: function (self) {
      scrollProgress = self.progress;
      if (progressBar) progressBar.style.width = (self.progress * 100).toFixed(2) + "%";
      var cue = document.querySelector(".scroll-cue");
      if (cue) cue.style.opacity = String(Math.max(0, 1 - self.progress * 8));
    }
  });

  document.querySelectorAll("[data-reveal]").forEach(function (el) {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: "top 85%", end: "top 50%", scrub: reduced ? false : 0.7 },
      y: reduced ? 0 : 56,
      opacity: 0,
      ease: "none"
    });
  });
  document.querySelectorAll(".ghost").forEach(function (el) {
    gsap.from(el, {
      scrollTrigger: { trigger: el.parentElement, start: "top 80%", end: "top 30%", scrub: 0.8 },
      x: 80, opacity: 0, ease: "none"
    });
  });

  var tmpInlet = new THREE.Vector3();
  var cubeQuat = new THREE.Quaternion();

  function applyProgress(p, time) {
    var t3 = tOf("ss3"), t4 = tOf("ss4"), tF = tOf("formation");
    var tC = tOf("conseil"), tR = tOf("restitution"), tCo = tOf("contact");

    /* Montage: dip to skeleton then rebuild */
    var decon = range(p, t3 - 0.02, t3 + 0.05) * (1 - range(p, t3 + 0.06, t3 + 0.14));
    /* Depression strength */
    var dep = range(p, t4 - 0.02, t4 + 0.06) * (1 - range(p, tC, tR));
    /* Inside / walls more transparent */
    var inside = range(p, tF - 0.04, tF) * (1 - range(p, tC - 0.02, tC + 0.06));
    /* Exploded view then close */
    var explode = range(p, tR - 0.02, tR + 0.05) * (1 - range(p, tR + 0.12, tCo - 0.02));
    /* Waste bags travel */
    var waste = range(p, tC - 0.02, tR - 0.02);

    var wallOp = lerp(0.42, 0.08, decon);
    wallOp = lerp(wallOp, 0.18, inside);

    parts.forEach(function (m) {
      var kind = m.userData.kind;
      var rest = m.userData.rest;
      var dir = m.userData.dir;
      var amt = m.userData.amt;
      if (!rest) return;
      var ex = explode * amt;
      /* During deconstruction, walls/sas drop slightly */
      var drop = 0;
      if ((kind === "wall" || kind === "sas" || kind === "sign") && decon > 0) {
        drop = decon * (kind === "sas" ? 0.9 : 0.35);
      }
      m.position.set(rest.x + dir.x * ex, rest.y + dir.y * ex - drop, rest.z + dir.z * ex);
      if (kind === "extractor") {
        var appear = range(p, t4 - 0.08, t4);
        m.position.x = rest.x + dir.x * ex + (1 - appear) * 0.8;
        m.visible = appear > 0.02 || explode > 0.02;
        m.traverse(function (ch) {
          if (ch.material && ch.material.opacity !== undefined && !ch.material.map) {
            /* keep */
          }
        });
        m.scale.setScalar(lerp(0.15, 1, appear));
      }
      if (m.material && m.material.transparent && kind === "wall") {
        m.material.opacity = wallOp;
      }
    });

    /* Subtle inward "breath" when in depression */
    var breath = 1 - dep * 0.012;
    cube.scale.set(breath, 1, breath);

    /* Bags travel through waste lock */
    bags.children.forEach(function (bag, idx) {
      var t = clamp((waste - idx * 0.12) / 0.7, 0, 1);
      bag.position.z = bag.userData.baseZ + t * 2.3;
      bag.position.y = 0.28 + Math.sin(t * Math.PI) * 0.08;
      bag.material.opacity = 0.15 + 0.6 * (t > 0 && t < 1 ? 1 : waste * 0.5);
      bag.visible = waste > 0.02 || t > 0;
    });

    suctMat.opacity = dep * 0.85;
    suction.visible = dep > 0.02;
    aura.material.opacity = lerp(0.7, 0.18, range(p, 0.06, 0.2));

    /* Suction animation */
    if (dep > 0.02) {
      var arr = suctGeo.attributes.position.array;
      tmpInlet.copy(inletLocal);
      for (var i = 0; i < SUCT; i++) {
        var i3 = i * 3;
        var vx = tmpInlet.x - arr[i3];
        var vy = tmpInlet.y - arr[i3 + 1];
        var vz = tmpInlet.z - arr[i3 + 2];
        var dist = Math.sqrt(vx * vx + vy * vy + vz * vz) + 0.0001;
        var sp = 0.016 * dep * (0.7 + suctSeed[i]);
        arr[i3] += (vx / dist) * sp;
        arr[i3 + 1] += (vy / dist) * sp;
        arr[i3 + 2] += (vz / dist) * sp;
        if (dist < 0.12) {
          var rp = randInCube();
          arr[i3] = rp[0]; arr[i3 + 1] = rp[1]; arr[i3 + 2] = rp[2];
        }
      }
      suctGeo.attributes.position.needsUpdate = true;
    }

    sampleKeys(p, camPos, camLook);

    if (p < 0.1 && !reduced) {
      var q = new THREE.Quaternion().setFromEuler(new THREE.Euler(orbit.x, orbit.y, 0, "YXZ"));
      var off = new THREE.Vector3(0, 0, 8.6).applyQuaternion(q);
      camera.position.set(off.x, off.y + 1.3, off.z);
      camera.lookAt(0, 1.1, 0);
    } else if (!reduced) {
      camera.position.copy(camPos);
      camera.lookAt(camLook);
    } else {
      camera.position.set(5.2, 2.8, 6.2);
      camera.lookAt(0, 1.1, 0);
    }

    updateTheme(p);
    innerLight.intensity = 0.35 + dep * 0.7 + inside * 0.4;
  }

  var clock = new THREE.Clock();
  var ready = false;

  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();
    var p = st ? st.progress : 0;

    if (!dragging && p < 0.1 && !reduced) orbitTarget.y += 0.0014;
    orbit.x += (orbitTarget.x - orbit.x) * 0.08;
    orbit.y += (orbitTarget.y - orbit.y) * 0.08;

    applyProgress(p, t);

    /* Aura drift */
    var ap = auraGeo.attributes.position.array;
    for (var i = 0; i < AURA; i++) {
      ap[i * 3 + 1] += Math.sin(t * 0.25 + i) * 0.0015;
    }
    auraGeo.attributes.position.needsUpdate = true;

    zone.rotation.z = t * 0.05;
    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      if (loader) setTimeout(function () { loader.classList.add("is-hidden"); }, 200);
    }
  }

  window.addEventListener("resize", function () {
    isMobile = window.innerWidth < 820;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.4 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    buildCamKeys();
    ScrollTrigger.refresh();
  });

  attachFooterLogo();
  buildCamKeys();
  animate();
  ScrollTrigger.refresh();
  requestAnimationFrame(function () { buildCamKeys(); ScrollTrigger.refresh(); });
})();
