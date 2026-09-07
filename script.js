/* ==========================================================================
   Eduardo Quinones — portfolio
   Small, dependency-free behaviours. Everything degrades to a readable page
   if this file fails to load.
   ========================================================================== */

(() => {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Theme ------------------------------------------------------ */

  const STORE_KEY = "eq-theme";
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const toggle = document.querySelector("[data-theme-toggle]");
  const themeLabel = document.querySelector("[data-theme-label]");

  const read = () => {
    try {
      const v = localStorage.getItem(STORE_KEY);
      return v === "light" || v === "dark" ? v : "auto";
    } catch {
      return "auto";
    }
  };

  const resolved = (pref) => (pref === "auto" ? (systemDark.matches ? "dark" : "light") : pref);

  function applyTheme(pref) {
    root.setAttribute("data-theme", pref);
    // The label names what a click will do next, not the current state.
    if (themeLabel) themeLabel.textContent = resolved(pref) === "dark" ? "Light" : "Dark";
  }

  applyTheme(read());

  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = resolved(read()) === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORE_KEY, next);
      } catch {
        /* private mode — theme just won't persist */
      }
      applyTheme(next);
    });
  }

  // Follow the OS only while the user hasn't picked a side.
  systemDark.addEventListener("change", () => {
    if (read() === "auto") applyTheme("auto");
  });

  /* ---------- Reveal on scroll ------------------------------------------- */

  const revealables = document.querySelectorAll(".reveal");

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    revealables.forEach((el) => io.observe(el));

    // Anything already on screen at load shouldn't wait for a scroll event.
    requestAnimationFrame(() => {
      revealables.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
      });
    });
  }

  /* ---------- Scroll progress + sticky topbar ---------------------------- */

  const progress = document.querySelector(".scroll-progress span");
  const topbar = document.querySelector(".topbar");
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    }
    if (topbar) topbar.classList.toggle("is-stuck", y > 8);

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(onScroll);
    },
    { passive: true }
  );
  onScroll();

  /* ---------- Nav scrollspy ---------------------------------------------- */

  const navLinks = Array.from(document.querySelectorAll(".topnav a[href^='#']"));
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === id));
        });
      },
      // Band across the upper-middle of the viewport: whichever section sits
      // there is the one being read.
      { rootMargin: "-30% 0px -55% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Copy to clipboard ------------------------------------------ */

  const toast = document.querySelector("[data-toast]");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2000);
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Older Safari / non-secure contexts.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      ta.remove();
      return ok;
    }
  }

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    const label = btn.querySelector("[data-copy-label]");
    const original = label ? label.textContent : "";

    btn.addEventListener("click", async () => {
      const value = btn.getAttribute("data-copy");
      const ok = await copy(value);

      if (!ok) {
        showToast("Couldn't copy — the address is " + value);
        return;
      }

      btn.classList.add("is-copied");
      if (label) label.textContent = "Copied";
      showToast("Email address copied");

      setTimeout(() => {
        btn.classList.remove("is-copied");
        if (label) label.textContent = original;
      }, 1600);
    });
  });

  /* ---------- Footer year ------------------------------------------------- */

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
