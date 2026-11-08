/* ============================================================
   IRSHAD KOLATHUR — PORTFOLIO
   Edit the CONFIG block below to update contact details,
   links and your recent works.
   ============================================================ */

const CONFIG = {
  name: "Irshad Kolathur",
  whatsappNumber: "918848987685",              // country code + number, no "+" or spaces
  whatsappPreText: "Hi Irshad, I found your portfolio and I'd like to discuss a project.",
  instagramUrl: "https://instagram.com/irshadkolathur"   // TODO: replace with your real Instagram link
};

// Replace these sample projects with your real work.
// Optional: add  image: "images/your-file.jpg"  to show a real screenshot.
const WORKS = [
  { title: "Business Website",        category: "web",    label: "Web Development",   year: "2026", art: "linear-gradient(135deg,#1c1c1c,#3a0d10)", mark: "WEB" },
  { title: "Management System",       category: "system", label: "Admin Dashboard",   year: "2026", art: "linear-gradient(135deg,#101820,#1d2b3a)", mark: "SYS" },
  { title: "Social Media Creatives",  category: "design", label: "Photoshop Design",  year: "2026", art: "linear-gradient(135deg,#2a0a0c,#E52B32)", mark: "Ps"  },
  { title: "Brochure Layout",         category: "design", label: "InDesign Layout",   year: "2026", art: "linear-gradient(135deg,#1a1a1a,#444)",    mark: "Id"  }
];

(function () {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const waLink = (text) =>
    `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text || CONFIG.whatsappPreText)}`;

  /* ---------- Contact links (WhatsApp / Instagram) ---------- */
  $$("[data-wa]").forEach(a => (a.href = waLink()));
  $$("[data-ig]").forEach(a => (a.href = CONFIG.instagramUrl));
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Works grid ---------- */
  const grid = $("#worksGrid");
  grid.innerHTML = WORKS.map(w => `
    <a class="work" data-cat="${w.category}" target="_blank" rel="noopener"
       href="${waLink(`Hi Irshad, I saw your "${w.title}" project and I want something similar.`)}">
      <div class="work-thumb">
        <div class="work-art" style="background:${w.image ? `url('${w.image}') center/cover` : w.art}">
          ${w.image ? "" : `<span>${w.mark}</span>`}
        </div>
        <div class="work-over"><em>Request similar</em></div>
        <span class="work-tag">${w.year}</span>
      </div>
      <div class="work-info">
        <div><h3>${w.title}</h3><p>${w.label}</p></div>
        <b aria-hidden="true">↗</b>
      </div>
    </a>`).join("");

  /* ---------- Works filter ---------- */
  $$("#filters button").forEach(btn => {
    btn.addEventListener("click", () => {
      $$("#filters button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      $$(".work").forEach(card => {
        const show = f === "all" || card.dataset.cat === f;
        card.style.display = show ? "block" : "none";
        if (show && window.gsap) gsap.fromTo(card, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .5, ease: "power3.out" });
      });
    });
  });

  /* ---------- Navbar + mobile menu ---------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = $("#burger");
  const mobileMenu = $("#mobileMenu");
  const setMenu = (open) => {
    mobileMenu.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.setAttribute("aria-hidden", String(!open));
  };
  burger.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("open")));
  $$("#mobileMenu a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", () => { if (window.innerWidth > 768) setMenu(false); });

  $("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- FAQ accordion ---------- */
  $$(".faq").forEach(item => {
    const btn = $(".faq-q", item);
    const panel = $(".faq-a", item);
    btn.addEventListener("click", () => {
      const open = item.classList.contains("open");
      $$(".faq.open").forEach(o => {
        o.classList.remove("open");
        $(".faq-a", o).style.maxHeight = null;
        $(".faq-q", o).setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Contact form -> WhatsApp ---------- */
  const form = $("#contactForm");
  const msg = $("#formMsg");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = form.elements;
    let ok = true;
    ["name", "contact", "details"].forEach(n => {
      const empty = !f[n].value.trim();
      f[n].classList.toggle("invalid", empty);
      if (empty) ok = false;
    });
    if (!ok) {
      msg.className = "form-msg err";
      msg.textContent = "Please fill in the required fields.";
      return;
    }
    const text =
`Hi Irshad, I'm contacting you from your portfolio.

*Name:* ${f.name.value.trim()}
*Contact:* ${f.contact.value.trim()}
*Project:* ${f.type.value}
*Budget:* ${f.budget.value}

*Details:*
${f.details.value.trim()}`;
    window.open(waLink(text), "_blank", "noopener");
    msg.className = "form-msg";
    msg.textContent = "Opening WhatsApp. Just press send to deliver your message.";
    form.reset();
    setTimeout(() => (msg.textContent = ""), 7000);
  });
  $$("input, textarea", form).forEach(el =>
    el.addEventListener("input", () => el.classList.remove("invalid")));

  /* ---------- Floating WhatsApp / Instagram pre-text ---------- */
  const pre = $("#floatPre");
  let preDismissed = false;
  try { preDismissed = sessionStorage.getItem("preDismissed") === "1"; } catch (_) {}
  if (!preDismissed) {
    setTimeout(() => pre.classList.add("show"), 3500);
    setTimeout(() => pre.classList.remove("show"), 15000);
  }
  $("#floatPreX").addEventListener("click", () => {
    pre.classList.remove("show");
    try { sessionStorage.setItem("preDismissed", "1"); } catch (_) {}
  });
  pre.addEventListener("click", (e) => {
    if (e.target.id !== "floatPreX") window.open(waLink(), "_blank", "noopener");
  });

  /* ---------- Static fallbacks (no animation) ---------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fillBars = () => $$(".bar i").forEach(b => (b.style.width = b.dataset.level + "%"));
  const setCounts = () => $$(".count").forEach(c => (c.textContent = c.dataset.count));

  if (reduceMotion || !window.gsap || !window.ScrollTrigger) { fillBars(); setCounts(); return; }

  /* ============================================================
     MOTION LAYER (same style as the supplied ICHAPPI site)
     ============================================================ */
  gsap.registerPlugin(ScrollTrigger);

  /* Floating glass bubbles in hero + contact */
  const bubbleObserver = new IntersectionObserver(entries =>
    entries.forEach(en => en.target.classList.toggle("off", !en.isIntersecting)));

  $$(".hero, .contact").forEach(section => {
    const layer = document.createElement("div");
    layer.className = "bubbles";
    layer.setAttribute("aria-hidden", "true");
    const count = window.innerWidth < 760 ? 7 : 12;
    for (let i = 0; i < count; i++) {
      const b = document.createElement("i");
      b.style.cssText =
        `--s:${8 + Math.random() * 38}px;` +
        `--l:${Math.random() * 96}%;` +
        `--d:${8 + Math.random() * 7}s;` +
        `--dl:-${Math.random() * 15}s;` +
        `--x:${(Math.random() - .5) * 90}px;` +
        `--o:${.12 + Math.random() * .18};` +
        `--h:${section.offsetHeight + 80}px`;
      layer.appendChild(b);
    }
    section.prepend(layer);
    bubbleObserver.observe(layer);
  });

  /* Hero entrance */
  const eyebrow = $(".hero .eyebrow");
  const lines = $$(".hero h1 .block");
  const sub = $(".hero-sub");
  const cta = $(".hero-cta");
  const visual = $(".hero-visual");
  const chips = $$(".hero .chip");

  gsap.set([eyebrow, sub, cta], { opacity: 0, y: 24 });
  gsap.set(lines, { opacity: 0, y: 60, filter: "blur(12px)" });
  gsap.set(visual, { opacity: 0, scale: .92, y: 30 });
  gsap.set(chips, { opacity: 0, scale: .6 });

  gsap.timeline({ defaults: { ease: "power3.out" } })
    .to(eyebrow, { opacity: 1, y: 0, duration: .6 })
    .to(lines, { opacity: 1, y: 0, filter: "blur(0px)", duration: .9, stagger: .14 }, "-=.25")
    .to(sub, { opacity: 1, y: 0, duration: .7 }, "-=.45")
    .to(cta, { opacity: 1, y: 0, duration: .7 }, "-=.45")
    .to(visual, { opacity: 1, scale: 1, y: 0, duration: 1 }, "-=1.1")
    .to(chips, { opacity: 1, scale: 1, duration: .7, stagger: .15, ease: "back.out(1.7)" }, "-=.5");

  /* Floating chips */
  chips.forEach((c, i) => gsap.to(c, {
    y: i === 0 ? -12 : 12, rotation: i === 0 ? 4 : -4,
    duration: 2.8 + i * .5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * .2
  }));

  /* Portrait parallax */
  gsap.to(".portrait-initials", {
    yPercent: -12, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  /* Scroll reveals */
  const reveal = $$(".reveal");
  gsap.set(reveal, { opacity: 0, y: 42, filter: "blur(5px)" });
  ScrollTrigger.batch(reveal, {
    start: "top 91%",
    once: true,
    onEnter: batch => gsap.to(batch, {
      opacity: 1, y: 0, filter: "blur(0px)",
      duration: .75, ease: "power3.out", stagger: .09, overwrite: true,
      onComplete: () => gsap.set(batch, { clearProps: "filter,transform,opacity" })
    })
  });

  /* Skill bars */
  $$(".bar i").forEach(bar => {
    gsap.to(bar, {
      width: bar.dataset.level + "%", duration: 1.4, ease: "power3.out",
      scrollTrigger: { trigger: bar, start: "top 92%", once: true }
    });
  });

  /* Stat counters */
  $$(".count").forEach(el => {
    const end = +el.dataset.count;
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 92%", once: true,
      onEnter: () => gsap.to(obj, {
        v: end, duration: 1.6, ease: "power2.out",
        onUpdate: () => (el.textContent = Math.round(obj.v))
      })
    });
  });

  /* Hover lift */
  $$(".service, .tool, .about-card").forEach(item => {
    item.addEventListener("mouseenter", () => gsap.to(item, { y: -5, duration: .22, ease: "power2.out" }));
    item.addEventListener("mouseleave", () => gsap.to(item, { y: 0, duration: .28, ease: "power2.out" }));
  });

  /* Floating buttons entrance */
  gsap.from(".float-btn", { opacity: 0, scale: .3, y: 40, duration: .7, stagger: .15, delay: 1.6, ease: "back.out(1.8)", clearProps: "all" });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
