import './style.css'
import initChat from './chat.js'

document.addEventListener('DOMContentLoaded', () => {
  initChat();

  // Dynamic Year
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Scroll Animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  // Elements to animate
  const animatedElements = document.querySelectorAll('.section-title, .card, .hero-content, .about-content, .contact-info');

  animatedElements.forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });

  // Contact Form Submission
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;

      // Disable button and show loading state
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
      formStatus.textContent = '';
      formStatus.className = 'form-status';

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      try {
        // Actual API Endpoint
        const response = await fetch('https://n8n.jhowl.com/webhook/2a55d28f-0635-46b5-878b-0b64f388d363', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          formStatus.textContent = result.message || 'Message sent successfully!';
          formStatus.classList.add('success');
          contactForm.reset();
        } else {
          // API returns error message in 'error' or 'message' field
          const errorMessage = result.error || result.message || 'Failed to send message';
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        formStatus.textContent = error.message || 'Failed to send message. Please try again later or email me directly.';
        formStatus.classList.add('error');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
  }
});
