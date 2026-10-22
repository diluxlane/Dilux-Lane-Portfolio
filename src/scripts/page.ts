const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const loader = document.getElementById('page-loader');
const finishLoading = () => {
  document.body.setAttribute('data-loaded', 'true');
  loader?.classList.add('loaded');
  window.setTimeout(() => loader?.remove(), reducedMotion ? 0 : 700);
};
if (reducedMotion) finishLoading();
else window.setTimeout(finishLoading, 1000);

// Animate words as DOM text, without injecting content as HTML.
document.querySelectorAll<HTMLElement>('[data-reveal="line"]').forEach((element) => {
  const text = element.textContent?.trim() || '';
  element.setAttribute('aria-label', text);
  element.replaceChildren();
  text.split(/\s+/).forEach((word, index) => {
    if (index) element.append(' ');
    const wrapper = document.createElement('span');
    wrapper.className = 'word';
    wrapper.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('span');
    inner.textContent = word;
    wrapper.append(inner);
    element.append(wrapper);
  });
});

const reveals = document.querySelectorAll('[data-reveal], .animate-on-scroll');
if (reducedMotion) {
  reveals.forEach((element) => element.classList.add('revealed', 'visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed', 'visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px' });
  reveals.forEach((element) => observer.observe(element));
}
