const cursor = document.querySelector('.cursor');
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const previewTitle = document.getElementById('preview-title');
const previewDescription = document.getElementById('preview-description');
const previewMeta = document.getElementById('preview-meta');
const previewLive = document.getElementById('preview-live');
const previewFrame = document.getElementById('preview-frame');
const projectCards = document.querySelectorAll('.project-card');
const navLinks = document.querySelectorAll('.site-nav a');
const contactForm = document.querySelector('.contact-form');
const toast = document.getElementById('toast');

window.addEventListener('pointermove', (event) => {
  if (cursor) {
    cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
  }
});

themeToggle?.addEventListener('click', () => {
  document.documentElement.classList.toggle('light');
  const isLight = document.documentElement.classList.contains('light');
  themeToggle.textContent = isLight ? '🌙' : '☀️';
});

menuToggle?.addEventListener('click', () => {
  document.body.classList.toggle('nav-open');
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => document.body.classList.remove('nav-open'));
});

const showToast = (message, isError = false) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 5000);
};

const updateProjectPreview = (card) => {
  if (!card || !previewTitle || !previewDescription || !previewMeta || !previewLive) return;
  const title = card.dataset.title;
  const description = card.dataset.description;
  const url = card.dataset.url;

  previewTitle.textContent = title || 'Live preview';
  previewDescription.textContent = description || '';
  previewMeta.textContent = url ? `Live preview available at ${new URL(url).host}` : '';
  previewLive.href = url || '#';

  if (previewFrame && url) {
    previewFrame.src = url;
  }

  projectCards.forEach((item) => item.classList.toggle('active', item === card));
};

projectCards.forEach((card) => {
  card.addEventListener('pointerenter', () => updateProjectPreview(card));
  card.addEventListener('click', () => updateProjectPreview(card));
});

if (projectCards.length > 0) {
  updateProjectPreview(projectCards[0]);
}

const appearObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.1,
  }
);

// Observe animate-up elements
const animateUpElements = document.querySelectorAll('.animate-up');
animateUpElements.forEach((element) => {
  // Check if already in viewport
  const rect = element.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    element.classList.add('visible');
  } else {
    appearObserver.observe(element);
  }
});

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const params = new URLSearchParams(formData);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: params.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast('Message saved! Thank you for reaching out.');
        contactForm.reset();
      } else {
        showToast('Could not save message. Please try again.', true);
      }
    } catch (error) {
      showToast('Error submitting form. Please try again.', true);
      console.error(error);
    }
  });
}
