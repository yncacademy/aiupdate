/* AI Magic Mastery — 2026 Update Training
   Small, dependency-free behaviours. */

(function () {
  "use strict";

  /* ---------- storage helpers ---------- */
  var KEY = "aim2026.progress.v1";
  function readProgress() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  function writeProgress(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {
      /* storage unavailable: progress just will not persist */
    }
  }
  function hasDone(slug) {
    return readProgress().indexOf(slug) !== -1;
  }
  function setDone(slug, done) {
    var list = readProgress().filter(function (s) {
      return s !== slug;
    });
    if (done) list.push(slug);
    writeProgress(list);
    paintProgress();
  }

  /* ---------- paint progress everywhere ---------- */
  var SECTION_SLUGS = [
    "opening",
    "text-models",
    "find-niches",
    "image-models",
    "video-models",
    "agents",
    "publishing",
    "facebook-monetization",
    "black-friday-q4",
    "coach-agent"
  ];

  function paintProgress() {
    var done = readProgress();

    document.querySelectorAll("[data-progress-tick]").forEach(function (el) {
      if (done.indexOf(el.getAttribute("data-progress-tick")) !== -1) {
        el.classList.add("on");
      } else {
        el.classList.remove("on");
      }
    });

    document.querySelectorAll("[data-done-nav]").forEach(function (el) {
      el.classList.toggle("is-done", done.indexOf(el.getAttribute("data-done-nav")) !== -1);
    });

    document.querySelectorAll("[data-done-card]").forEach(function (el) {
      el.classList.toggle("is-done", done.indexOf(el.getAttribute("data-done-card")) !== -1);
    });

    var countEl = document.querySelector("[data-progress-count]");
    if (countEl) {
      var n = SECTION_SLUGS.filter(function (s) {
        return done.indexOf(s) !== -1;
      }).length;
      countEl.textContent = n + "/" + SECTION_SLUGS.length;
    }

    var btn = document.querySelector("[data-complete]");
    if (btn) {
      var slug = btn.getAttribute("data-complete");
      var isDone = done.indexOf(slug) !== -1;
      btn.setAttribute("aria-pressed", isDone ? "true" : "false");
      btn.querySelector("[data-complete-label]").textContent = isDone
        ? "Marked as read"
        : "Mark as read";
    }
  }

  /* ---------- mobile drawer ---------- */
  var menuBtn = document.querySelector("[data-menu-toggle]");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      var first = document.querySelector(".sidebar a");
      if (open && first) first.focus({ preventScroll: true });
    });
  }
  document.querySelectorAll("[data-close-nav]").forEach(function (el) {
    el.addEventListener("click", function () {
      document.body.classList.remove("nav-open");
      if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- scroll progress ---------- */
  var bar = document.querySelector("[data-scroll-progress]");
  function paintScroll() {
    if (!bar) return;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    bar.style.width = Math.min(100, Math.max(0, pct)) + "%";
  }
  window.addEventListener("scroll", paintScroll, { passive: true });
  window.addEventListener("resize", paintScroll);

  /* ---------- copy prompt ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.querySelector(btn.getAttribute("data-copy"));
      if (!target) return;
      var text = target.innerText;

      function ok() {
        var label = btn.querySelector(".copy-label");
        var old = label ? label.textContent : "";
        btn.classList.add("is-copied");
        if (label) label.textContent = "Copied";
        window.setTimeout(function () {
          btn.classList.remove("is-copied");
          if (label) label.textContent = old;
        }, 1800);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(ok).catch(fallback);
      } else {
        fallback();
      }

      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          ok();
        } catch (e) {
          /* leave the text selectable for manual copy */
        }
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------- lightbox ---------- */
  var box = document.querySelector("[data-lightbox]");
  var boxImg = box ? box.querySelector("img") : null;
  var boxCaption = box ? box.querySelector("[data-lightbox-caption]") : null;
  var boxDownload = box ? box.querySelector("[data-lightbox-download]") : null;
  var lastFocus = null;

  function openLightbox(src, caption) {
    if (!box) return;
    lastFocus = document.activeElement;
    boxImg.src = src;
    boxImg.alt = caption || "";
    boxImg.classList.remove("zoomed");
    if (boxCaption) boxCaption.textContent = caption || "";
    if (boxDownload) {
      boxDownload.href = src;
      boxDownload.setAttribute("download", "");
    }
    box.classList.add("open");
    document.body.style.overflow = "hidden";
    box.scrollTop = 0;
    var closeBtn = box.querySelector("[data-lightbox-close]");
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!box) return;
    box.classList.remove("open");
    document.body.style.overflow = "";
    boxImg.removeAttribute("src");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll("[data-zoom]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      openLightbox(el.getAttribute("data-zoom"), el.getAttribute("data-caption") || "");
    });
  });

  if (box) {
    box.addEventListener("click", function (e) {
      if (e.target === box) closeLightbox();
      if (e.target === boxImg) boxImg.classList.toggle("zoomed");
    });
    var closeBtn = box.querySelector("[data-lightbox-close]");
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (box.classList.contains("open")) closeLightbox();
        else document.body.classList.remove("nav-open");
      }
    });
  }

  /* ---------- mark as read ---------- */
  var completeBtn = document.querySelector("[data-complete]");
  if (completeBtn) {
    completeBtn.addEventListener("click", function () {
      var slug = completeBtn.getAttribute("data-complete");
      setDone(slug, !hasDone(slug));
    });
  }

  /* ---------- prompt library filter ---------- */
  var filterRow = document.querySelector("[data-filter-row]");
  if (filterRow) {
    var items = document.querySelectorAll(".lib-item");
    var empty = document.querySelector("[data-empty-note]");
    filterRow.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-cat]");
      if (!btn) return;
      var cat = btn.getAttribute("data-cat");
      filterRow.querySelectorAll("button").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      var shown = 0;
      items.forEach(function (item) {
        var match = cat === "all" || item.getAttribute("data-cat") === cat;
        item.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.classList.toggle("show", shown === 0);
    });
  }

  /* ---------- Q4 countdown ---------- */
  var cd = document.querySelector("[data-countdown]");
  if (cd) {
    var target = new Date(cd.getAttribute("data-countdown") + "T00:00:00");
    var now = new Date();
    var days = Math.ceil((target - now) / 86400000);
    var num = cd.querySelector(".cd-num");
    var label = cd.querySelector(".cd-label");
    if (days > 1) {
      num.textContent = days + " days";
    } else if (days === 1) {
      num.textContent = "Tomorrow";
    } else if (days === 0) {
      num.textContent = "Today";
    } else {
      label.textContent = "Black Friday 2026 has passed";
      num.textContent = Math.abs(days) + " days ago";
    }
  }

  /* ---------- print ---------- */
  document.querySelectorAll("[data-print]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      window.print();
    });
  });

  /* ---------- init ---------- */
  paintProgress();
  paintScroll();
})();
