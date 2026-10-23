// ============================================================
// Wedding invite — Tường Duy & Như Ngọc
// ============================================================

// Dynamic config — overwritten by data/<side>.json after fetch. The initial
// values are a safe fallback (groom's event) so the page still renders if the
// JSON fails to load.
let WEDDING_DATE = new Date("2026-11-29T18:00:00+07:00");
let CALENDAR_EVENT = {
  title: "Tiệc cưới Tường Duy ❤ Như Ngọc",
  startUtc: "20261129T110000Z",
  endUtc:   "20261129T140000Z",
  location: "Queen Plaza Tân Bình, 91B2 Phạm Văn Hai, Tân Sơn Hòa, Hồ Chí Minh",
  mapsUrl:  "https://maps.app.goo.gl/ytBXpzy8v4EaYTEY6",
  details:  "Trân trọng kính mời quý khách đến chung vui trong ngày cưới của Tường Duy & Như Ngọc.",
};

// ---------- Data: load per-side JSON and apply to DOM ----------
(() => {
  const get = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);

  const applyAttrSpec = (el, spec, data) => {
    spec.split("|").forEach((pair) => {
      const idx = pair.indexOf(":");
      if (idx < 0) return;
      const attr = pair.slice(0, idx).trim();
      const path = pair.slice(idx + 1).trim();
      const v = get(data, path);
      if (v != null) el.setAttribute(attr, v);
    });
  };

  const applyActiveCalendarDay = (data) => {
    const target = String(get(data, "date.day") ?? "").trim();
    if (!target) return;
    const cells = document.querySelectorAll(".cal-day");
    const current = document.querySelector(".cal-day.active");
    let heartHtml = "";
    if (current) {
      const heart = current.querySelector(".cal-heart");
      if (heart) heartHtml = heart.outerHTML;
    }
    cells.forEach((cell) => {
      const label = cell.textContent.replaceAll(/\s+/g, "").trim();
      if (label === target) {
        cell.classList.add("active");
        const monthNum = (get(data, "date.monthShort") || "").match(/\d+/)?.[0] || "";
        const year = get(data, "date.year") || "";
        cell.setAttribute("aria-label", `Ngày cưới ${target} tháng ${monthNum} năm ${year}`);
        if (!cell.querySelector(".cal-heart") && heartHtml) {
          cell.insertAdjacentHTML("afterbegin", heartHtml);
        }
      } else if (cell.classList.contains("active")) {
        cell.classList.remove("active");
        const h = cell.querySelector(".cal-heart");
        if (h) h.remove();
      }
    });
  };

  const applyRestaurantNameModifier = (data) => {
    const el = document.getElementById("restaurantName");
    if (!el) return;
    const mod = get(data, "venue.nameModifier") || "";
    // Strip any previously-applied modifier (anything starting with restaurant-name--).
    el.classList.forEach((c) => {
      if (c.startsWith("restaurant-name--")) el.classList.remove(c);
    });
    if (mod) mod.split(/\s+/).filter(Boolean).forEach((c) => el.classList.add(c));
  };

  const apply = (data) => {
    document.querySelectorAll("[data-f]").forEach((el) => {
      const v = get(data, el.dataset.f);
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-fh]").forEach((el) => {
      const v = get(data, el.dataset.fh);
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll("[data-fa]").forEach((el) => {
      applyAttrSpec(el, el.dataset.fa, data);
    });

    applyActiveCalendarDay(data);
    applyRestaurantNameModifier(data);

    const coupleGrid = document.getElementById("coupleGrid");
    if (coupleGrid) coupleGrid.classList.toggle("couple-grid--reverse", data.side === "bride");

    if (data.date?.iso) WEDDING_DATE = new Date(data.date.iso);
    if (data.calendar) {
      CALENDAR_EVENT = {
        title:    data.calendar.title    ?? CALENDAR_EVENT.title,
        startUtc: data.calendar.startUtc ?? CALENDAR_EVENT.startUtc,
        endUtc:   data.calendar.endUtc   ?? CALENDAR_EVENT.endUtc,
        location: data.calendar.location ?? CALENDAR_EVENT.location,
        mapsUrl:  data.venue?.mapsUrl    ?? CALENDAR_EVENT.mapsUrl,
        details:  data.calendar.details  ?? CALENDAR_EVENT.details,
      };
      refreshCalendarHref();
    }
  };

  fetch("side.txt", { cache: "no-cache" })
    .then((r) => r.ok ? r.text() : Promise.reject(new Error(`side.txt HTTP ${r.status}`)))
    .then((text) => {
      const side = text.trim().toLowerCase().startsWith("b") ? "bride" : "groom";
      return fetch(`data/${side}.json`, { cache: "no-cache" });
    })
    .then((r) => r.ok ? r.json() : Promise.reject(new Error(`JSON HTTP ${r.status}`)))
    .then(apply)
    .catch((e) => console.warn("Config load failed", e));
})();

// ---------- Loader ----------
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  setTimeout(() => loader.classList.add("hide"), 500);
});

// ---------- Nav scroll + mobile menu ----------
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 40);
});

navToggle.addEventListener("click", () => {
  navToggle.classList.toggle("open");
  navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => {
    navToggle.classList.remove("open");
    navLinks.classList.remove("open");
  });
});

// ---------- Countdown ----------
const dEl = document.querySelector("[data-d]");
const hEl = document.querySelector("[data-h]");
const mEl = document.querySelector("[data-m]");
const sEl = document.querySelector("[data-s]");

function pad(n) { return String(Math.max(0, n)).padStart(2, "0"); }

function setDigit(el, next) {
  if (!el || el.textContent === next) return;
  el.textContent = next;
  el.classList.remove("flip");
  el.getBoundingClientRect();
  el.classList.add("flip");
}

function tick() {
  const now = new Date();
  const diff = WEDDING_DATE - now;
  if (diff <= 0) {
    [dEl, hEl, mEl, sEl].forEach((el) => el && (el.textContent = "00"));
    return;
  }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  setDigit(dEl, pad(days));
  setDigit(hEl, pad(hours));
  setDigit(mEl, pad(mins));
  setDigit(sEl, pad(secs));
}
tick();
setInterval(tick, 1000);

// ---------- Divider draw-in ----------
const dividerObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("drawn");
        dividerObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll(".divider").forEach((d) => dividerObs.observe(d));

// ---------- Scroll reveal ----------
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ---------- Copy to clipboard ----------
function showToast(msg) {
  let t = document.querySelector(".copy-toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "copy-toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 1800);
}

function flashCopied(el) {
  el.classList.remove("copied");
  el.getBoundingClientRect();
  el.classList.add("copied");
  clearTimeout(el._copyTimer);
  el._copyTimer = setTimeout(() => el.classList.remove("copied"), 1600);
}

document.querySelectorAll(".copyable").forEach((el) => {
  el.addEventListener("click", async () => {
    const text = el.dataset.copy || el.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      showToast("Đã sao chép số tài khoản ✓");
      flashCopied(el);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); showToast("Đã sao chép ✓"); flashCopied(el); }
      catch { showToast("Không thể sao chép"); }
      ta.remove();
    }
  });
});

// ---------- Gift box → opening sequence → modal ----------
(() => {
  const gift = document.getElementById("giftbox");
  const confetti = document.getElementById("giftboxConfetti");
  const modal = document.getElementById("giftModal");
  if (!gift || !confetti || !modal) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const OPEN_MODAL_AT = 2200;
  const BURST_AT = 1000;
  let busy = false;

  const colors = ["#c99a9a", "#dcb6b6", "#e8cdcb", "#a3b392", "#d6b27c"];
  const heart = '<svg viewBox="0 0 12 11"><path d="M6 11L1 6A3 3 0 0 1 6 1.6A3 3 0 0 1 11 6Z" fill="currentColor"/></svg>';

  function burst() {
    confetti.innerHTML = "";
    for (let i = 0; i < 22; i++) {
      const el = document.createElement("i");
      const kind = ["heart", "petal", "dot"][i % 3];
      el.className = kind;
      if (kind === "heart") el.innerHTML = heart;
      const angle = (-90 + (Math.random() * 150 - 75)) * Math.PI / 180;
      const dist = 80 + Math.random() * 90;
      el.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      el.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      el.style.setProperty("--rot", (Math.random() * 540 - 270) + "deg");
      el.style.setProperty("--delay", Math.random() * 0.25 + "s");
      el.style.setProperty("--c", colors[i % colors.length]);
      confetti.appendChild(el);
    }
  }

  const openGiftModal = () => {
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
  };
  const closeGiftModal = () => {
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
  };
  const resetGiftBox = () => {
    gift.classList.remove("is-opening");
    confetti.innerHTML = "";
    busy = false;
  };

  gift.addEventListener("click", () => {
    if (busy) return;
    busy = true;
    if (reduce) { setTimeout(openGiftModal, 200); return; }
    gift.classList.add("is-opening");
    setTimeout(burst, BURST_AT);
    setTimeout(openGiftModal, OPEN_MODAL_AT);
  });

  // Close modal via × button, backdrop click, or Esc; reset the box after each close
  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) { closeGiftModal(); return; }
    if (e.target === modal) closeGiftModal();
  });
  modal.addEventListener("close", resetGiftBox);
})();

// ---------- RSVP form ----------
const form = document.getElementById("rsvpForm");
const formSuccess = document.getElementById("formSuccess");
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  // Collect values (hook this up to your backend/Formspree/Google Form later)
  const data = Object.fromEntries(new FormData(form).entries());
  console.log("RSVP submitted:", data);
  formSuccess.classList.add("show");
  form.reset();
  setTimeout(() => formSuccess.classList.remove("show"), 6000);
});

// ---------- Music ----------
(() => {
  const musicBtn = document.getElementById("musicToggle");
  const audio = document.getElementById("bgMusic");
  if (!musicBtn || !audio) return;

  let userPaused = false;

  const syncState = () => {
    musicBtn.classList.toggle("playing", !audio.paused);
    musicBtn.setAttribute(
      "aria-label",
      audio.paused ? "Phát nhạc" : "Tạm dừng nhạc"
    );
  };
  audio.addEventListener("play", syncState);
  audio.addEventListener("pause", syncState);

  musicBtn.addEventListener("click", () => {
    if (audio.paused) {
      userPaused = false;
      audio.play().catch(() => {});
    } else {
      userPaused = true;
      audio.pause();
    }
  });

  // Pause when the tab is hidden; resume on return unless the user paused it.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (!audio.paused) audio.pause();
    } else if (!userPaused) {
      audio.play().catch(() => {});
    }
  });

  // Browsers allow muted autoplay but block audible autoplay. Start muted
  // so the track is already running when the user first interacts, then
  // unmute on that interaction.
  audio.muted = true;
  audio.play().catch(() => {});

  // Use only `click`/`keydown` (not pointerdown/touchstart). Those pre-click
  // events fire BEFORE the music button's own click handler, which would then
  // see "already playing" and immediately pause what we just unmuted.
  const events = ["click", "keydown"];
  const onFirstInteract = () => {
    userPaused = false;
    audio.muted = false;
    audio.play().catch(() => {});
    events.forEach((ev) => globalThis.removeEventListener(ev, onFirstInteract));
  };
  events.forEach((ev) =>
    globalThis.addEventListener(ev, onFirstInteract, { passive: true })
  );
})();

// ---------- Add to Google Calendar ----------
function refreshCalendarHref() {
  const btn = document.getElementById("addToCalendar");
  if (!btn) return;
  const details = `${CALENDAR_EVENT.details}\n\nBản đồ: ${CALENDAR_EVENT.mapsUrl}`;
  const params = new URLSearchParams({
    action:   "TEMPLATE",
    text:     CALENDAR_EVENT.title,
    dates:    `${CALENDAR_EVENT.startUtc}/${CALENDAR_EVENT.endUtc}`,
    details:  details,
    location: CALENDAR_EVENT.location,
    ctz:      "Asia/Ho_Chi_Minh",
  });
  btn.href = `https://calendar.google.com/calendar/render?${params.toString()}`;
}
refreshCalendarHref();

// ---------- Smooth scroll offset for fixed nav ----------
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - 60;
    window.scrollTo({ top: y, behavior: "smooth" });
  });
});
