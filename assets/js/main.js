// 輕量視差與淡入效果
(function () {
  const layers = document.querySelectorAll('.parallax-layer');
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  const fadeEls = document.querySelectorAll('.fade-in');

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
})();
