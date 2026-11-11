/* ============================================================
   EXTRA ANIMATION LAYER  (load after script.js)
   Needs GSAP + ScrollTrigger (already on the page).
   Skips itself for prefers-reduced-motion users.
   ============================================================ */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const root = document.documentElement;
  root.classList.add("anim");
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mk = (tag, cls) => { const e = document.createElement(tag); e.className = cls; return e; };
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Run a callback once the intro loader has gone */
  function afterLoader(cb) {
    const l = document.getElementById("siteLoader");
    if (!l || l.classList.contains("is-hidden")) { cb(); return; }
    let done = false;
    const go = () => { if (done) return; done = true; mo.disconnect(); cb(); };
    const mo = new MutationObserver(() => { if (l.classList.contains("is-hidden")) go(); });
    mo.observe(l, { attributes: true, attributeFilter: ["class"] });
    setTimeout(go, 5200);
  }

  /* Split helpers */
  function splitChars(el) {
    const text = el.textContent.trim();
    el.textContent = "";
    const chars = [];
    text.split(/\s+/).forEach((w, i, arr) => {
      const ws = mk("span", "hw");
      [...w].forEach(c => { const s = mk("span", "ch"); s.textContent = c; ws.appendChild(s); chars.push(s); });
      el.appendChild(ws);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return chars;
  }
  function splitWords(el) {
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
          const w = mk("span", "w"), i = mk("span", "wi");
          i.textContent = p; w.appendChild(i); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
    });
    walk(el);
    return $$(".wi", el);
  }
  function scramble(el, text) {
    const pool = "!<>-_/[]{}=+*^?#ABCDEFGHJKLMNPRSTUVWXYZ";
    const o = { p: 0 };
    gsap.to(o, {
      p: 1, duration: .9, ease: "none",
      onUpdate() {
        const n = Math.floor(o.p * text.length);
        el.textContent = text.slice(0, n) +
          [...text.slice(n)].map(c => c === " " || c === "/" ? c : pool[(Math.random() * pool.length) | 0]).join("");
      },
      onComplete() { el.textContent = text; }
    });
  }

  /* ---------- Loader: live percentage + nav entrance ---------- */
  const cap = $(".loader-caption span:last-child");
  if (cap && document.getElementById("siteLoader")) {
    const o = { v: 0 };
    gsap.to(o, { v: 100, duration: 1.45, ease: "power2.inOut", onUpdate: () => (cap.textContent = Math.round(o.v) + "%") });
  }
  const nav = $("#nav");
  gsap.set(nav, { yPercent: -160, opacity: 0 });
  afterLoader(() => gsap.to(nav, { yPercent: 0, opacity: 1, duration: 1, ease: "power4.out", delay: .1 }));

  /* ---------- Scroll progress bar ---------- */
  const bar = mk("div", "scroll-progress");
  document.body.appendChild(bar);
  gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });

  /* ---------- Hero: per-letter headline + word-by-word subtitle ---------- */
  const h1 = $(".hero h1");
  const chars = $$(".hero h1 .block").flatMap(splitChars);
  gsap.set(chars, { opacity: 0, yPercent: 110, rotateX: -90, transformOrigin: "50% 100%" });
  const subWords = splitWords($(".hero-sub"));
  gsap.set(subWords, { yPercent: 115, opacity: 0 });

  afterLoader(() => {
    gsap.to(chars, {
      opacity: 1, yPercent: 0, rotateX: 0, transformPerspective: 600,
      duration: .9, ease: "back.out(1.6)", stagger: .03,
      onComplete: () => { gsap.set(chars, { clearProps: "transform,opacity" }); h1.classList.add("ready"); }
    });
    gsap.to(subWords, { yPercent: 0, opacity: 1, duration: .7, ease: "power3.out", stagger: .025, delay: .6 });
    gsap.from(".hero .eyebrow .line", { scaleX: 0, transformOrigin: "left", duration: .9, ease: "power3.out", delay: .2 });
  });

  /* Portrait: ken-burns, scroll parallax, scroll scale */
  const img = $(".portrait-image");
  if (img) {
    gsap.set(img, { scale: 1.12 });
    gsap.from(img, { clipPath: "inset(100% 0 0 0)", duration: 1.3, ease: "power4.inOut", delay: 1.3 });
    gsap.to(img, { scale: 1.2, duration: 9, yoyo: true, repeat: -1, ease: "sine.inOut" });
    gsap.to(img, { yPercent: 6, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  }
  gsap.to(".portrait", { scale: .93, y: -30, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero-text", { yPercent: -10, opacity: .25, ease: "none", scrollTrigger: { trigger: ".hero", start: "20% top", end: "bottom top", scrub: true } });
  gsap.to(".watermark", { xPercent: -14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  /* Mouse parallax across the hero (uses CSS `translate`, no clash with GSAP transforms) */
  if (fine) {
    const mouse = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    window.addEventListener("pointermove", e => { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; }, { passive: true });
    const targets = [[".portrait-image", 14], [".chip-a", -34], [".chip-b", 30], [".corner-br", -14], [".corner-tl", 14], [".watermark", -26]]
      .map(([s, d]) => ({ el: $(s), d })).filter(t => t.el);
    let heroVisible = true;
    new IntersectionObserver(e => (heroVisible = e[0].isIntersecting)).observe($(".hero"));
    gsap.ticker.add(() => {
      if (!heroVisible) return;
      cur.x += (mouse.x - cur.x) * .07; cur.y += (mouse.y - cur.y) * .07;
      targets.forEach(t => (t.el.style.translate = `${cur.x * t.d * 2}px ${cur.y * t.d * 2}px`));
    });
  }

  /* ---------- Section kickers (scramble) + titles (word mask reveal) ---------- */
  $$(".kicker").forEach(k => {
    const txt = k.textContent.trim();
    gsap.set(k, { opacity: 0, x: -20 });
    ScrollTrigger.create({
      trigger: k, start: "top 92%", once: true,
      onEnter: () => { gsap.to(k, { opacity: 1, x: 0, duration: .6, ease: "power3.out" }); k.classList.add("in"); scramble(k, txt); }
    });
  });
  $$(".title").forEach(t => {
    const words = splitWords(t);
    gsap.set(words, { yPercent: 115 });
    ScrollTrigger.create({
      trigger: t, start: "top 88%", once: true,
      onEnter: () => gsap.to(words, { yPercent: 0, duration: .9, ease: "power4.out", stagger: .06 })
    });
  });

  /* ---------- Marquee: scroll-velocity speed + skew ---------- */
  const track = $(".marquee-track");
  if (track) {
    track.style.animation = "none";
    const mq = gsap.to(track, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
    const skewTo = gsap.quickTo(track, "skewX", { duration: .4 });
    let t;
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate(self) {
        const v = self.getVelocity();
        mq.timeScale(gsap.utils.clamp(-6, 6, self.direction * (1 + Math.abs(v) / 400)));
        skewTo(gsap.utils.clamp(-12, 12, -v / 150));
        clearTimeout(t);
        t = setTimeout(() => { gsap.to(mq, { timeScale: 1, duration: .8 }); skewTo(0); }, 120);
      }
    });
    const m = $(".marquee");
    m.addEventListener("mouseenter", () => gsap.to(mq, { timeScale: 0, duration: .4 }));
    m.addEventListener("mouseleave", () => gsap.to(mq, { timeScale: 1, duration: .4 }));
  }

  /* ---------- Nav: hide on scroll down, show on scroll up, active link ---------- */
  const menu = $("#mobileMenu");
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate(self) {
      const hide = self.direction === 1 && self.scroll() > 240 && !(menu && menu.classList.contains("open"));
      gsap.to(nav, { yPercent: hide ? -160 : 0, duration: .4, ease: "power3.out", overwrite: "auto" });
    }
  });
  ["about", "services", "works", "faq"].forEach(id => {
    const link = $(`.nav-links a[href="#${id}"]`);
    if (!link) return;
    ScrollTrigger.create({
      trigger: "#" + id, start: "top 55%", end: "bottom 55%",
      onToggle: s => link.classList.toggle("active", s.isActive)
    });
  });

  /* ---------- Cursor, glow, click burst ---------- */
  if (fine) {
    const dot = mk("div", "cursor-dot"), ring = mk("div", "cursor-ring"), glow = mk("div", "cursor-glow");
    const label = document.createElement("span");
    ring.appendChild(label);
    document.body.append(glow, ring, dot);
    gsap.set([dot, ring, glow], { xPercent: -50, yPercent: -50, x: -300, y: -300 });
    const dx = gsap.quickTo(dot, "x", { duration: .1, ease: "power3" }),  dy = gsap.quickTo(dot, "y", { duration: .1, ease: "power3" });
    const rx = gsap.quickTo(ring, "x", { duration: .45, ease: "power3" }), ry = gsap.quickTo(ring, "y", { duration: .45, ease: "power3" });
    const gx = gsap.quickTo(glow, "x", { duration: 1, ease: "power3" }),  gy = gsap.quickTo(glow, "y", { duration: 1, ease: "power3" });
    window.addEventListener("pointermove", e => {
      if (e.pointerType === "touch") return;
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); gx(e.clientX); gy(e.clientY);
    }, { passive: true });
    document.addEventListener("pointerover", e => {
      const hit = e.target.closest && e.target.closest("a,button,input,select,textarea,label,.work,.faq-q");
      const w = e.target.closest && e.target.closest(".work");
      ring.classList.toggle("hover", !!hit && !w);
      ring.classList.toggle("label", !!w);
      label.textContent = w ? "OPEN" : "";
    });
    document.addEventListener("mouseleave", () => gsap.to([dot, ring, glow], { opacity: 0, duration: .2 }));
    document.addEventListener("mouseenter", () => gsap.to([dot, ring, glow], { opacity: 1, duration: .2 }));
    root.classList.add("has-cursor");
  }
  document.addEventListener("pointerdown", e => {
    for (let i = 0; i < 8; i++) {
      const b = mk("span", "burst");
      document.body.appendChild(b);
      const a = (Math.PI * 2 * i) / 8 + Math.random() * .5, d = 30 + Math.random() * 34;
      gsap.fromTo(b, { x: e.clientX - 3, y: e.clientY - 3, scale: 1, opacity: 1 },
        { x: e.clientX - 3 + Math.cos(a) * d, y: e.clientY - 3 + Math.sin(a) * d, scale: 0, opacity: 0, duration: .65, ease: "power2.out", onComplete: () => b.remove() });
    }
  });

  /* ---------- Magnetic buttons + ripple ---------- */
  $$(".btn, .nav-cta, .to-top").forEach(el => {
    if (fine) {
      el.setAttribute("data-magnetic", "");
      const clamp = gsap.utils.clamp(-16, 16);
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: clamp((e.clientX - r.left - r.width / 2) * .3), y: clamp((e.clientY - r.top - r.height / 2) * .4), duration: .35, ease: "power3.out" });
      });
      el.addEventListener("pointerleave", () => gsap.to(el, { x: 0, y: 0, duration: .8, ease: "elastic.out(1,.4)" }));
    }
    if (el.classList.contains("btn")) {
      el.addEventListener("click", e => {
        const r = el.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2;
        const rp = mk("span", "ripple");
        rp.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
        el.appendChild(rp);
        setTimeout(() => rp.remove(), 750);
      });
    }
  });

  /* ---------- Card spotlight + 3D tilt ---------- */
  if (fine) {
    $$(".service, .about-card, .form").forEach(c => c.classList.add("spot"));
    const tilts = { ".service": 6, ".about-card": 5, ".work-thumb": 5 };
    Object.entries(tilts).forEach(([sel, max]) => $$(sel).forEach(el => {
      el.setAttribute("data-tilt", "");
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        gsap.to(el, { rotationY: (px - .5) * max * 2, rotationX: -(py - .5) * max * 2, transformPerspective: 900, duration: .4, ease: "power2.out" });
      });
      el.addEventListener("pointerleave", () => gsap.to(el, { rotationX: 0, rotationY: 0, duration: .7, ease: "power3.out" }));
    }));
    $$(".spot").forEach(el => el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    }));
  }

  /* ---------- Misc scroll motion ---------- */
  gsap.from(".tool", { opacity: 0, scale: .7, y: 30, duration: .7, ease: "back.out(1.7)", stagger: .1, scrollTrigger: { trigger: ".tools", start: "top 88%", once: true } });
  gsap.from(".ticks li", { opacity: 0, x: -18, duration: .6, ease: "power3.out", stagger: .12, scrollTrigger: { trigger: ".ticks", start: "top 90%", once: true } });
  gsap.from(".contact-link", { opacity: 0, x: -40, duration: .7, ease: "power3.out", stagger: .12, scrollTrigger: { trigger: ".contact-links", start: "top 90%", once: true } });
  gsap.from(".socials a", { opacity: 0, scale: 0, duration: .6, ease: "back.out(2)", stagger: .1, scrollTrigger: { trigger: ".socials", start: "top 95%", once: true } });
  gsap.from(".footer-inner > *", { opacity: 0, y: 24, duration: .7, ease: "power3.out", stagger: .12, scrollTrigger: { trigger: ".footer", start: "top 98%", once: true } });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
