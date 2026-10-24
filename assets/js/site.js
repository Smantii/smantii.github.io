/* smantii.github.io — small, dependency-free interactions. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  window.__siteReady = true;

  /* ---------- Theme ---------- */

  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t === "dark" || t === "light") return t;
    return prefersDark.matches ? "dark" : "light";
  }

  function emitTheme() {
    document.dispatchEvent(new CustomEvent("themechange", { detail: currentTheme() }));
  }

  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
      emitTheme();
    });
  }
  if (prefersDark.addEventListener) prefersDark.addEventListener("change", emitTheme);

  /* ---------- Mobile menu ---------- */

  var header = document.querySelector(".site-header");
  var menuBtn = document.querySelector(".menu-toggle");
  function setMenu(open) {
    header.setAttribute("data-open", open ? "true" : "false");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (header && menuBtn) {
    menuBtn.addEventListener("click", function () {
      setMenu(header.getAttribute("data-open") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
    header.querySelectorAll(".nav-link").forEach(function (a) {
      a.addEventListener("click", function () {
        setMenu(false);
      });
    });
  }

  /* ---------- Scroll state + reading progress ---------- */

  var isPost = document.body.classList.contains("layout-post");
  var progress = document.querySelector(".progress span");
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    root.setAttribute("data-scrolled", y > 8 ? "true" : "false");
    if (isPost && progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.setProperty("--progress", max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
    }
  }
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );
  onScroll();

  /* ---------- Reveal on scroll ---------- */

  var revealables = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    // Stagger siblings that enter together.
    var io = new IntersectionObserver(
      function (entries) {
        var batch = entries.filter(function (e) {
          return e.isIntersecting;
        });
        batch.forEach(function (entry, i) {
          entry.target.style.setProperty("--delay", Math.min(i * 0.08, 0.4) + "s");
          entry.target.setAttribute("data-visible", "");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -2% 0px", threshold: 0.01 }
    );
    revealables.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealables.forEach(function (el) {
      el.setAttribute("data-visible", "");
    });
  }

  /* ---------- Copy buttons (BibTeX + code blocks) ---------- */

  function copyText(btn, text) {
    function done(label) {
      btn.textContent = label;
      setTimeout(function () {
        btn.textContent = "Copy";
      }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          done("Copied");
        },
        function () {
          done("Press ⌘C");
        }
      );
    } else {
      done("Press ⌘C");
    }
  }

  document.querySelectorAll(".prose div.highlighter-rouge, .prose figure.highlight").forEach(function (block) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.setAttribute("data-copy", "");
    block.appendChild(btn);
  });

  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest("[data-copy]") : null;
    if (!btn) return;
    var code = btn.parentElement.querySelector("pre");
    if (code) copyText(btn, code.innerText.trim());
  });

  /* ---------- Hero: a live von Kármán vortex street ---------- */

  document.querySelectorAll("canvas.flow").forEach(function (canvas) {
    if (canvas.getContext) initFlow(canvas);
  });

  function initFlow(canvas) {
    var ctx = canvas.getContext("2d");
    var dpr = 1;
    var W = 0;
    var H = 0;
    var color = "42,67,212";
    var particles = [];
    var vortices = [];
    var running = false;
    var visible = true;
    var raf = 0;
    var t = 0;

    // Flow parameters (set on resize, in CSS pixels). We look at the street from a
    // frame that almost travels with it, so the eddies stay readable on screen.
    var U = 0.32; // free-stream speed relative to the observer, px / frame
    var Uv = 0.12; // vortex drift speed relative to the observer
    var spacing, halfGap, core, gamma, yc, period;
    var TRAIL = 34;

    // A pointer disturbance: moving the mouse stirs the fluid.
    var pointer = { x: -1e4, y: -1e4, g: 0, sign: 1 };

    function readColor() {
      var c = getComputedStyle(root).getPropertyValue("--flow").trim();
      if (c) color = c.split(/\s+/).join(",");
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = Math.max(1, rect.width);
      H = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var L = Math.min(H, 900);
      halfGap = 0.15 * L; // half the distance between the two rows
      spacing = (2 * halfGap) / 0.281; // von Kármán's stable ratio h/a ≈ 0.281
      core = 0.075 * L;
      gamma = 13 * core;
      var band = canvas.classList.contains("flow--band");
      yc = band ? H * 0.5 : H * (W > 860 ? 0.56 : 0.62);
      period = W + 2 * spacing;

      vortices = [];
      var n = Math.ceil(period / (spacing / 2)) + 1;
      for (var k = 0; k < n; k++) {
        vortices.push({ x0: k * (spacing / 2), top: k % 2 === 0 });
      }

      var count = Math.round(Math.min(1100, Math.max(260, (W * H) / 1200)));
      particles = [];
      for (var i = 0; i < count; i++) particles.push(spawn({}, true));
    }

    function spawn(p, anywhere) {
      p.x = anywhere ? Math.random() * W : -20 + Math.random() * W * 0.3;
      p.y = Math.random() * H;
      p.life = 140 + Math.random() * 260;
      p.age = anywhere ? Math.random() * p.life * 0.5 : 0;
      p.trail = [p.x, p.y];
      p.dying = false;
      return p;
    }

    function velocity(x, y, out) {
      var u = U;
      var v = 0;
      var core2 = core * core;
      for (var k = 0; k < vortices.length; k++) {
        var vk = vortices[k];
        var vx = ((((vk.x0 + Uv * t) % period) + period) % period) - spacing;
        var vy = yc + (vk.top ? -halfGap : halfGap);
        var dx = x - vx;
        var dy = y - vy;
        var r2 = dx * dx + dy * dy + 1e-6;
        // Lamb–Oseen vortex: regularised point vortex with a viscous core.
        var s = ((vk.top ? -gamma : gamma) / (2 * Math.PI * r2)) * (1 - Math.exp(-r2 / core2));
        u -= s * dy;
        v += s * dx;
      }
      if (pointer.g > 0.01) {
        var px = x - pointer.x;
        var py = y - pointer.y;
        var pr2 = px * px + py * py + 1e-6;
        var pc2 = 70 * 70;
        var ps = ((pointer.sign * pointer.g) / (2 * Math.PI * pr2)) * (1 - Math.exp(-pr2 / pc2));
        u -= ps * py;
        v += ps * px;
      }
      out[0] = u;
      out[1] = v;
    }

    var k1 = [0, 0];
    var k2 = [0, 0];
    function step() {
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (!p.dying) {
          // Midpoint (RK2) integration keeps the streaklines smooth.
          velocity(p.x, p.y, k1);
          velocity(p.x + 0.5 * k1[0], p.y + 0.5 * k1[1], k2);
          p.x += k2[0];
          p.y += k2[1];
          p.trail.push(p.x, p.y);
          if (p.trail.length > TRAIL * 2) p.trail.splice(0, 2);
          p.age++;
          if (p.age > p.life || p.x > W + 20 || p.y < -40 || p.y > H + 40) p.dying = true;
        } else {
          // Let the tail catch up instead of popping out of existence.
          p.trail.splice(0, 4);
          if (p.trail.length < 4) spawn(p, Math.random() < 0.6);
        }
      }
      t++;
      pointer.g *= 0.94;
    }

    var BUCKETS = 4;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1.1;
      ctx.lineCap = "round";
      for (var b = 0; b < BUCKETS; b++) {
        ctx.beginPath();
        for (var i = 0; i < particles.length; i++) {
          var tr = particles[i].trail;
          var segs = tr.length / 2 - 1;
          if (segs < 1) continue;
          var from = Math.floor((segs * b) / BUCKETS);
          var to = Math.floor((segs * (b + 1)) / BUCKETS);
          if (to <= from) continue;
          ctx.moveTo(tr[from * 2], tr[from * 2 + 1]);
          for (var s = from + 1; s <= to; s++) ctx.lineTo(tr[s * 2], tr[s * 2 + 1]);
        }
        ctx.strokeStyle = "rgba(" + color + "," + (0.08 + 0.42 * ((b + 1) / BUCKETS)).toFixed(3) + ")";
        ctx.stroke();
      }
    }

    function frame() {
      if (!running) return;
      step();
      draw();
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduceMotion.matches || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function still() {
      // Reduced motion: settle the flow, then draw a single frame.
      for (var i = 0; i < 90; i++) step();
      draw();
    }

    readColor();
    resize();
    if (reduceMotion.matches) still();
    else {
      for (var w = 0; w < 30; w++) step(); // warm up so the first frame has trails
      start();
    }

    var resizeTimer = 0;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var was = running;
        stop();
        resize();
        if (was || !reduceMotion.matches) {
          for (var w = 0; w < 30; w++) step();
          start();
        } else still();
      }, 150);
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start();
        else stop();
      }).observe(canvas);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    document.addEventListener("themechange", function () {
      readColor();
      if (!running) draw();
    });

    var hero = canvas.parentElement;
    var last = null;
    hero.addEventListener(
      "pointermove",
      function (e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        if (last) {
          var speed = Math.hypot(x - last[0], y - last[1]);
          // Stir clockwise when moving right, counter-clockwise when moving left.
          pointer.sign = x >= last[0] ? -1 : 1;
          pointer.g = Math.min(600, pointer.g * 0.8 + speed * 10);
        }
        pointer.x = x;
        pointer.y = y;
        last = [x, y];
      },
      { passive: true }
    );
    hero.addEventListener("pointerleave", function () {
      last = null;
    });
  }
})();
