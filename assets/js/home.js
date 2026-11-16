/* Home page only: the command menu, the date and moon display, the typed intro. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Command menu: one item is always selected ---------- */

  var menu = document.querySelector(".hm-menu");
  if (menu) {
    var items = Array.prototype.slice.call(menu.querySelectorAll("a"));
    var help = menu.querySelector(".hm-help-text");

    var select = function (item) {
      items.forEach(function (other) {
        other.classList.toggle("is-selected", other === item);
      });
      if (help) help.textContent = item.getAttribute("data-hint") || "";
    };

    items.forEach(function (item, i) {
      item.addEventListener("pointerenter", function () {
        select(item);
      });
      item.addEventListener("focus", function () {
        select(item);
      });
      // Arrow keys move through the menu, as on a controller.
      item.addEventListener("keydown", function (e) {
        var step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        items[(i + step + items.length) % items.length].focus();
      });
    });
  }

  /* ---------- Today's date and the phase of the moon ---------- */

  var hud = document.querySelector(".hm-date");
  if (hud) {
    var now = new Date();
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    hud.querySelector(".hm-date-day").textContent = now.getDate();
    hud.querySelector(".hm-date-month").textContent = months[now.getMonth()];
    hud.querySelector(".hm-date-week").textContent = days[now.getDay()];

    // Fraction of the synodic month elapsed since a known new moon (6 Jan 2000, 18:14 UTC).
    var synodic = 29.530588853;
    var age = (now.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000;
    var phase = (((age / synodic) % 1) + 1) % 1;
    var names = ["New moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full moon", "Waning gibbous", "Last quarter", "Waning crescent"];
    var name = names[Math.floor(phase * 8 + 0.5) % 8];
    hud.querySelector(".hm-moon-name").textContent = name;

    // The lit part: half the disc's edge, closed by the terminator (half an ellipse).
    var r = 17;
    var waxing = phase < 0.5;
    var rx = Math.abs(Math.cos(2 * Math.PI * phase)) * r;
    var crescent = phase < 0.25 || phase > 0.75;
    var back = waxing === crescent ? 0 : 1;
    hud.querySelector(".hm-moon path").setAttribute(
      "d",
      "M20 3A" + r + " " + r + " 0 0 " + (waxing ? 1 : 0) + " 20 37A" + rx.toFixed(2) + " " + r + " 0 0 " + back + " 20 3Z"
    );
    hud.setAttribute("aria-label", days[now.getDay()] + " " + now.getDate() + " " + months[now.getMonth()] + ", " + name.toLowerCase());
    hud.hidden = false;
  }

  /* ---------- The intro types itself into the dialogue box ---------- */

  var typed = document.querySelector("[data-type]");
  if (typed && !reduceMotion) {
    var full = typed.textContent.replace(/\s+/g, " ").trim();
    var shown = document.createElement("span");
    var rest = document.createElement("span");
    rest.className = "hm-untyped";
    rest.textContent = full;
    typed.textContent = "";
    typed.appendChild(shown);
    typed.appendChild(rest);

    var at = 0;
    var timer = 0;
    var finish = function () {
      clearInterval(timer);
      shown.textContent = full;
      rest.textContent = "";
    };
    var arriving = document.documentElement.classList.contains("arriving");
    setTimeout(
      function () {
        timer = setInterval(function () {
          at = Math.min(full.length, at + 2);
          shown.textContent = full.slice(0, at);
          rest.textContent = full.slice(at);
          if (at >= full.length) clearInterval(timer);
        }, 16);
      },
      arriving ? 1300 : 800
    );
    // A click on the box skips the typing.
    typed.parentElement.addEventListener("click", finish);
  }
})();
