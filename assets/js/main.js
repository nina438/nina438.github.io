// 輕量視差與淡入效果
(function () {
  const layers = document.querySelectorAll('.parallax-layer');
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  const fadeEls = document.querySelectorAll('.fade-in');
  const navContainers = document.querySelectorAll('[data-site=\"nav\"]');
  const brandEls = document.querySelectorAll('[data-site=\"brand\"]');
  const footerEls = document.querySelectorAll('[data-site=\"footer\"]');
  const drawer = document.querySelector('[data-drawer]');
  const drawerOverlay = document.querySelector('[data-drawer-overlay]');
  const menuToggles = document.querySelectorAll('[data-menu-toggle]');

  const closeDrawer = () => {
    drawer?.classList.remove('open');
    drawerOverlay?.classList.remove('visible');
    menuToggles.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
  };

  const openDrawer = () => {
    drawer?.classList.add('open');
    drawerOverlay?.classList.add('visible');
    menuToggles.forEach((btn) => btn.setAttribute('aria-expanded', 'true'));
  };

  menuToggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const isOpen = drawer?.classList.contains('open');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  });

  drawerOverlay?.addEventListener('click', closeDrawer);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  const applyParallax = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    layers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.speed || '0.2');
      const y = scrollY * speed;
      layer.style.transform = `translateY(${y}px)`;
    });

    parallaxEls.forEach((el) => {
      const speed = parseFloat(el.dataset.speed || '0.15');
      const dir = el.dataset.dir || 'y';
      const delta = scrollY * speed;
      if (dir === 'x') {
        el.style.transform = `translateX(${delta}px)`;
      } else {
        el.style.transform = `translateY(${delta}px)`;
      }
    });
  };

  // 淡入觀察
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  fadeEls.forEach((el) => obs.observe(el));

  window.addEventListener('scroll', applyParallax, { passive: true });
  window.addEventListener('resize', applyParallax, { passive: true });
  applyParallax();

  // 站點設定載入
  fetch('data/site.json')
    .then((res) => res.json())
    .then((site) => {
      // 品牌
      brandEls.forEach((el) => {
        el.textContent = site.brand;
      });

      // 導覽
      navContainers.forEach((nav) => {
        const ul = document.createElement('ul');
        ul.setAttribute('role', 'list');
        site.nav.forEach((item) => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = item.href;
          a.textContent = item.text;
          li.appendChild(a);
          ul.appendChild(li);
        });
        nav.innerHTML = '';
        nav.appendChild(ul);
      });
      if (drawer) {
        drawer.querySelectorAll('a').forEach((a) => {
          a.addEventListener('click', closeDrawer);
        });
      }

      // Footer
      footerEls.forEach((el) => {
        el.textContent = `© ${site.footer.year} ${site.footer.name}`;
      });
      // Footer links同步 (取用聯絡區第一組 items 順序)
      const footerLinks = document.querySelectorAll('footer .list-inline a');
      const contactItems = site.contact && site.contact.blocks && site.contact.blocks[0] && site.contact.blocks[0].items;
      if (contactItems && footerLinks.length) {
        contactItems.forEach((item, idx) => {
          const link = footerLinks[idx];
          if (!link) return;
          link.href = item.href;
          link.textContent = item.text || item.label;
        });
      }

      // Text mapping helper
      const setText = (key, selector) => {
        const target = document.querySelector(`[data-site=\"${selector}\"]`);
        if (target && key) target.textContent = key;
      };

      // Hero / CTA / Transition / Cinematic / Featured
      setText(site.hero.tag, 'hero.tag');
      setText(site.hero.title, 'hero.title');
      setText(site.hero.desc, 'hero.desc');
      setText(site.cta.primary, 'cta.primary');
      setText(site.cta.secondary, 'cta.secondary');
      setText(site.transition.tag, 'transition.tag');
      setText(site.transition.title, 'transition.title');
      setText(site.transition.desc, 'transition.desc');
      setText(site.cinematic.tag, 'cinematic.tag');
      setText(site.cinematic.title, 'cinematic.title');
      setText(site.cinematic.desc, 'cinematic.desc');
      setText(site.featured.title, 'featured.title');
      setText(site.featured.desc, 'featured.desc');

      // About page
      setText(site.about.title, 'about.title');
      setText(site.about.desc, 'about.desc');
      const aboutBlocks = document.querySelectorAll('[data-site=\"about.blocks\"] .card');
      aboutBlocks.forEach((card, idx) => {
        const block = site.about.blocks[idx];
        if (!block) return;
        const h2 = card.querySelector('h2');
        const p = card.querySelector('p');
        if (h2) h2.textContent = block.title;
        if (p) p.textContent = block.text;
      });

      // Contact page
      setText(site.contact.title, 'contact.title');
      setText(site.contact.desc, 'contact.desc');
      const contactBlocks = document.querySelectorAll('[data-site=\"contact.blocks\"] .card');
      contactBlocks.forEach((card, idx) => {
        const block = site.contact.blocks[idx];
        if (!block) return;
        const h2 = card.querySelector('h2');
        if (h2) h2.textContent = block.title;
        const items = card.querySelectorAll('[data-item]');
        if (block.items && items.length) {
          block.items.forEach((item, i) => {
            const row = items[i];
            if (!row) return;
            const link = row.querySelector('a');
            if (link) {
              link.href = item.href;
              link.textContent = item.text || item.label;
            }
            const prefix = `${item.label}：`;
            const textNodes = Array.from(row.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE);
            if (textNodes.length) {
              textNodes[0].textContent = `${prefix} `;
            } else {
              row.insertBefore(document.createTextNode(`${prefix} `), row.firstChild);
            }
          });
        } else {
          const p = card.querySelector('p');
          if (p && block.text) p.textContent = block.text;
        }
      });

      // Gallery intro
      setText(site.galleryIntro.title, 'gallery.title');
      setText(site.galleryIntro.desc, 'gallery.desc');

      // Work page: Riverlight (示範)
      const work = site.work && site.work.riverlight;
      if (work) {
        setText(work.tag, 'work.riverlight.tag');
        setText(work.title, 'work.riverlight.title');
        setText(work.desc, 'work.riverlight.desc');
        setText(work.note, 'work.riverlight.note');
        const infoRows = document.querySelectorAll('[data-site=\"work.riverlight.info\"] .meta');
        infoRows.forEach((row, idx) => {
          const item = work.info[idx];
          if (!item) return;
          const tag = row.querySelector('.tag');
          const span = row.querySelector('span:last-child');
          if (tag) tag.textContent = item.label;
          if (span) span.textContent = item.value;
        });
      }
    })
    .catch((err) => {
      console.warn('無法載入站點設定檔', err);
    });
})();
