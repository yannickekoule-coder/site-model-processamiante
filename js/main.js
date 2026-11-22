/* Process’Amiante — modèle de démonstration scrollytelling
   Three.js + GSAP ScrollTrigger. Non publié. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.innerWidth < 820;
  var loader = document.getElementById("loader");
  var progressBar = document.getElementById("progress-bar");

  /* ---------- Nav + form (works even if CDN fails) ---------- */
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

  if (typeof THREE === "undefined" || typeof gsap === "undefined") {
    if (loader) loader.classList.add("is-hidden");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var GOLD = 0xf2c230;
  var CYAN = 0x7ee7f0;
  var OCEAN = 0x0e4d5c;
  var INK = 0x152328;

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function smoothstep(t) {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  }
  function range(t, a, b) {
    return smoothstep((t - a) / (b - a));
  }

  function softDot(size) {
    var c = document.createElement("canvas");
    c.width = c.height = size;
    var ctx = c.getContext("2d");
    var g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.5)");
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
    ctx.moveTo(22, 72);
    ctx.lineTo(18, 72);
    ctx.lineTo(18, 20);
    ctx.quadraticCurveTo(18, 16, 22, 16);
    ctx.lineTo(78, 16);
    ctx.quadraticCurveTo(82, 16, 82, 20);
    ctx.lineTo(82, 72);
    ctx.lineTo(78, 72);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(50, 16);
    ctx.lineTo(50, 72);
    ctx.stroke();
    ctx.lineWidth = 2.4;
    ctx.globalAlpha = 0.9;
    [[32, 28, 58], [40, 28, 54], [60, 28, 58], [68, 28, 54]].forEach(function (l) {
      ctx.beginPath();
      ctx.moveTo(l[0], l[1]);
      ctx.lineTo(l[0], l[2]);
      ctx.stroke();
    });
    ctx.restore();
  }

  function makePanelTexture(withLogo) {
    var c = document.createElement("canvas");
    c.width = 1024;
    c.height = 1024;
    var ctx = c.getContext("2d");
    var g = ctx.createLinearGradient(0, 0, 0, 1024);
    g.addColorStop(0, "#1b2e34");
    g.addColorStop(1, "#0c1619");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 760, 1024, 264);
    ctx.clip();
    ctx.translate(512, 892);
    ctx.rotate(-Math.PI / 4);
    for (var i = -800; i < 800; i += 64) {
      ctx.fillStyle = Math.floor((i + 800) / 64) % 2 === 0 ? "#F2C230" : "#1F2D34";
      ctx.fillRect(i, -400, 64, 800);
    }
    ctx.restore();
    if (withLogo) {
      drawMark(ctx, 362, 160, 300, "teal");
      ctx.fillStyle = "#F3F2EE";
      ctx.font = "600 54px Oswald, sans-serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "8px";
      ctx.fillText("PROCESS’AMIANTE", 512, 560);
      ctx.font = "500 28px Oswald, sans-serif";
      ctx.fillStyle = "#F2C230";
      ctx.fillText("CONSEIL  SS3  ·  SS4", 512, 610);
    }
    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  function fibonacciSphere(n, radius) {
    var pts = new Float32Array(n * 3);
    var golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = 1 - (i / Math.max(n - 1, 1)) * 2;
      var r = Math.sqrt(Math.max(0, 1 - y * y));
      var theta = golden * i;
      pts[i * 3] = Math.cos(theta) * r * radius;
      pts[i * 3 + 1] = y * radius;
      pts[i * 3 + 2] = Math.sin(theta) * r * radius;
    }
    return pts;
  }

  function boxSurfacePoints(n, w, h, d) {
    var pts = new Float32Array(n * 3);
    var areas = [h * d, h * d, w * d, w * d, w * h, w * h];
    var sum = areas.reduce(function (a, b) { return a + b; }, 0);
    for (var i = 0; i < n; i++) {
      var pick = Math.random() * sum;
      var acc = 0;
      var face = 0;
      for (var f = 0; f < 6; f++) {
        acc += areas[f];
        if (pick <= acc) { face = f; break; }
      }
      var u = Math.random() - 0.5;
      var v = Math.random() - 0.5;
      var x = 0, y = 0, z = 0;
      if (face === 0) { x = w / 2; y = v * h; z = u * d; }
      else if (face === 1) { x = -w / 2; y = v * h; z = u * d; }
      else if (face === 2) { y = h / 2; x = u * w; z = v * d; }
      else if (face === 3) { y = -h / 2; x = u * w; z = v * d; }
      else if (face === 4) { z = d / 2; x = u * w; y = v * h; }
      else { z = -d / 2; x = u * w; y = v * h; }
      pts[i * 3] = x;
      pts[i * 3 + 1] = y;
      pts[i * 3 + 2] = z;
    }
    return pts;
  }

  /* ---------- Service icon particles (2D) ---------- */
  function attachCardParticles() {
    document.querySelectorAll("[data-particles]").forEach(function (card) {
      var canvas = card.querySelector("canvas");
      if (!canvas) return;
      var ctx = canvas.getContext("2d");
      var parts = [];
      var running = false;
      var raf;

      function resize() {
        var r = card.getBoundingClientRect();
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, r.width * dpr);
        canvas.height = Math.max(1, r.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function spawn(n, x, y) {
        for (var i = 0; i < n; i++) {
          var ang = Math.random() * Math.PI * 2;
          var sp = 0.3 + Math.random() * 1.6;
          parts.push({
            x: x,
            y: y,
            vx: Math.cos(ang) * sp,
            vy: Math.sin(ang) * sp - 0.2,
            life: 1,
            decay: 0.008 + Math.random() * 0.016,
            size: 1 + Math.random() * 2.2,
            gold: Math.random() > 0.45
          });
        }
      }

      function frame() {
        var r = card.getBoundingClientRect();
        ctx.clearRect(0, 0, r.width, r.height);
        parts = parts.filter(function (p) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.01;
          p.life -= p.decay;
          if (p.life <= 0) return false;
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.gold ? "#F2C230" : "#7EE7F0";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          return true;
        });
        ctx.globalAlpha = 1;
        if (parts.length) raf = requestAnimationFrame(frame);
        else running = false;
      }

      function kick(ev) {
        var r = card.getBoundingClientRect();
        var x = ev && ev.clientX ? ev.clientX - r.left : r.width * 0.5;
        var y = ev && ev.clientY ? ev.clientY - r.top : r.height * 0.35;
        spawn(isMobile ? 18 : 28, x, y);
        if (!running) {
          running = true;
          raf = requestAnimationFrame(frame);
        }
      }

      resize();
      window.addEventListener("resize", resize);
      card.addEventListener("pointerenter", kick);
      card.addEventListener("pointermove", function (ev) {
        if (Math.random() > 0.65) spawn(2, ev.clientX - card.getBoundingClientRect().left, ev.clientY - card.getBoundingClientRect().top);
        if (!running) {
          running = true;
          raf = requestAnimationFrame(frame);
        }
      });
    });
  }

  /* ---------- Footer logo scatter ---------- */
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
        var a = img[i + 3];
        if (a < 20) continue;
        particles.push({
          x: x,
          y: y,
          ox: x,
          oy: y,
          vx: 0,
          vy: 0,
          r: img[i],
          g: img[i + 1],
          b: img[i + 2],
          a: a / 255
        });
      }
    }

    var hover = false;
    var cx = size / 2;
    var cy = size / 2;

    wrap.addEventListener("pointerenter", function () { hover = true; });
    wrap.addEventListener("pointerleave", function () { hover = false; });
    wrap.addEventListener("pointermove", function (e) {
      var rec = wrap.getBoundingClientRect();
      cx = ((e.clientX - rec.left) / rec.width) * size;
      cy = ((e.clientY - rec.top) / rec.height) * size;
    });

    function frame() {
      ctx.clearRect(0, 0, size, size);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (hover) {
          var dx = p.x - cx;
          var dy = p.y - cy;
          var dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
          var force = clamp(140 / dist, 0, 8);
          p.vx += (dx / dist) * force * 0.35;
          p.vy += (dy / dist) * force * 0.35;
        }
        p.vx += (p.ox - p.x) * 0.06;
        p.vy += (p.oy - p.y) * 0.06;
        p.vx *= 0.78;
        p.vy *= 0.78;
        p.x += p.vx;
        p.y += p.vy;
        ctx.fillStyle = "rgba(" + p.r + "," + p.g + "," + p.b + "," + p.a + ")";
        ctx.fillRect(p.x, p.y, step, step);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- 3D scene ---------- */
  var mount = document.getElementById("webgl");
  var renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x070809, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  mount.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070809, 0.032);

  var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 1.15, 6.2);

  var hemi = new THREE.HemisphereLight(0xb9d8e0, 0x0b1012, 0.7);
  scene.add(hemi);
  var key = new THREE.DirectionalLight(0xfff2cf, 1.15);
  key.position.set(4, 6, 5);
  scene.add(key);
  var fill = new THREE.DirectionalLight(0x7ee7f0, 0.45);
  fill.position.set(-5, 2, -2);
  scene.add(fill);
  var rim = new THREE.PointLight(0xf2c230, 1.4, 18);
  rim.position.set(-2, 3, 3);
  scene.add(rim);

  var root = new THREE.Group();
  scene.add(root);
  var pivot = new THREE.Group();
  root.add(pivot);

  /* Caisson */
  var CAISSON_W = 1.25, CAISSON_H = 1.08, CAISSON_D = 0.92;
  var caisson = new THREE.Group();
  var bodyGeo = new THREE.BoxGeometry(CAISSON_W, CAISSON_H, CAISSON_D);
  var frontMap = makePanelTexture(true);
  var sideMap = makePanelTexture(false);
  var sideMat = new THREE.MeshStandardMaterial({
    map: sideMap, metalness: 0.42, roughness: 0.42, color: 0xffffff
  });
  var frontMat = new THREE.MeshStandardMaterial({
    map: frontMap, metalness: 0.38, roughness: 0.4, color: 0xffffff
  });
  var topMat = new THREE.MeshStandardMaterial({ color: 0x121c20, metalness: 0.22, roughness: 0.55 });
  var materials = [sideMat, sideMat, topMat, topMat, frontMat, sideMat];
  var body = new THREE.Mesh(bodyGeo, materials);
  caisson.add(body);
  var edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(bodyGeo, 25),
    new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.55 })
  );
  caisson.add(edges);
  var lidCanvas = document.createElement("canvas");
  lidCanvas.width = lidCanvas.height = 512;
  var lctx = lidCanvas.getContext("2d");
  lctx.fillStyle = "#0c2228";
  lctx.fillRect(0, 0, 512, 512);
  lctx.strokeStyle = "#F2C230";
  lctx.lineWidth = 10;
  lctx.strokeRect(18, 18, 476, 476);
  drawMark(lctx, 156, 140, 200, "teal");
  var lidMap = new THREE.CanvasTexture(lidCanvas);
  lidMap.colorSpace = THREE.SRGBColorSpace;
  var lid = new THREE.Mesh(
    new THREE.BoxGeometry(CAISSON_W + 0.06, 0.06, CAISSON_D + 0.06),
    new THREE.MeshStandardMaterial({ map: lidMap, metalness: 0.25, roughness: 0.48, color: 0xffffff })
  );
  lid.position.y = CAISSON_H / 2 + 0.02;
  caisson.add(lid);
  var lidEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(lid.geometry),
    new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.4 })
  );
  lid.add(lidEdge);
  caisson.position.y = 0.15;
  caisson.visible = false;
  pivot.add(caisson);

  /* Morphing particle cloud: globe -> caisson */
  var COUNT = isMobile ? 2800 : 6500;
  var globePos = fibonacciSphere(COUNT, 1.65);
  var boxPos = boxSurfacePoints(COUNT, CAISSON_W, CAISSON_H, CAISSON_D);
  var currPos = new Float32Array(globePos);
  var colors = new Float32Array(COUNT * 3);
  var goldC = new THREE.Color(GOLD);
  var cyanC = new THREE.Color(CYAN);
  var whiteC = new THREE.Color(0xf3f2ee);
  var oceanC = new THREE.Color(OCEAN);
  for (var i = 0; i < COUNT; i++) {
    var r = Math.random();
    var col = r > 0.82 ? goldC : r > 0.55 ? cyanC : r > 0.25 ? whiteC : oceanC;
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }
  var cloudGeo = new THREE.BufferGeometry();
  cloudGeo.setAttribute("position", new THREE.BufferAttribute(currPos, 3));
  cloudGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  var cloudMat = new THREE.PointsMaterial({
    size: isMobile ? 0.045 : 0.038,
    map: softDot(64),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    sizeAttenuation: true,
    opacity: 0.95
  });
  var cloud = new THREE.Points(cloudGeo, cloudMat);
  pivot.add(cloud);

  /* Ambient dust */
  var DUST = isMobile ? 600 : 1400;
  var dustPos = new Float32Array(DUST * 3);
  var dustCol = new Float32Array(DUST * 3);
  for (var d = 0; d < DUST; d++) {
    dustPos[d * 3] = (Math.random() - 0.5) * 28;
    dustPos[d * 3 + 1] = Math.random() * 10 - 1;
    dustPos[d * 3 + 2] = (Math.random() - 0.5) * 28;
    var dc = Math.random() > 0.5 ? goldC : cyanC;
    dustCol[d * 3] = dc.r;
    dustCol[d * 3 + 1] = dc.g;
    dustCol[d * 3 + 2] = dc.b;
  }
  var dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute("color", new THREE.BufferAttribute(dustCol, 3));
  var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: 0.03,
    map: softDot(32),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    opacity: 0.45
  }));
  scene.add(dust);

  /* Environments */
  var chantierGroup = new THREE.Group();
  scene.add(chantierGroup);
  var grid = new THREE.GridHelper(24, 24, 0x1a7a90, 0x132026);
  grid.position.y = -0.55;
  grid.material.transparent = true;
  grid.material.opacity = 0.28;
  chantierGroup.add(grid);

  var scaffoldMat = new THREE.LineBasicMaterial({ color: 0x1a7a90, transparent: true, opacity: 0.28 });
  function addScaffold(x, z, h, w) {
    var g = new THREE.BoxGeometry(w, h, w);
    var e = new THREE.LineSegments(new THREE.EdgesGeometry(g), scaffoldMat);
    e.position.set(x, h / 2 - 0.55, z);
    chantierGroup.add(e);
  }
  addScaffold(-4.2, -2.4, 3.2, 1.3);
  addScaffold(-5.1, 1.6, 2.4, 1.1);
  addScaffold(4.6, -1.8, 2.8, 1.2);
  addScaffold(5.4, 2.2, 3.6, 1.4);
  addScaffold(-3.2, 3.5, 1.8, 1.0);
  addScaffold(3.8, -3.6, 2.1, 1.15);

  var platform = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 64),
    new THREE.MeshStandardMaterial({
      color: 0x101518, metalness: 0.6, roughness: 0.4, transparent: true, opacity: 0.7
    })
  );
  platform.rotation.x = -Math.PI / 2;
  platform.position.y = -0.54;
  chantierGroup.add(platform);
  var ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.4, 0.018, 8, 80),
    new THREE.MeshStandardMaterial({ color: CYAN, emissive: CYAN, emissiveIntensity: 0.35, metalness: 0.2, roughness: 0.4 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -0.53;
  chantierGroup.add(ring);
  chantierGroup.visible = false;

  /* Transport road */
  var transportGroup = new THREE.Group();
  scene.add(transportGroup);
  var roadCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10, -0.52, 2),
    new THREE.Vector3(-4, -0.52, 0.4),
    new THREE.Vector3(0, -0.52, 0),
    new THREE.Vector3(5, -0.52, -1.2),
    new THREE.Vector3(12, -0.52, -2.5)
  ]);
  var road = new THREE.Mesh(
    new THREE.TubeGeometry(roadCurve, 80, 0.42, 8, false),
    new THREE.MeshStandardMaterial({
      color: 0x0b1c22,
      emissive: 0x0e4d5c,
      emissiveIntensity: 0.25,
      metalness: 0.5,
      roughness: 0.35,
      transparent: true,
      opacity: 0.9
    })
  );
  transportGroup.add(road);
  var roadCore = new THREE.Mesh(
    new THREE.TubeGeometry(roadCurve, 80, 0.045, 6, false),
    new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.65 })
  );
  transportGroup.add(roadCore);

  var STREAK = isMobile ? 200 : 420;
  var streakPos = new Float32Array(STREAK * 3);
  var streakSeeds = [];
  for (var s = 0; s < STREAK; s++) {
    streakSeeds.push(Math.random());
    var pt = roadCurve.getPoint(Math.random());
    streakPos[s * 3] = pt.x;
    streakPos[s * 3 + 1] = pt.y + 0.12;
    streakPos[s * 3 + 2] = pt.z;
  }
  var streakGeo = new THREE.BufferGeometry();
  streakGeo.setAttribute("position", new THREE.BufferAttribute(streakPos, 3));
  var streaks = new THREE.Points(streakGeo, new THREE.PointsMaterial({
    size: 0.06,
    map: softDot(32),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: CYAN,
    opacity: 0.85
  }));
  transportGroup.add(streaks);
  transportGroup.visible = false;

  /* Traitement rings */
  var treatGroup = new THREE.Group();
  scene.add(treatGroup);
  for (var k = 1; k <= 6; k++) {
    var torus = new THREE.Mesh(
      new THREE.TorusGeometry(k * 1.15, 0.012, 8, 96),
      new THREE.MeshBasicMaterial({
        color: k % 2 ? GOLD : CYAN,
        transparent: true,
        opacity: 0.28 + k * 0.03
      })
    );
    torus.rotation.x = -Math.PI / 2;
    torus.position.y = -0.5;
    treatGroup.add(torus);
  }
  var pad = new THREE.Mesh(
    new THREE.CircleGeometry(2.1, 80),
    new THREE.MeshStandardMaterial({
      color: 0xe8e6e1, metalness: 0.2, roughness: 0.5, transparent: true, opacity: 0.55
    })
  );
  pad.rotation.x = -Math.PI / 2;
  pad.position.y = -0.56;
  treatGroup.add(pad);
  treatGroup.visible = false;

  /* Camera path — times are remapped to real section positions */
  var camPos = new THREE.Vector3();
  var camLook = new THREE.Vector3();
  var camKeys = [];

  function buildCamKeys() {
    var plan = [
      { id: "hero", p: [0.0, 1.20, 6.20], l: [0, 0.20, 0] },
      { id: "apropos", p: [2.6, 1.50, 4.50], l: [0, 0.16, 0] },
      { id: "chantier", p: [5.55, 1.50, 0.55], l: [0, 0.10, 0] },
      { id: "services", p: [4.20, 1.85, 2.30], l: [0, 0.12, 0] },
      { id: "transport", p: [5.35, 1.35, 0.20], l: [0, 0.12, 0] },
      { id: "traitement", p: [0.14, 10.9, 0.16], l: [0, 0.00, 0] },
      { id: "contact", p: [2.0, 2.60, 6.40], l: [0, 0.15, 0] }
    ];
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    camKeys = plan.map(function (s, i) {
      var el = document.getElementById(s.id);
      var t;
      if (i === 0) t = 0;
      else if (!el) t = i / (plan.length - 1);
      else {
        var top = el.getBoundingClientRect().top + window.scrollY;
        t = clamp((top - window.innerHeight * 0.32) / max, 0, 1);
      }
      return { t: t, p: s.p, l: s.l, id: s.id };
    });
    // ensure strictly increasing times
    for (var i = 1; i < camKeys.length; i++) {
      if (camKeys[i].t <= camKeys[i - 1].t) camKeys[i].t = Math.min(0.97, camKeys[i - 1].t + 0.04);
    }
    var last = camKeys[camKeys.length - 1];
    camKeys.push({ t: 1, p: last.p, l: last.l, id: "end" });
  }

  function tOf(id) {
    for (var i = 0; i < camKeys.length; i++) {
      if (camKeys[i].id === id) return camKeys[i].t;
    }
    return 0;
  }

  buildCamKeys();

  function sampleKeys(keys, t, outP, outL) {
    t = clamp(t, 0, 1);
    var i = 0;
    while (i < keys.length - 2 && t > keys[i + 1].t) i++;
    var a = keys[i], b = keys[i + 1];
    var u = smoothstep((t - a.t) / Math.max(0.0001, b.t - a.t));
    outP.set(lerp(a.p[0], b.p[0], u), lerp(a.p[1], b.p[1], u), lerp(a.p[2], b.p[2], u));
    outL.set(lerp(a.l[0], b.l[0], u), lerp(a.l[1], b.l[1], u), lerp(a.l[2], b.l[2], u));
  }

  /* Hero orbit */
  var orbit = { x: 0.18, y: 0.35 };
  var orbitTarget = { x: 0.18, y: 0.35 };
  var dragging = false;
  var lastX = 0, lastY = 0;
  var stage = document.getElementById("orbit-stage");
  var scrollProgress = 0;

  function onPointerDown(e) {
    if (scrollProgress > 0.12) return;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    stage.setPointerCapture && stage.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!dragging) return;
    var dx = e.clientX - lastX;
    var dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    orbitTarget.y += dx * 0.005;
    orbitTarget.x = clamp(orbitTarget.x + dy * 0.003, -0.5, 0.8);
  }
  function onPointerUp() { dragging = false; }

  if (stage) {
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }

  /* Theme + section opacity */
  var themeSections = document.querySelectorAll("[data-theme]");
  function updateTheme(p) {
    var light = p > tOf("traitement") - 0.03 && p < tOf("contact") - 0.02;
    document.body.classList.toggle("theme-light", light);
    var bg = light ? 0xe8e6e1 : 0x070809;
    var fogC = light ? 0xe8e6e1 : 0x070809;
    renderer.setClearColor(bg, 1);
    scene.fog.color.setHex(fogC);
    scene.fog.density = light ? 0.018 : 0.032;
  }

  /* Scroll master */
  var st;
  function onScrollUpdate(self) {
    scrollProgress = self.progress;
    if (progressBar) progressBar.style.width = (self.progress * 100).toFixed(2) + "%";
    var cue = document.querySelector(".scroll-cue");
    if (cue) cue.style.opacity = String(Math.max(0, 1 - self.progress * 8));
  }

  st = ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    scrub: reduced ? 0 : 0.7,
    onUpdate: onScrollUpdate
  });

  document.querySelectorAll("[data-reveal]").forEach(function (el) {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none none" },
      y: reduced ? 0 : 36,
      opacity: 0,
      duration: reduced ? 0.01 : 1.05,
      ease: "power3.out"
    });
  });

  /* Apply scene from progress */
  var tmp = new THREE.Vector3();
  function applyProgress(p, time) {
    var morph = range(p, 0.04, 0.16);
    var pos = cloudGeo.attributes.position.array;
    for (var i = 0; i < COUNT; i++) {
      var i3 = i * 3;
      pos[i3] = lerp(globePos[i3], boxPos[i3], morph);
      pos[i3 + 1] = lerp(globePos[i3 + 1], boxPos[i3 + 1], morph);
      pos[i3 + 2] = lerp(globePos[i3 + 2], boxPos[i3 + 2], morph);
    }
    cloudGeo.attributes.position.needsUpdate = true;
    cloudMat.opacity = lerp(0.95, 0.18, morph);
    cloudMat.size = lerp(isMobile ? 0.045 : 0.038, 0.022, morph);
    caisson.visible = morph > 0.55;
    caisson.traverse(function (obj) {
      if (obj.material) {
        var mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(function (m) {
          if ("opacity" in m && m !== edges.material) {
            /* keep solid */
          }
        });
      }
    });
    edges.material.opacity = 0.25 + morph * 0.4;
    body.material.forEach && body.material.forEach(function () {});
    var bodyOpacity = range(p, 0.1, 0.2);
    materials.forEach(function (m) {
      m.transparent = bodyOpacity < 0.99;
      m.opacity = bodyOpacity;
    });
    lid.material.transparent = bodyOpacity < 0.99;
    lid.material.opacity = bodyOpacity;

    var tCh = tOf("chantier"), tSv = tOf("services"), tTr = tOf("transport");
    var tTt = tOf("traitement"), tCo = tOf("contact");

    var chantierVis = range(p, tOf("apropos"), tCh) * (1 - range(p, tSv, tTr));
    chantierGroup.visible = chantierVis > 0.02;
    (function setMatOp(mat, v) {
      if (!mat) return;
      var list = Array.isArray(mat) ? mat : [mat];
      list.forEach(function (m) { m.transparent = true; m.opacity = v; });
    })(grid.material, 0.28 * chantierVis);
    platform.material.opacity = 0.7 * chantierVis;
    ring.material.opacity = 0.9 * chantierVis;
    ring.material.emissiveIntensity = 0.35 * chantierVis;

    var transVis = range(p, tSv + 0.01, tTr) * (1 - range(p, tTt - 0.03, tTt + 0.03));
    transportGroup.visible = transVis > 0.02;
    road.material.opacity = 0.9 * transVis;
    roadCore.material.opacity = 0.65 * transVis;
    streaks.material.opacity = 0.85 * transVis;

    var treatVis = range(p, tTt - 0.05, tTt + 0.01) * (1 - range(p, tCo - 0.02, tCo + 0.06));
    treatGroup.visible = treatVis > 0.02;
    treatGroup.children.forEach(function (ch, idx) {
      if (ch.material && ch.material.opacity !== undefined) {
        if (ch === pad) ch.material.opacity = 0.55 * treatVis;
        else ch.material.opacity = (0.28 + (idx + 1) * 0.03) * treatVis;
      }
    });

    /* Keep the caisson as the focus; slight yaw during transport */
    var travel = range(p, tTr - 0.02, tTt);
    caisson.position.x = 0;
    caisson.position.z = 0;
    caisson.rotation.y = 0.15 + travel * 0.7;
    cloud.position.copy(caisson.position);

    sampleKeys(camKeys, p, camPos, camLook);
    if (!reduced) {
      camera.position.copy(camPos);
      camera.lookAt(camLook);
    } else {
      camera.position.set(3.2, 2.2, 5.2);
      camera.lookAt(0, 0.2, 0);
    }

    updateTheme(p);
  }

  /* Animate */
  var clock = new THREE.Clock();
  var ready = false;

  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();
    var p = st ? st.progress : 0;

    if (!dragging && p < 0.1 && !reduced) {
      orbitTarget.y += 0.0016;
    }
    orbit.x += (orbitTarget.x - orbit.x) * 0.08;
    orbit.y += (orbitTarget.y - orbit.y) * 0.08;

    if (p < 0.14) {
      pivot.rotation.x = orbit.x;
      pivot.rotation.y = orbit.y;
    } else {
      var targetX = 0;
      var targetY = 0.2;
      pivot.rotation.x += (targetX - pivot.rotation.x) * 0.06;
      pivot.rotation.y += (targetY - pivot.rotation.y) * 0.06;
    }

    applyProgress(p, t);

    /* dust drift */
    var dp = dustGeo.attributes.position.array;
    for (var i = 0; i < DUST; i++) {
      var i3 = i * 3;
      dp[i3 + 1] += 0.003 + Math.sin(t * 0.3 + i) * 0.001;
      if (dp[i3 + 1] > 10) dp[i3 + 1] = -1;
      dp[i3] += Math.sin(t * 0.12 + i * 0.4) * 0.002;
    }
    dustGeo.attributes.position.needsUpdate = true;

    if (transportGroup.visible) {
      var sp = streakGeo.attributes.position.array;
      for (var s = 0; s < STREAK; s++) {
        streakSeeds[s] = (streakSeeds[s] + 0.0025) % 1;
        var pt = roadCurve.getPoint(streakSeeds[s]);
        sp[s * 3] = pt.x;
        sp[s * 3 + 1] = pt.y + 0.12;
        sp[s * 3 + 2] = pt.z;
      }
      streakGeo.attributes.position.needsUpdate = true;
    }

    if (treatGroup.visible && !reduced) {
      treatGroup.children.forEach(function (ch, idx) {
        if (ch !== pad) ch.rotation.z = t * (0.05 + idx * 0.012) * (idx % 2 ? 1 : -1);
      });
    }

    renderer.render(scene, camera);

    if (!ready) {
      ready = true;
      if (loader) {
        requestAnimationFrame(function () {
          setTimeout(function () { loader.classList.add("is-hidden"); }, 180);
        });
      }
    }
  }

  window.addEventListener("resize", function () {
    isMobile = window.innerWidth < 820;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    buildCamKeys();
    ScrollTrigger.refresh();
  });

  attachCardParticles();
  attachFooterLogo();
  buildCamKeys();
  animate();
  ScrollTrigger.refresh();
  requestAnimationFrame(function () { buildCamKeys(); ScrollTrigger.refresh(); });
})();
