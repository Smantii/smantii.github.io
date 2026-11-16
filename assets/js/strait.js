/* The Strait: a live view of the Sicilian coast from the Reggio seafront.
   One fragment shader draws the sky, the sea, the coast and its Fata Morgana.
   The mirage needs still air: it rises while the pointer rests and dissolves
   when the pointer moves. Light theme is dawn, dark theme is night, with the
   moon in today's real phase. */
(function () {
  "use strict";

  var VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";

  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes;", // canvas size, device px
    "uniform float uTime;",
    "uniform float uHorizon;", // sea height, device px from the bottom
    "uniform float uUnit;", // one coast unit, device px
    "uniform float uMirage;", // 0..1
    "uniform float uNight;", // 0..1
    "uniform float uPhase;", // moon phase, 0 new .. 0.5 full .. 1 new
    "uniform float uRamp;", // 1: coast grows towards the right (text sits left)
    "uniform float uSeed;",
    "uniform vec2 uMoon;", // moon position: x across the canvas, y up the sky

    "float hash(float n){ return fract(sin(n * 127.1 + uSeed) * 43758.5453); }",
    "float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
    "float vnoise(vec2 p){",
    "  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), f.x),",
    "             mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), f.x), f.y);",
    "}",
    "float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ s += a * vnoise(p); p *= 2.03; a *= 0.5; } return s; }",

    "float hill(float u){",
    "  return max(0.05, 0.19 + 0.11 * sin(u * 0.55 + 0.6 + uSeed) + 0.055 * sin(u * 1.27 + 2.0) + 0.02 * sin(u * 2.9));",
    "}",
    "float ridge(float u){",
    "  return 0.62 + 0.30 * sin(u * 0.16 + 1.0 + uSeed) + 0.42 * (fbm(vec2(u * 0.33 + 3.0, 1.5)) - 0.5);",
    "}",

    "vec3 pastel(float r){",
    "  if (r < 0.28) return vec3(0.89, 0.62, 0.55);", // pink
    "  if (r < 0.54) return vec3(0.94, 0.83, 0.56);", // yellow
    "  if (r < 0.80) return vec3(0.95, 0.93, 0.89);", // white
    "  return vec3(0.87, 0.69, 0.42);", // ochre
    "}",

    // The near coast at world (u, a): hills, houses, a bell tower, a striped pylon.
    // a = 0 is sea level. aa is one pixel in world units. scale shrinks the houses.
    "vec4 coast(float u, float a, float aa, float scale){",
    "  vec4 col = vec4(0.0);",
    "  float W = 1.45;",
    "  float id = floor(u / W);",
    "  float fu = fract(u / W);",
    "  float r1 = hash(id + 1.7), r2 = hash(id * 1.3 + 7.1), r3 = hash(id * 2.1 + 3.3), r4 = hash(id * 0.7 + 9.9);",
    "  float kind = r1 < 0.13 ? 2.0 : (r1 < 0.24 ? 3.0 : (r1 < 0.80 ? 1.0 : 0.0));",
    "  if (kind > 0.5) {",
    "    float bw = kind > 1.5 ? 0.085 : mix(0.34, 0.74, r2);",
    "    float bh = (kind > 2.5 ? 0.62 : (kind > 1.5 ? 0.54 : mix(0.19, 0.40, r4))) * scale;",
    "    float c = mix(bw * 0.5 + 0.04, 1.0 - bw * 0.5 - 0.04, r3);",
    "    float base = hill((id + c) * W);",
    "    float lx = (fu - (c - bw * 0.5)) / bw;",
    "    float ly = (a - base) / bh;",
    "    float ax = aa / (bw * W);",
    "    float ay = aa / bh;",
    "    float m = smoothstep(0.0, ax, lx) * smoothstep(0.0, ax, 1.0 - lx) * smoothstep(0.0, ay, 1.0 - ly);",
    "    if (m > 0.0 && a > 0.0) {",
    "      vec3 b;",
    "      float lit = 0.0;",
    "      vec3 glow = vec3(1.0, 0.78, 0.42);",
    "      if (kind > 2.5) {", // pylon, red and white
    "        b = fract(ly * 3.0 + 0.25) > 0.62 ? vec3(0.81, 0.31, 0.27) : vec3(0.95, 0.93, 0.90);",
    "        lit = step(0.95, ly);",
    "        glow = vec3(1.0, 0.28, 0.22);",
    "      } else if (kind > 1.5) {", // bell tower
    "        b = vec3(0.86, 0.77, 0.61);",
    "        float open = step(0.3, lx) * step(lx, 0.7) * step(0.80, ly) * step(ly, 0.93);",
    "        b = mix(b, vec3(0.30, 0.26, 0.26), open);",
    "        b = mix(b, vec3(0.74, 0.62, 0.45), step(0.965, ly));",
    "        lit = open * 0.8;",
    "      } else {", // a row of houses
    "        float nseg = 1.0 + floor(r2 * 3.0);",
    "        float seg = floor(lx * nseg);",
    "        b = pastel(hash(id * 3.1 + seg * 5.7));",
    "        float cols = floor(bw * 13.0) + 2.0;",
    "        float rows = floor(bh / scale * 13.0) + 1.0;",
    "        vec2 wq = vec2(fract(lx * cols), fract(ly * rows));",
    "        float win = step(0.34, wq.x) * step(wq.x, 0.66) * step(0.26, wq.y) * step(wq.y, 0.74) * step(0.02, ly) * step(ly, 0.9);",
    "        float on = step(0.52, hash2(vec2(floor(lx * cols) + id * 7.0, floor(ly * rows))));",
    "        b = mix(b, vec3(0.27, 0.32, 0.31), win * 0.85);",
    "        b = mix(b, vec3(0.78, 0.60, 0.44), step(0.93, ly));",
    "        lit = win * on;",
    "      }",
    "      vec3 nb = b * vec3(0.10, 0.13, 0.19) + glow * lit;",
    "      col = vec4(mix(b, nb, uNight), m);",
    "    }",
    "  }",
    "  float h = hill(u);",
    "  float hm = smoothstep(0.0, aa, h - a);",
    "  if (hm > 0.0) {",
    "    float patch = smoothstep(0.42, 0.68, fbm(vec2(u * 5.0, a * 16.0)));",
    "    vec3 g = mix(vec3(0.78, 0.68, 0.49), vec3(0.44, 0.47, 0.33), patch);",
    "    g = mix(g, vec3(0.88, 0.83, 0.72), smoothstep(0.04, 0.02, a));", // the beach
    "    g = mix(g, g * vec3(0.09, 0.12, 0.18), uNight);",
    "    float lamp = step(0.93, hash(floor(u * 9.0) + 40.0)) * smoothstep(0.035, 0.0, abs(a - 0.045)) * smoothstep(0.5, 0.2, abs(fract(u * 9.0) - 0.5));",
    "    g += vec3(1.0, 0.76, 0.40) * lamp * uNight;",
    "    col = mix(col, vec4(g, 1.0), hm);",
    "  }",
    "  return col;",
    "}",

    "vec3 skyDay(float v){",
    "  vec3 c = mix(vec3(0.925, 0.835, 0.735), vec3(0.905, 0.770, 0.690), smoothstep(0.0, 0.13, v));",
    "  c = mix(c, vec3(0.800, 0.815, 0.840), smoothstep(0.10, 0.40, v));",
    "  return mix(c, vec3(0.585, 0.705, 0.850), smoothstep(0.34, 1.0, v));",
    "}",
    "vec3 skyNight(float v){",
    "  vec3 c = mix(vec3(0.17, 0.23, 0.32), vec3(0.09, 0.13, 0.20), smoothstep(0.0, 0.30, v));",
    "  return mix(c, vec3(0.035, 0.055, 0.095), smoothstep(0.22, 1.0, v));",
    "}",

    "void main(){",
    "  vec2 px = gl_FragCoord.xy;",
    "  float xf = px.x / uRes.x;",
    "  float u = (px.x - 0.5 * uRes.x) / uUnit;",
    "  float a = (px.y - uHorizon) / uUnit;",
    "  float aa = 1.2 / uUnit;",
    "  float ramp = mix(1.0, smoothstep(0.42, 0.70, xf), uRamp);",
    "  float scale = mix(0.62, 1.22, ramp);",
    "  vec2 moon = vec2(uRes.x * uMoon.x, uHorizon + (uRes.y - uHorizon) * uMoon.y);",
    "  float moonR = clamp(uRes.y * 0.034, 14.0, 44.0);",
    "  float lum = 0.5 - 0.5 * cos(6.2831853 * uPhase);", // lit fraction of the moon
    "  vec3 col;",

    "  if (a >= 0.0) {",
    "    float v = (px.y - uHorizon) / max(1.0, uRes.y - uHorizon);",
    "    col = mix(skyDay(v), skyNight(v), uNight);",

    // stars and the moon
    "    if (uNight > 0.01) {",
    "      vec2 g = px / 3.0;",
    "      vec2 gi = floor(g);",
    "      float s = hash2(gi);",
    "      float tw = 0.6 + 0.4 * sin(uTime * (0.6 + s * 2.0) + s * 40.0);",
    "      float star = step(0.9965, s) * smoothstep(0.75, 0.0, length(fract(g) - 0.5)) * tw;",
    "      col += vec3(0.85, 0.9, 1.0) * star * uNight * smoothstep(0.02, 0.3, v);",
    "      vec2 q = (px - moon) / moonR;",
    "      float d = length(q);",
    "      col += vec3(0.75, 0.82, 0.95) * (0.10 + 0.25 * lum) * exp(-d * 0.55) * uNight;",
    "      if (d < 1.05) {",
    "        float edge = sqrt(max(0.0, 1.0 - q.y * q.y));",
    "        float term = cos(6.2831853 * uPhase) * edge;",
    "        float litSide = uPhase < 0.5 ? smoothstep(-0.06, 0.06, q.x - term) : smoothstep(-0.06, 0.06, -term - q.x);",
    "        float mare = 0.86 + 0.14 * fbm(q * 2.4 + 5.0);",
    "        vec3 mc = mix(vec3(0.13, 0.17, 0.25), vec3(0.97, 0.95, 0.88) * mare, litSide);",
    "        col = mix(col, mc, smoothstep(1.03, 0.97, d) * uNight);",
    "      }",
    "    }",

    // the far mountains, in haze
    "    float rm = smoothstep(0.0, aa * 2.0, ridge(u) - a);",
    "    vec3 rc = mix(vec3(0.72, 0.72, 0.74), vec3(0.085, 0.115, 0.175), uNight);",
    "    col = mix(col, rc, rm * mix(0.62, 0.9, uNight));",

    // the mirage: above a threshold the image of the coast is stretched upwards
    "    float m = uMirage * (0.72 + 0.28 * sin(u * 0.31 + 1.3 + uTime * 0.05)) * mix(0.55, 1.0, ramp);",
    "    float a0 = 0.40 + 0.035 * sin(u * 0.45 + uTime * 0.07);",
    "    float over = max(a - a0, 0.0);",
    "    float asrc = min(a, a0) + over / (1.0 + 2.1 * m);",
    "    float wob = m * smoothstep(0.0, 0.45, over) * (0.007 * sin(a * 17.0 + uTime * 1.1 + u * 3.0) + 0.008 * sin(a * 5.0 - uTime * 0.6));",
    "    vec4 c = coast(u + wob, asrc, aa, scale);",
    "    float fade = 1.0 - 0.35 * m * smoothstep(0.2, 1.5, over);", // the top of a tower thins out
    "    vec3 hz = mix(skyDay(0.02), skyNight(0.02), uNight);",
    "    col = mix(col, mix(c.rgb, hz, 0.10), c.a * fade);",
    "  } else {",

    // the sea
    "    float du = -a;", // depth below the horizon, in coast units
    "    float d = clamp((uHorizon - px.y) / uHorizon, 0.0, 1.0);",
    "    vec3 top = mix(vec3(0.47, 0.585, 0.685), vec3(0.085, 0.125, 0.185), uNight);",
    "    vec3 bot = mix(vec3(0.125, 0.225, 0.340), vec3(0.030, 0.050, 0.085), uNight);",
    "    col = mix(top, bot, pow(d, 0.55));",
    "    float z = 1.0 / (d + 0.035);",
    "    float w1 = vnoise(vec2(u * z * 0.9 + uTime * 0.12, z * 2.6 + uTime * 0.42));",
    "    float w2 = vnoise(vec2(u * z * 0.5 - uTime * 0.08, z * 1.4 - uTime * 0.25));",
    "    float wave = w1 * 0.6 + w2 * 0.4;",
    "    float calm = smoothstep(0.0, 0.10, d);",

    // the coast mirrored in the water, broken by the waves
    "    float rx = (wave - 0.5) * 0.5 * smoothstep(0.0, 0.6, du);",
    "    vec4 r = coast(u + rx, du * 1.15 + 0.03, aa * 2.0, scale);",
    "    col = mix(col, r.rgb * mix(0.82, 1.0, uNight), r.a * mix(0.42, 0.55, uNight) * exp(-du * 2.2));",

    "    col += (wave - 0.5) * 0.10 * calm * mix(1.0, 0.45, uNight);",
    "    float crest = smoothstep(0.66, 0.84, wave) * calm;",
    "    col += mix(vec3(0.95, 0.90, 0.82), vec3(0.5, 0.6, 0.8), uNight) * crest * mix(0.10, 0.03, uNight);",

    // moonlight on the water
    "    float path = exp(-pow((px.x - moon.x) / (moonR * (1.2 + d * 9.0)), 2.0));",
    "    col += vec3(0.80, 0.86, 0.96) * crest * path * (0.25 + 0.75 * lum) * 0.75 * uNight;",
    "    col = mix(col, mix(skyDay(0.0), skyNight(0.0), uNight), 0.55 * smoothstep(0.035, 0.0, d));",
    "  }",

    "  col += (hash2(px + fract(uTime) * 61.0) - 0.5) * 0.018;", // grain, hides banding
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function isNight() {
    var t = root.getAttribute("data-theme");
    if (t === "dark" || t === "light") return t === "dark";
    return darkQuery.matches;
  }

  // Fraction of the lunar month elapsed: 0 new moon, 0.5 full moon.
  function moonPhase() {
    var synodic = 29.530588853;
    var days = (Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000;
    return (((days / synodic) % 1) + 1) % 1;
  }

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      if (window.console) console.warn(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function init(canvas) {
    var host = canvas.parentElement;
    var seaMark = host.querySelector(".strait-sea");
    var readout = host.querySelector("[data-readout]");
    var isHero = canvas.getAttribute("data-strait") === "hero";
    var gl;
    try {
      gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    } catch (e) {}
    if (!gl) return;

    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var U = {};
    ["uRes", "uTime", "uHorizon", "uUnit", "uMirage", "uNight", "uPhase", "uRamp", "uSeed", "uMoon"].forEach(function (n) {
      U[n] = gl.getUniformLocation(prog, n);
    });

    var dpr = 1;
    var W = 0;
    var H = 0;
    var night = isNight() ? 1 : 0;
    var nightTarget = night;
    var mirage = 0;
    var wind = 0;
    var visible = true;
    var raf = 0;
    var last = 0;
    var t0 = performance.now();
    var born = t0;
    var shown = false;
    var lastLabel = "";

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = Math.max(1, rect.width);
      H = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      // Keep the pixel count sane on very large screens.
      var budget = 2.6e6;
      if (W * H * dpr * dpr > budget) dpr = Math.sqrt(budget / (W * H));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function draw(now) {
      var sea = seaMark ? seaMark.offsetHeight : H * 0.27;
      var unit = isHero ? Math.max(88, Math.min(140, H * 0.15)) : 62;
      if (W < 720) unit *= isHero ? 0.8 : 0.9;
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform1f(U.uTime, (now - t0) / 1000);
      gl.uniform1f(U.uHorizon, sea * dpr);
      gl.uniform1f(U.uUnit, unit * dpr);
      gl.uniform1f(U.uMirage, mirage);
      gl.uniform1f(U.uNight, night);
      gl.uniform1f(U.uPhase, moonPhase());
      gl.uniform1f(U.uRamp, isHero && W >= 900 ? 1 : 0);
      gl.uniform1f(U.uSeed, isHero ? 0.0 : 2.7);
      // On a phone the text fills the sky, so the moon moves up beside the first lines.
      gl.uniform2f(U.uMoon, W < 720 ? 0.85 : 0.8, W < 720 && isHero ? 0.83 : 0.6);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!shown) {
        shown = true;
        canvas.setAttribute("data-ready", "");
      }
    }

    function label() {
      if (!readout) return;
      var text =
        wind > 0.35
          ? readout.getAttribute("data-wind")
          : mirage > 0.6
            ? readout.getAttribute("data-still")
            : readout.getAttribute("data-rising");
      if (text && text !== lastLabel) {
        lastLabel = text;
        readout.textContent = text;
      }
    }

    function frame(now) {
      raf = 0;
      var dt = Math.min(0.1, (now - last) / 1000 || 0.016);
      last = now;
      // Still air lets the mirage build slowly; wind tears it down fast.
      wind *= Math.exp(-dt / 0.7);
      var breath = 0.86 + 0.14 * Math.sin((now - t0) / 1000 / 5.5);
      var target = now - born < 900 ? 0 : (1 - Math.min(1, wind * 1.6)) * breath;
      var rate = target > mirage ? 0.45 : 3.2;
      mirage += (target - mirage) * (1 - Math.exp(-dt * rate));
      night += (nightTarget - night) * (1 - Math.exp(-dt * 2.4));
      draw(now);
      label();
      schedule();
    }

    function schedule() {
      if (!raf && visible && !document.hidden && !reduceMotion.matches) raf = requestAnimationFrame(frame);
    }

    function still() {
      // One calm frame, mirage fully formed.
      mirage = 0.9;
      night = nightTarget;
      draw(t0 + 4000);
      label();
    }

    function refresh() {
      resize();
      if (reduceMotion.matches) still();
      else schedule();
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) {
          last = performance.now();
          schedule();
        }
      }).observe(canvas);
    }
    if ("ResizeObserver" in window) new ResizeObserver(refresh).observe(host);
    else window.addEventListener("resize", refresh);

    document.addEventListener("visibilitychange", function () {
      last = performance.now();
      schedule();
    });
    document.addEventListener("themechange", function () {
      nightTarget = isNight() ? 1 : 0;
      if (reduceMotion.matches) still();
    });
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", refresh);

    // A moving mouse is wind. Touch never counts, so the mirage stays on phones.
    var px = null;
    var py = null;
    host.addEventListener(
      "pointermove",
      function (e) {
        if (e.pointerType !== "mouse") return;
        if (px !== null) {
          var d = Math.sqrt((e.clientX - px) * (e.clientX - px) + (e.clientY - py) * (e.clientY - py));
          wind = Math.min(1, wind + d / 520);
        }
        px = e.clientX;
        py = e.clientY;
      },
      { passive: true }
    );
    host.addEventListener("pointerleave", function () {
      px = null;
    });

    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault();
      canvas.removeAttribute("data-ready");
    });

    refresh();
  }

  document.querySelectorAll("canvas.strait").forEach(init);
})();
