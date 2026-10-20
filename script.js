// ============================================================
// Wedding invite — Minh Khoa & Thu Hà
// ============================================================

const WEDDING_DATE = new Date("2026-11-29T18:00:00+07:00");

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

function tick() {
  const now = new Date();
  const diff = WEDDING_DATE - now;
  if (diff <= 0) {
    dEl.textContent = "00"; hEl.textContent = "00"; mEl.textContent = "00"; sEl.textContent = "00";
    return;
  }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  dEl.textContent = pad(days);
  hEl.textContent = pad(hours);
  mEl.textContent = pad(mins);
  sEl.textContent = pad(secs);
}
tick();
setInterval(tick, 1000);

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

document.querySelectorAll(".copyable").forEach((el) => {
  el.addEventListener("click", async () => {
    const text = el.dataset.copy || el.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      showToast("Đã sao chép số tài khoản ✓");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); showToast("Đã sao chép ✓"); }
      catch { showToast("Không thể sao chép"); }
      ta.remove();
    }
  });
});

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
const musicBtn = document.getElementById("musicToggle");
const audio = document.getElementById("bgMusic");
let playing = false;

musicBtn.addEventListener("click", async () => {
  if (!audio) return;
  if (playing) {
    audio.pause();
    musicBtn.classList.remove("playing");
    playing = false;
  } else {
    try {
      await audio.play();
      musicBtn.classList.add("playing");
      playing = true;
    } catch (err) {
      console.warn("Audio play blocked:", err);
      showToast("Không phát được nhạc — thiếu file audio");
    }
  }
});

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
