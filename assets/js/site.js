/* smantii.github.io — small, dependency-free interactions. */
(function () {
  "use strict";

  var root = document.documentElement;
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  /* ---------- Theme: dawn and night ---------- */

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
})();
