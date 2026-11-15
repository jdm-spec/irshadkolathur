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

// Default projects fallback.
// In index.html, the top 2 web, top 2 system, and top 2 posters are displayed.
// In works.html, all projects and remaining posters are displayed.
const WORKS = [
  // 1. Web Works (Top 2 for main homepage)
  { title: "Business Corporate Site",     category: "web",    label: "Web Development",       year: "2026", art: "linear-gradient(135deg,#1c1c1c,#3a0d10)", mark: "WEB", link: "https://example.com", format: "landscape", featured: true,  order: 1 },
  { title: "Agency Portfolio Platform",  category: "web",    label: "Responsive Web Dev",    year: "2026", art: "linear-gradient(135deg,#17202a,#0e1626)", mark: "DEV", link: "https://example.com", format: "landscape", featured: true,  order: 2 },

  // 2. System Management Works (Top 2 for main homepage)
  { title: "Enterprise Management System", category: "system", label: "Admin & Operations Hub", year: "2026", art: "linear-gradient(135deg,#101820,#1d2b3a)", mark: "SYS", format: "landscape", featured: true,  order: 3 },
  { title: "Inventory & CRM Dashboard",   category: "system", label: "Realtime Analytics",    year: "2026", art: "linear-gradient(135deg,#0c1a17,#122e28)", mark: "CRM", format: "landscape", featured: true,  order: 4 },

  // 3. Posters & Graphic Design (Top 2 for main homepage + remaining for all works page)
  { title: "Typography Event Poster",    category: "design", label: "Photoshop Creative",    year: "2026", art: "linear-gradient(135deg,#2a0a0c,#E52B32)", mark: "Ps",  format: "poster",    featured: true,  order: 5 },
  { title: "Cyberpunk Film Poster",      category: "design", label: "Visual Art & Poster",   year: "2026", art: "linear-gradient(135deg,#1d0d29,#571845)", mark: "Ps",  format: "poster",    featured: true,  order: 6 },
  { title: "Minimalist Brand Brochure",  category: "print",  label: "InDesign Layout",       year: "2026", art: "linear-gradient(135deg,#1a1a1a,#444444)", mark: "Id",  format: "poster",    featured: false, order: 7 },
  { title: "Concert Festival Poster",    category: "design", label: "Photoshop Poster",      year: "2026", art: "linear-gradient(135deg,#231505,#522e0a)", mark: "Ps",  format: "poster",    featured: false, order: 8 }
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
  let activeFilter = "all";

  function applyWorkFilter(f) {
    activeFilter = f;
    $$(".work").forEach(card => {
      const cat = card.dataset.cat;
      const isPoster = card.classList.contains("is-poster") || card.dataset.format === "poster";
      // If filtering by "design", show both design posters and print items
      const show = f === "all" || cat === f || (f === "design" && (cat === "design" || cat === "print" || isPoster));
      card.style.display = show ? "block" : "none";
      if (show && window.gsap) gsap.fromTo(card, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .5, ease: "power3.out" });
    });
  }

  function renderWorks(worksList) {
    if (!grid) return;
    if (!worksList || worksList.length === 0) {
      grid.innerHTML = `<div class="works-note">No projects to display yet.</div>`;
      return;
    }

    grid.innerHTML = worksList.map(w => {
      // Determine if item is a poster (format: "poster", category: "design", or "print")
      const isPoster = w.format === "poster" || w.category === "design" || w.category === "print" || !!w.isPoster;

      // Check if it's a website work with an active live URL
      const hasWebLink = !!w.link && (w.link.startsWith("http://") || w.link.startsWith("https://") || w.link.startsWith("//"));

      // Optimize image via ImageKit: posters use vertical dimensions (640x850), websites use landscape (720x450)
      let thumbUrl = "";
      if (typeof getImageKitUrl === "function" && w.image) {
        thumbUrl = isPoster
          ? getImageKitUrl(w.image, { width: 640, height: 850, quality: 85, format: "auto", crop: "maintain_ratio" })
          : getImageKitUrl(w.image, { width: 720, height: 450, quality: 85, format: "auto", crop: "maintain_ratio" });
      } else {
        thumbUrl = w.image || "";
      }

      // Link behavior:
      // If live website link is provided, click opens the live website directly
      // Otherwise opens WhatsApp inquiry for this project/poster
      const clickHref = hasWebLink
        ? w.link
        : waLink(`Hi Irshad, I saw your "${w.title}" ${isPoster ? "poster" : "project"} and I want something similar.`);

      const overlayText = hasWebLink
        ? "Visit Live Website ↗"
        : (isPoster ? "Request Poster / Design ↗" : "Request Similar ↗");

      return `
      <a class="work ${isPoster ? 'is-poster' : ''}" data-cat="${w.category || 'all'}" data-format="${isPoster ? 'poster' : 'landscape'}" target="_blank" rel="noopener"
         href="${clickHref}">
        <div class="work-thumb ${isPoster ? 'is-poster' : ''}">
          <div class="work-art" style="background:${thumbUrl ? `url('${thumbUrl}') center/cover` : (w.art || 'linear-gradient(135deg,#1c1c1c,#3a0d10)')}">
            ${thumbUrl ? "" : `<span>${w.mark || (isPoster ? 'Ps' : 'WEB')}</span>`}
          </div>
          <div class="work-over"><em>${overlayText}</em></div>
          <span class="work-tag">${w.year || new Date().getFullYear()}</span>
        </div>
        <div class="work-info">
          <div>
            <h3>${w.title}</h3>
            <p>${w.label || ''}</p>
            ${hasWebLink ? `
              <span class="work-site-badge" title="Live Website: ${w.link}">
                🌐 Live Site ↗
              </span>` : ''}
          </div>
          <b aria-hidden="true">↗</b>
        </div>
      </a>`;
    }).join("");

    // Apply currently active filter
    applyWorkFilter(activeFilter);

    // Rebind 3D tilt effects for newly inserted cards
    if (typeof window.rebindWorkCardEffects === "function") {
      window.rebindWorkCardEffects();
    }
  }

  /**
   * Filter the works list for the homepage:
   * Extracts top 2 websites, top 2 management systems, and top 2 creative posters (6 items total).
   */
  function extractMainWorks(list) {
    if (!Array.isArray(list)) return [];

    const isPosterItem = (w) =>
      w.format === "poster" || w.category === "design" || w.category === "print" || !!w.isPoster;

    const webItems = list.filter(w => w.category === "web" && !isPosterItem(w));
    const sysItems = list.filter(w => w.category === "system" && !isPosterItem(w));
    const posterItems = list.filter(w => isPosterItem(w));

    const sortFn = (a, b) => {
      const featA = a.featured !== false ? 1 : 0;
      const featB = b.featured !== false ? 1 : 0;
      if (featB !== featA) return featB - featA;
      return (Number(a.order) || 99) - (Number(b.order) || 99);
    };

    webItems.sort(sortFn);
    sysItems.sort(sortFn);
    posterItems.sort(sortFn);

    return [
      ...webItems.slice(0, 2),
      ...sysItems.slice(0, 2),
      ...posterItems.slice(0, 2)
    ];
  }

  /* ---------- Works filter listeners ---------- */
  $$("#filters button").forEach(btn => {
    btn.addEventListener("click", () => {
      $$("#filters button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyWorkFilter(btn.dataset.filter);
    });
  });

  /* ---------- Load projects (Default fallback + Dynamic Firestore sync) ---------- */
  const isAllWorksView = grid && grid.dataset.view === "all";

  async function loadPortfolioWorks() {
    // 1. Initial immediate render from default local array
    const initialList = isAllWorksView ? WORKS : extractMainWorks(WORKS);
    renderWorks(initialList);

    // 2. Fetch dynamic projects from Firebase Firestore / Realtime DB if available
    if (typeof window.fetchPortfolioWorks === "function") {
      try {
        const dynamicWorks = await window.fetchPortfolioWorks();
        if (dynamicWorks && dynamicWorks.length > 0) {
          const listToRender = isAllWorksView ? dynamicWorks : extractMainWorks(dynamicWorks);
          renderWorks(listToRender);
          if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        }
      } catch (err) {
        console.warn("[Portfolio] Using default works:", err);
      }
    }
  }

  loadPortfolioWorks();

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

  /* ---------- Contact form -> Firebase Firestore & WhatsApp ---------- */
  const form = $("#contactForm");
  const msg = $("#formMsg");
  const submitBtn = form ? form.querySelector("button[type='submit']") : null;
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : "";

  form.addEventListener("submit", async (e) => {
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

    const inquiryData = {
      name: f.name.value.trim(),
      contact: f.contact.value.trim(),
      type: f.type.value,
      budget: f.budget.value,
      details: f.details.value.trim()
    };

    const text =
`Hi Irshad, I'm contacting you from your portfolio.

*Name:* ${inquiryData.name}
*Contact:* ${inquiryData.contact}
*Project:* ${inquiryData.type}
*Budget:* ${inquiryData.budget}

*Details:*
${inquiryData.details}`;

    // Indicate progress & prevent double clicks
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px">Saving inquiry...</span>`;
    }
    msg.className = "form-msg";
    msg.textContent = "Processing inquiry...";

    // 1. Save to Firebase Firestore if connected
    let savedInDb = false;
    if (typeof window.saveContactInquiry === "function") {
      try {
        const res = await window.saveContactInquiry(inquiryData);
        if (res && res.success) {
          savedInDb = true;
        }
      } catch (dbErr) {
        console.warn("[Firebase] Could not save inquiry:", dbErr);
      }
    }

    // 2. Open WhatsApp conversation
    window.open(waLink(text), "_blank", "noopener");

    msg.className = "form-msg";
    msg.textContent = savedInDb
      ? "Inquiry recorded in database! Opening WhatsApp..."
      : "Opening WhatsApp. Just press send to deliver your message.";

    form.reset();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
    setTimeout(() => (msg.textContent = ""), 8000);
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

  /* Scroll reveals — reliable per-element triggers with safety fallback */
  const revealElements = $$(".reveal:not(.title)");
  revealElements.forEach(el => {
    // If element is already in the viewport or prefers-reduced-motion, reveal immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.filter = "none";
      return;
    }

    gsap.fromTo(el,
      { opacity: 0, y: 32, filter: "blur(4px)" },
      {
        opacity: 1, y: 0, filter: "blur(0px)",
        duration: .75, ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 96%",
          once: true,
          onEnter: () => gsap.set(el, { clearProps: "all" })
        }
      }
    );
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

  /* Global portfolio exports for admin & services */
  window.WORKS = WORKS;
  window.loadPortfolioWorks = loadPortfolioWorks;
  window.renderWorks = renderWorks;
})();
