/**
 * NINA STUDIO - Main JavaScript
 * Uses GSAP, Lenis, and Lucide for high-end interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lenis (Smooth Scroll)
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // 2. Custom Cursor Logic
  const cursor = document.getElementById('cursor');
  const cursorBlur = document.getElementById('cursor-blur');

  gsap.set(cursor, { xPercent: -50, yPercent: -50 });
  gsap.set(cursorBlur, { xPercent: -50, yPercent: -50 });

  window.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
    gsap.to(cursorBlur, { x: e.clientX, y: e.clientY, duration: 0.3 });
  });

  // Cursor Interactions
  const interactiveEls = document.querySelectorAll('a, button, .card, .banner-card');
  interactiveEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(cursorBlur, { scale: 1.5, borderColor: 'rgba(95, 124, 107, 0.5)', duration: 0.3 });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(cursorBlur, { scale: 1, borderColor: 'rgba(95, 124, 107, 1)', duration: 0.3 });
    });
  });

  // 3. Preloader & Initial Reveal
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    gsap.to(loader, {
      opacity: 0,
      duration: 1,
      delay: 0.5,
      onComplete: () => {
        loader.style.display = 'none';
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-loaded');
        initScrollAnimations();
      }
    });
  });

  // 4. Scroll Animations (GSAP ScrollTrigger)
  function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Fade in sections
    const fadeSections = document.querySelectorAll('.fade-in');
    fadeSections.forEach(section => {
      gsap.fromTo(section,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    });

    // Banner Parallax
    gsap.to(".track", {
      x: -200,
      scrollTrigger: {
        trigger: ".banner-rail",
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });

    // Parallax Layers
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    parallaxLayers.forEach(layer => {
      const speed = parseFloat(layer.dataset.speed || 0.1);
      gsap.to(layer, {
        y: 100 * speed,
        scrollTrigger: {
          trigger: ".parallax-shell",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });
  }

  // 5. Drawer / Menu Logic
  const drawer = document.querySelector('[data-drawer]');
  const drawerOverlay = document.querySelector('[data-drawer-overlay]');
  const menuToggles = document.querySelectorAll('[data-menu-toggle]');

  const toggleDrawer = (open) => {
    if (open) {
      drawer.classList.add('open');
      drawerOverlay.classList.add('visible');
      gsap.from(".drawer nav li", { x: -20, opacity: 0, stagger: 0.05, delay: 0.2 });
    } else {
      drawer.classList.remove('open');
      drawerOverlay.classList.remove('visible');
    }
  };

  menuToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('open');
      toggleDrawer(!isOpen);
    });
  });

  drawerOverlay.addEventListener('click', () => toggleDrawer(false));

  // 6. JSON Data Fetching (Legacy Sync)
  // Synchronizes the site content from data/site.json
  fetch('data/site.json')
    .then(res => res.json())
    .then(site => {
      updateSiteContent(site);
    })
    .catch(err => console.warn('Unable to load site.json', err));

  function updateSiteContent(site) {
    // Sync names and simple fields
    document.querySelectorAll('[data-site="brand"]').forEach(el => el.textContent = site.brand);
    document.querySelectorAll('[data-site="footer"]').forEach(el => el.textContent = `© ${site.footer.year} ${site.footer.name}`);

    const setText = (selector, text) => {
      const el = document.querySelector(`[data-site="${selector}"]`);
      if (el && text) el.textContent = text;
    };

    if (site.hero) {
      setText('hero.tag', site.hero.tag);
      setText('hero.title', site.hero.title);
      setText('hero.desc', site.hero.desc);
    }

    // Add more mapping as needed based on the index.html structure
  }
});
