// ============================================================
// Wedding invite — Tường Duy & Như Ngọc
// ============================================================

const WEDDING_DATE = new Date("2026-11-29T18:00:00+07:00");

// 29/11/2026 18:00–21:00 Asia/Ho_Chi_Minh → UTC 11:00–14:00
const CALENDAR_EVENT = {
  title: "Tiệc cưới Tường Duy ❤ Như Ngọc",
  startUtc: "20261129T110000Z",
  endUtc:   "20261129T140000Z",
  location: "Queen Plaza Tân Bình, 91B2 Phạm Văn Hai, Tân Sơn Hòa, Hồ Chí Minh",
  mapsUrl:  "https://maps.app.goo.gl/ytBXpzy8v4EaYTEY6",
  details:  "Trân trọng kính mời quý khách đến chung vui trong ngày cưới của Tường Duy & Như Ngọc.",
};

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
  const START_AT = 24 * 60 + 35; // 24:35
  let seeded = false;
  const seedStart = () => {
    if (seeded) return;
    if (!Number.isFinite(audio.duration) || audio.duration <= START_AT) return;
    audio.currentTime = START_AT;
    seeded = true;
  };
  if (audio.readyState >= 1) seedStart();
  else audio.addEventListener("loadedmetadata", seedStart, { once: true });

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

  // Browsers block autoplay — attempt it, then fall back to starting
  // playback on the user's first interaction anywhere on the page.
  const startIfPaused = () => {
    if (audio.paused) audio.play().catch(() => {});
  };
  audio.play().catch(() => {
    const events = ["click", "touchstart", "scroll", "keydown"];
    const onFirstInteract = () => {
      startIfPaused();
      events.forEach((ev) => window.removeEventListener(ev, onFirstInteract));
    };
    events.forEach((ev) =>
      window.addEventListener(ev, onFirstInteract, { once: true, passive: true })
    );
  });
})();

// ---------- Add to Google Calendar ----------
(() => {
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
})();

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
